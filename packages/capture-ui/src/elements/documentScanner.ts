import { extractDocument, fromImageData, grayscale, toImageData } from "pixelvision";
import type { FoundDocument, Quad } from "pixelvision";
import { canvasPixels, canvasToBlob, imageToCanvas } from "../camera/frames";
import type { GrabbedFrame } from "../camera/frames";
import { parseBoolean, parseNumber } from "../logic/attributes";
import { zeroCanvas } from "../logic/disposal";
import {
  createDocumentFlow,
  defaultQuad,
  moveCorner,
  parseAspect,
  resolveAspect,
  scaleQuad,
} from "../logic/documentFlow";
import type { AspectPreset, DocumentFlow, DocumentFlowState } from "../logic/documentFlow.model";
import {
  containTransform,
  fromView,
  holeMask,
  round,
  roundedPolygonPath,
  toView,
  viewfinderPath,
} from "../logic/geometry";
import type { ViewTransform } from "../logic/geometry.model";
import { HAPTICS, vibrate } from "../logic/haptics";
import type { LabelKey } from "../logic/labels.model";
import {
  DOCUMENT_QUALITY,
  DOCUMENT_MEASURE,
  assessRegion,
  checkQuality,
  describeQuality,
  documentRegion,
  qualityHint,
} from "../logic/quality";
import type { QualityAssessment } from "../logic/quality.model";
import type { RunToken } from "../logic/runToken.model";
import { createSettledValue } from "../logic/settle";
import type { SettledValue } from "../logic/settle.model";
import { createPointsTracker } from "../logic/smoothing";
import { mainThreadDocumentFinder } from "../sources/document";
import { createInlineWorker } from "../sources/inlineWorker";
import type { DocumentFinder } from "../sources/source.model";
import { workerDocumentFinder } from "../sources/worker";
import { CaptureElement, SCRIM_BLEED } from "./captureElement";
import type { DetectDetail, DocumentCaptureDetail } from "./events.model";
import { documentStyles } from "./styles";

const ASPECTS: Array<[AspectPreset, LabelKey]> = [
  ["auto", "aspectAuto"],
  ["id-card", "aspectIdCard"],
  ["a4", "aspectA4"],
];
const CORNER_LABELS: LabelKey[] = [
  "cornerTopLeft",
  "cornerTopRight",
  "cornerBottomRight",
  "cornerBottomLeft",
];

/** A captured photo waiting for review. */
interface Shot {
  /** The photo, at most `max-pixels` pixels; its pixels are read again to re-straighten. */
  canvas: HTMLCanvasElement;
  /** Corners in the photo's pixels. */
  corners: Quad;
  /** The document region's quality in the last detection frame, when a document was found. */
  quality?: QualityAssessment;
  /** The straightened result for the current corners and aspect. */
  result?: { blob: Blob; image?: ImageData; aspectRatio?: number };
}

/**
 * `<pv-document-scanner>`: finds a document in the back camera's view,
 * outlines it with smoothly animated corners, captures it once it holds
 * still and passes the quality gate (sharp enough, not too dark, too
 * bright or washed out; otherwise a hint says what to fix), and shows it
 * straightened for review. The person can switch the
 * shape (auto, ID card, A4), drag the corners, retake or confirm.
 *
 * This captures and crops a document photo; it does not verify that the
 * document is genuine, unaltered or the applicant's.
 *
 * @example
 * <pv-document-scanner autostart aspect="id-card"></pv-document-scanner>
 */
export class DocumentScannerElement extends CaptureElement {
  static override get observedAttributes(): string[] {
    return [...CaptureElement.observedAttributes, "aspect"];
  }

  protected readonly facingMode = "environment" as const;
  protected readonly styles = documentStyles;
  protected readonly qualityDefaults = DOCUMENT_QUALITY;

  private finderValue: DocumentFinder | undefined;
  private activeFinder: DocumentFinder | undefined;
  private finderKind = "";
  private flow: DocumentFlow | undefined;
  private flowState: DocumentFlowState | undefined;
  private readonly tracker = createPointsTracker({ halfLifeMs: 80 });
  private lastFound: { corners: Quad; area: number } | undefined;
  private lastArea = 0;
  private shot: Shot | undefined;
  private adjustCorners: Quad | undefined;
  private capturing = false;
  private lastQuality: QualityAssessment | undefined;
  private qualityHintValue: SettledValue<LabelKey | undefined> = createSettledValue<
    LabelKey | undefined
  >(undefined);
  private shownMessage: LabelKey | undefined;

  private svg!: SVGSVGElement;
  private scrim!: HTMLDivElement;
  private viewfinder!: SVGPathElement;
  private quad!: SVGPathElement;
  private handles!: SVGCircleElement[];
  private holdFill!: SVGCircleElement;
  private shutter!: HTMLButtonElement;
  private review!: HTMLDivElement;
  private resultImage!: HTMLImageElement;
  private reviewText!: HTMLParagraphElement;
  private aspectGroup!: HTMLDivElement;
  private retakeButton!: HTMLButtonElement;
  private adjustButton!: HTMLButtonElement;
  private confirmButton!: HTMLButtonElement;
  private adjust!: HTMLDivElement;
  private adjustSvg!: SVGSVGElement;
  private adjustQuad!: SVGPathElement;
  private adjustText!: HTMLParagraphElement;
  private adjustHint!: HTMLParagraphElement;
  private applyButton!: HTMLButtonElement;
  private cornerButtons!: HTMLButtonElement[];

  /** Replace how documents are found (e.g. your own worker). Defaults to pixelvision's `findDocument`. */
  get finder(): DocumentFinder | undefined {
    return this.finderValue;
  }

  set finder(value: DocumentFinder | undefined) {
    if (this.activeFinder && this.activeFinder !== this.finderValue) this.activeFinder.dispose?.();
    this.finderValue = value;
    this.activeFinder = undefined;
  }

  /** The shape preset used to straighten the document. */
  get aspect(): AspectPreset {
    return parseAspect(this.getAttribute("aspect"));
  }

  set aspect(value: AspectPreset) {
    this.setAttribute("aspect", value);
  }

  /** The latest detected corners in camera-frame pixels, or undefined. */
  get corners(): Quad | undefined {
    return this.lastFound?.corners;
  }

  private get autoCapture(): boolean {
    return parseBoolean(this.getAttribute("auto-capture"), true);
  }

  private get reviewEnabled(): boolean {
    return parseBoolean(this.getAttribute("review"), true);
  }

  protected stageMarkup(): string {
    return `
      <div class="scrim" part="overlay"></div>
      <svg class="overlay" aria-hidden="true">
        <path class="viewfinder" part="viewfinder"></path>
        <path class="quad" part="quad"></path>
        <circle class="handle" part="handle" r="7"></circle>
        <circle class="handle" part="handle" r="7"></circle>
        <circle class="handle" part="handle" r="7"></circle>
        <circle class="handle" part="handle" r="7"></circle>
      </svg>
      <svg class="hold" part="hold-ring" viewBox="0 0 56 56" aria-hidden="true">
        <circle class="track" cx="28" cy="28" r="24"></circle>
        <circle class="fill" cx="28" cy="28" r="24" pathLength="100"></circle>
      </svg>
      <button type="button" class="shutter" part="button shutter" hidden></button>
      <section class="review" part="review" hidden>
        <div class="result-frame"><img part="result-image" alt=""></div>
        <div class="review-bar">
          <p></p>
          <div class="segmented" part="aspect" role="radiogroup"></div>
          <div class="actions">
            <button type="button" part="button retake"></button>
            <button type="button" part="button adjust"></button>
            <button type="button" class="primary" part="button button-primary confirm"></button>
          </div>
        </div>
      </section>
      <section class="adjust" part="adjust" hidden>
        <svg class="overlay" aria-hidden="true"><path class="quad" part="quad"></path></svg>
        <div class="adjust-bar">
          <p class="adjust-text"></p>
          <p class="sr-only" id="pv-corner-hint"></p>
          <button type="button" class="primary" part="button button-primary apply"></button>
        </div>
      </section>`;
  }

  protected setup(): void {
    const q = <T extends Element>(selector: string, root: ParentNode = this.stage) =>
      root.querySelector(selector) as T;
    this.svg = q("svg.overlay");
    this.scrim = q(".scrim");
    this.viewfinder = q(".viewfinder");
    this.quad = q(".quad");
    this.handles = Array.from(this.svg.querySelectorAll<SVGCircleElement>(".handle"));
    this.holdFill = q(".hold .fill");
    this.shutter = q(".shutter");
    this.review = q(".review");
    this.resultImage = q(".review img");
    this.reviewText = q(".review-bar p");
    this.aspectGroup = q(".segmented");
    const [retake, adjust, confirm] = Array.from(this.review.querySelectorAll("button")).slice(-3);
    this.retakeButton = retake;
    this.adjustButton = adjust;
    this.confirmButton = confirm;
    this.adjust = q(".adjust");
    this.adjustSvg = q("svg", this.adjust);
    this.adjustQuad = q(".quad", this.adjust);
    this.adjustText = q(".adjust-bar p", this.adjust);
    this.adjustHint = q("#pv-corner-hint", this.adjust);
    this.applyButton = q(".adjust-bar button", this.adjust);

    this.aspectGroup.replaceChildren(
      ...ASPECTS.map(([value]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "radio");
        button.setAttribute("part", "aspect-option");
        button.dataset.value = value;
        button.addEventListener("click", () => {
          this.aspect = value;
        });
        button.addEventListener("keydown", (event) => this.onAspectKey(event));
        return button;
      }),
    );

    this.cornerButtons = CORNER_LABELS.map((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "corner";
      button.setAttribute("part", "corner");
      button.setAttribute("aria-describedby", "pv-corner-hint");
      this.bindCorner(button, index);
      this.adjust.insertBefore(button, this.adjust.querySelector(".adjust-bar"));
      return button;
    });

    this.shutter.addEventListener("click", () => void this.capture());
    this.retakeButton.addEventListener("click", () => this.retake());
    this.adjustButton.addEventListener("click", () => this.openAdjust());
    this.confirmButton.addEventListener("click", () => void this.confirm());
    this.applyButton.addEventListener("click", () => void this.applyAdjust());
  }

  protected showIntro(): void {
    const t = this.text;
    this.showPanel(t.docIntroTitle, t.docIntroBody, [
      { label: t.start, primary: true, action: () => void this.start() },
    ]);
  }

  protected renderText(): void {
    if (!this.ready) return;
    const t = this.text;
    this.video.setAttribute("aria-label", t.previewLabel);
    this.shutter.setAttribute("aria-label", t.capture);
    this.shutter.title = t.capture;
    this.retakeButton.textContent = t.retake;
    this.adjustButton.textContent = t.adjust;
    this.confirmButton.textContent = t.confirm;
    this.applyButton.textContent = t.adjustDone;
    this.reviewText.textContent = t.docReview;
    this.adjustText.textContent = t.docAdjust;
    this.adjustHint.textContent = t.cornerHint;
    this.aspectGroup.setAttribute("aria-label", t.aspectLabel);
    Array.from(this.aspectGroup.children).forEach((button, i) => {
      button.textContent = t[ASPECTS[i][1]];
    });
    this.cornerButtons.forEach((button, i) =>
      button.setAttribute("aria-label", t[CORNER_LABELS[i]]),
    );
    this.renderAspect();
    if (this.viewState === "live" && this.flowState)
      this.setInstruction(t[this.flowState.message], false);
  }

  override attributeChangedCallback(name: string): void {
    super.attributeChangedCallback(name);
    if (!this.ready || name !== "aspect") return;
    this.renderAspect();
    if (this.shot && this.viewState === "review") void this.straighten();
  }

  private renderAspect(): void {
    const current = this.aspect;
    Array.from(this.aspectGroup.children).forEach((button) => {
      const checked = (button as HTMLElement).dataset.value === current;
      button.setAttribute("aria-checked", String(checked));
      (button as HTMLElement).tabIndex = checked ? 0 : -1;
    });
  }

  /** Arrow keys move the selection inside the radio group. */
  private onAspectKey(event: KeyboardEvent): void {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = ASPECTS.findIndex(([value]) => value === this.aspect);
    const next = ASPECTS[(index + step + ASPECTS.length) % ASPECTS.length][0];
    this.aspect = next;
    (this.aspectGroup.querySelector(`[data-value="${next}"]`) as HTMLElement).focus();
  }

  protected layout(): void {
    if (!this.ready || !this.viewWidth || !this.viewHeight) return;
    const { viewWidth: w, viewHeight: h } = this;
    this.svg.setAttribute("viewBox", `0 0 ${round(w)} ${round(h)}`);
    this.adjustSvg.setAttribute("viewBox", `0 0 ${round(w)} ${round(h)}`);
    this.viewfinder.setAttribute("d", viewfinderPath(w, h, Math.min(w, h) * 0.08));
    if (this.viewState === "adjust") this.renderAdjust();
  }

  protected onStarted(): void {
    this.flow = createDocumentFlow({
      holdFrames: parseNumber(this.getAttribute("hold-frames"), 8, 1, 120),
    });
    this.flowState = undefined;
    this.tracker.reset();
    this.lastFound = undefined;
    this.lastQuality = undefined;
    this.qualityHintValue = createSettledValue<LabelKey | undefined>(undefined, {
      delayMs: parseNumber(this.getAttribute("hint-delay"), 700, 0, 5000),
      minHoldMs: parseNumber(this.getAttribute("hint-hold"), 1500, 0, 10_000),
    });
    this.shownMessage = "docSearching";
    this.capturing = false;
    this.shutter.hidden = false;
    this.container.dataset.phase = "searching";
    this.setHold(0);
    this.setInstruction(this.text.docSearching);
  }

  protected onStopped(): void {
    this.activeFinder?.dispose?.();
    this.activeFinder = undefined;
    this.tracker.reset();
    this.shutter.hidden = true;
    this.quad.removeAttribute("d");
  }

  protected clearCaptures(): void {
    this.discardShot();
    this.lastFound = undefined;
    this.adjustCorners = undefined;
  }

  /** Builds the finder on first use: the built-in worker where possible. */
  private ensureFinder(): DocumentFinder {
    if (this.activeFinder) return this.activeFinder;
    if (this.finderValue) {
      this.finderKind = "custom";
      this.activeFinder = this.finderValue;
      return this.activeFinder;
    }
    const worker = parseBoolean(this.getAttribute("worker"), true)
      ? createInlineWorker()
      : undefined;
    this.finderKind = worker ? "findDocument (worker)" : "findDocument (main thread)";
    this.activeFinder = worker ? workerDocumentFinder(worker) : mainThreadDocumentFinder();
    return this.activeFinder;
  }

  protected async processFrame(frame: GrabbedFrame, token: RunToken): Promise<void> {
    const finder = this.ensureFinder();
    let found: FoundDocument | null;
    try {
      found = await finder.find(frame.image);
    } catch (error) {
      if (!token.current) return;
      if (finder === this.activeFinder && this.finderKind === "findDocument (worker)") {
        // The worker failed to start (a strict Content Security Policy): find on the main thread.
        finder.dispose?.();
        this.activeFinder = mainThreadDocumentFinder();
        this.finderKind = "findDocument (main thread)";
        return;
      }
      throw error;
    }
    if (!token.current || !this.flow || this.paused) return;
    // Corners in video pixels; the flow smooths them (median, stray and missed-frame tolerant).
    const detected = found ? scaleQuad(found.corners, frame.scale) : undefined;
    const previous = this.flowState;
    const state = this.flow.update(detected);
    this.flowState = state;
    const corners = state.corners;
    if (found) this.lastArea = found.area;
    this.lastFound = corners ? { corners, area: this.lastArea } : undefined;
    // The quality gate, on the document and a margin around it in the detection frame.
    const quality =
      corners &&
      assessRegion(
        grayscale(frame.image),
        documentRegion(scaleQuad(corners, 1 / frame.scale)),
        DOCUMENT_MEASURE,
      );
    this.lastQuality = quality;
    const issue = quality ? checkQuality(quality, this.qualityThresholds).issue : null;
    const hint = this.qualityHintValue.update(qualityHint(issue, "document"), performance.now());
    const message = hint ?? state.message;
    const t = this.viewTransform();
    this.tracker.setTarget(corners?.map((p) => toView(p, t)));
    // Steady but not good enough yet: keep the "hold" look instead of "ready".
    this.container.dataset.phase = state.phase === "ready" && issue ? "holding" : state.phase;
    this.setHold(state.progress);
    this.setInstruction(this.text[message], this.shownMessage !== message);
    this.shownMessage = message;
    this.emit<DetectDetail>("pv-detect", {
      corners: corners ?? null,
      area: corners ? this.lastArea : undefined,
      progress: state.progress,
      stable: state.phase === "ready",
    });
    if (state.phase === "holding" && previous?.phase === "searching") vibrate(HAPTICS.step);
    if (state.phase === "ready" && !issue && this.autoCapture && !this.capturing) {
      await this.capture();
    }
  }

  private setHold(progress: number): void {
    this.holdFill.style.strokeDashoffset = String(round(100 - progress * 100));
  }

  protected drawFrame(now: number): void {
    const shown = this.tracker.step(now);
    if (!shown) {
      if (this.quad.hasAttribute("d")) this.quad.removeAttribute("d");
      this.handles.forEach((h) => (h.style.opacity = "0"));
      this.scrim.style.removeProperty("mask-image");
      this.scrim.style.removeProperty("-webkit-mask-image");
      this.scrim.style.opacity = "0";
    } else {
      const path = roundedPolygonPath(shown.points, 10);
      this.quad.setAttribute("d", path);
      this.quad.style.opacity = String(round(shown.opacity));
      shown.points.forEach((p, i) => {
        const handle = this.handles[i];
        handle.setAttribute("cx", String(round(p.x)));
        handle.setAttribute("cy", String(round(p.y)));
        handle.style.opacity = String(round(shown.opacity));
      });
      const bleed = SCRIM_BLEED;
      const shifted = shown.points.map((p) => ({ x: p.x + bleed, y: p.y + bleed }));
      const mask = holeMask(
        this.viewWidth + bleed * 2,
        this.viewHeight + bleed * 2,
        roundedPolygonPath(shifted, 10),
      );
      this.scrim.style.setProperty("mask-image", mask);
      this.scrim.style.setProperty("-webkit-mask-image", mask);
      this.scrim.style.opacity = String(round(shown.opacity));
    }
    if (this.debug) {
      this.debugView.textContent = [
        `finder    ${this.finderKind}`,
        `phase     ${this.flowState?.phase ?? "-"}`,
        `area      ${this.lastFound ? this.lastFound.area.toFixed(2) : "-"}`,
        `hold      ${Math.round((this.flowState?.progress ?? 0) * 100)}%`,
        `quality   ${describeQuality(this.lastQuality, this.qualityThresholds)}`,
      ].join("\n");
    }
  }

  /**
   * Captures the current frame with the detected corners (or a default
   * frame when none was found) and shows the review. Without review
   * (`review="off"`), fires `pv-capture` straight away.
   *
   * @returns Resolves once the review shows.
   */
  async capture(): Promise<void> {
    const token = this.token;
    if (!this.running || this.capturing || !token?.current) return;
    this.capturing = true;
    this.paused = true;
    // The photo at full resolution (bounded by max-pixels); the smoothed corners come from the
    // detection frames in video pixels and are scaled to it.
    const { canvas, scale } = this.snapshotVideo();
    const found = this.lastFound?.corners;
    const corners = found ? scaleQuad(found, scale) : defaultQuad(canvas.width, canvas.height);
    this.discardShot();
    this.shot = { canvas, corners, quality: found ? this.lastQuality : undefined };
    vibrate(HAPTICS.success);
    await this.straighten();
    if (!token.current || !this.shot) return;
    if (!this.reviewEnabled) {
      await this.confirm();
      return;
    }
    this.showReview();
  }

  /** Straightens the shot with its corners and the chosen aspect. */
  private async straighten(): Promise<void> {
    const shot = this.shot;
    if (!shot) return;
    const aspectRatio = resolveAspect(this.aspect, shot.corners);
    const flat = extractDocument(fromImageData(canvasPixels(shot.canvas)), shot.corners, {
      aspectRatio,
    });
    const canvas = imageToCanvas(toImageData(flat));
    let blob: Blob;
    let image: ImageData | undefined;
    try {
      blob = await canvasToBlob(canvas);
      image = this.includeImageData ? canvasPixels(canvas) : undefined;
    } finally {
      zeroCanvas(canvas);
    }
    if (shot !== this.shot) return;
    shot.result = image ? { blob, image, aspectRatio } : { blob, aspectRatio };
    void this.showBlob(this.resultImage, blob);
  }

  private showReview(): void {
    this.setViewState("review");
    this.review.hidden = false;
    this.adjust.hidden = true;
    this.setInstruction("", false);
    this.announce(this.text.docReview);
    this.renderAspect();
    this.confirmButton.focus();
  }

  /** Back to the live camera. */
  private retake(): void {
    this.discardShot();
    this.review.hidden = true;
    this.adjust.hidden = true;
    if (this.running) {
      this.setViewState("live");
      this.paused = false;
      this.onStarted();
    } else {
      void this.start();
    }
  }

  private openAdjust(): void {
    if (!this.shot) return;
    this.adjustCorners = this.shot.corners.map((p) => ({ ...p })) as Quad;
    this.setViewState("adjust");
    this.review.hidden = true;
    this.adjust.hidden = false;
    const still = this.shot.canvas;
    still.classList.add("still");
    still.setAttribute("part", "still");
    still.setAttribute("aria-hidden", "true");
    this.adjust.prepend(still);
    this.announce(this.text.docAdjust);
    this.renderAdjust();
    this.cornerButtons[0].focus();
  }

  private adjustTransform(): ViewTransform {
    const { canvas } = this.shot!;
    return containTransform(canvas.width, canvas.height, this.viewWidth, this.viewHeight);
  }

  private renderAdjust(): void {
    if (!this.shot || !this.adjustCorners) return;
    const t = this.adjustTransform();
    const points = this.adjustCorners.map((p) => toView(p, t));
    this.adjustQuad.setAttribute("d", roundedPolygonPath(points, 6));
    points.forEach((p, i) => {
      this.cornerButtons[i].style.transform = `translate(${round(p.x)}px, ${round(p.y)}px)`;
    });
  }

  private bindCorner(button: HTMLButtonElement, index: number): void {
    button.addEventListener("pointerdown", (event) => {
      if (!this.shot) return;
      button.setPointerCapture(event.pointerId);
      const rect = this.getBoundingClientRect();
      const move = (e: PointerEvent) => {
        const t = this.adjustTransform();
        const to = fromView({ x: e.clientX - rect.left, y: e.clientY - rect.top }, t);
        this.adjustCorners = moveCorner(
          this.adjustCorners!,
          index,
          to,
          this.shot!.canvas.width,
          this.shot!.canvas.height,
        );
        this.renderAdjust();
      };
      const up = () => {
        button.removeEventListener("pointermove", move);
        button.removeEventListener("pointerup", up);
        button.removeEventListener("pointercancel", up);
      };
      button.addEventListener("pointermove", move);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
    });
    button.addEventListener("keydown", (event) => {
      const delta = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key];
      if (!delta || !this.shot || !this.adjustCorners) return;
      event.preventDefault();
      const { width, height } = this.shot.canvas;
      const step = (Math.min(width, height) / 200) * (event.shiftKey ? 8 : 1);
      const p = this.adjustCorners[index];
      this.adjustCorners = moveCorner(
        this.adjustCorners,
        index,
        { x: p.x + delta[0] * step, y: p.y + delta[1] * step },
        width,
        height,
      );
      this.renderAdjust();
    });
  }

  private async applyAdjust(): Promise<void> {
    if (!this.shot || !this.adjustCorners) return;
    this.shot.corners = this.adjustCorners;
    try {
      await this.straighten();
    } catch {
      // Three corners on a line can't be straightened; keep the previous result.
    }
    this.shot.canvas.remove();
    this.showReview();
  }

  /**
   * Fires `pv-capture` (on the element only) with the straightened document and stops the
   * camera. The element then keeps no reference to the photo or the result; the shown result
   * stays visible until retake, reset or `clearSensitiveData()`.
   */
  private async confirm(): Promise<void> {
    const shot = this.shot;
    if (!shot?.result) return;
    const { blob, image, aspectRatio } = shot.result;
    const detail: DocumentCaptureDetail = {
      blob,
      ...(image ? { image } : {}),
      corners: shot.corners,
      aspect: this.aspect,
      aspectRatio,
      source: { width: shot.canvas.width, height: shot.canvas.height },
      quality: shot.quality,
    };
    this.stop();
    // Hand-off: free the photo and drop the result; only the decoded preview remains.
    zeroCanvas(shot.canvas);
    shot.canvas.remove();
    this.shot = undefined;
    this.lastFound = undefined;
    this.setViewState("done");
    this.hidePanel();
    this.review.hidden = false;
    this.adjust.hidden = true;
    this.retakeButton.hidden = false;
    this.adjustButton.hidden = true;
    this.confirmButton.hidden = true;
    this.aspectGroup.hidden = true;
    this.emitPayload<DocumentCaptureDetail>("pv-capture", detail);
  }

  /**
   * Starts over and clears the previous capture (see `clearSensitiveData`): back to the live
   * camera when it runs, otherwise to the intro.
   */
  reset(): void {
    if (!this.ready) return;
    this.clearSensitiveData();
    this.adjustButton.hidden = false;
    this.confirmButton.hidden = false;
    this.aspectGroup.hidden = false;
    if (this.running) {
      this.retake();
      return;
    }
    this.discardShot();
    this.review.hidden = true;
    this.adjust.hidden = true;
    this.setViewState("intro");
    this.setInstruction("", false);
    this.showIntro();
  }

  /** Frees the shot's photo and removes the shown result. */
  private discardShot(): void {
    zeroCanvas(this.shot?.canvas);
    this.shot?.canvas.remove();
    this.shot = undefined;
    this.resultImage.removeAttribute("src");
  }

  override async start(): Promise<void> {
    if (this.ready) {
      this.review.hidden = true;
      this.adjust.hidden = true;
      this.adjustButton.hidden = false;
      this.confirmButton.hidden = false;
      this.aspectGroup.hidden = false;
    }
    await super.start();
  }
}
