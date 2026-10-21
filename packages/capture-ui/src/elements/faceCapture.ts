import { grayscale } from "pixelvision";
import type { HeadPose, HeadPoseCascades } from "pixelvision";
import { canvasPixels, canvasToBlob, context2d, createCanvas } from "../camera/frames";
import type { GrabbedFrame } from "../camera/frames";
import { parseBoolean, parseNumber, parseRatio, parseShape } from "../logic/attributes";
import { fitToPixels } from "../logic/captureSize";
import { zeroCanvas } from "../logic/disposal";
import { createFaceFlow, turnProgress } from "../logic/faceFlow";
import type { FaceFlow, FaceFlowState, TurnHint } from "../logic/faceFlow.model";
import {
  assessFace,
  boxToView,
  bracketsPath,
  guideFor,
  guidePath,
  holeMask,
  inflateGuide,
  round,
  toView,
} from "../logic/geometry";
import type { Box, Guide } from "../logic/geometry.model";
import type { LabelKey } from "../logic/labels.model";
import { HAPTICS, vibrate } from "../logic/haptics";
import { formatLabel } from "../logic/labels";
import { sharpness } from "../logic/sharpness";
import { createBoxSmoother } from "../logic/boxSmoother";
import type { RunToken } from "../logic/runToken.model";
import { createEasedNumber, createPointsTracker } from "../logic/smoothing";
import { createDefaultPoseSource, loadCascades } from "../sources/faceSource";
import { createInlineWorker } from "../sources/inlineWorker";
import type { DetectFace, PoseSource } from "../sources/source.model";
import { CaptureElement, SCRIM_BLEED } from "./captureElement";
import type {
  CompleteDetail,
  DetectorDetail,
  FaceCaptureDetail,
  FaceCaptureMetadata,
  PoseDetail,
  StepDetail,
} from "./events.model";
import { faceStyles } from "./styles";

const SVG_NS = "http://www.w3.org/2000/svg";

/** The best frontal frame seen so far, at most `max-pixels` pixels. */
interface BestFrame {
  canvas: HTMLCanvasElement;
  score: number;
  /** Face box in the canvas's pixels. */
  box: Box;
  pose: HeadPose;
}

/**
 * `<pv-face-capture>`: a selfie flow with an oval face guide, a progress
 * ring, a smoothed face tracker and pixelvision's head-turn challenge.
 * Captures the sharpest frontal frame when done.
 *
 * The head-turn challenge is a client-side capture aid, not liveness or
 * presentation-attack detection; see {@link FaceCaptureMetadata.challengePassed}.
 *
 * Detection runs on pixelvision's HAAR cascades by default (in a worker
 * where possible), or on any `source` you set, such as
 * `neuralPoseSource` with `@pixelvision/face-neural`.
 *
 * @example
 * <pv-face-capture autostart></pv-face-capture>
 * <script type="module">
 *   import "@pixelvision/capture-ui";
 *   document.querySelector("pv-face-capture")
 *     .addEventListener("pv-capture", (e) => upload(e.detail.blob));
 * </script>
 */
export class FaceCaptureElement extends CaptureElement {
  static override get observedAttributes(): string[] {
    return [
      ...CaptureElement.observedAttributes,
      "guide-shape",
      "guide-aspect",
      "steps",
      "show-landmarks",
    ];
  }

  protected readonly facingMode = "user" as const;
  protected readonly styles = faceStyles;

  private sourceValue: PoseSource | undefined;
  private cascadesValue: HeadPoseCascades | undefined;
  private activeSource: PoseSource | undefined;
  private flow: FaceFlow | undefined;
  private flowState: FaceFlowState | undefined;
  private guide: Guide | undefined;
  // Smoothed hard, and frozen through brief detection gaps instead of blinking.
  private readonly tracker = createPointsTracker({ halfLifeMs: 160, fadeMs: 400, holdMs: 1200 });
  // Fills briskly, drains slowly: progress never jumps backwards.
  private readonly ringFill = createEasedNumber({ halfLifeMs: 180, fallHalfLifeMs: 900 });
  private boxSmoother = createBoxSmoother();
  private lastLandmarks: Array<{ x: number; y: number }> = [];
  private messageShownAt = 0;
  private wasAccepted = false;
  private readonly gaugeFill = createEasedNumber({ halfLifeMs: 120 });
  private preciseLoader: (() => Promise<PoseSource | DetectFace>) | undefined;
  private preciseState: "idle" | "loading" | "failed" = "idle";
  private shownMessage: LabelKey | undefined;
  private shownHint: LabelKey | undefined;
  private swapTimer: ReturnType<typeof setTimeout> | undefined;
  private hintTimer: ReturnType<typeof setTimeout> | undefined;
  private lastYaw: number | undefined;
  private best: BestFrame | undefined;
  private lastPose: PoseDetail | undefined;
  private detections = 0;
  private sourceKind = "";

  private svg!: SVGSVGElement;
  private scrim!: HTMLDivElement;
  private guideEl!: SVGPathElement;
  private ringTrack!: SVGPathElement;
  private ring!: SVGPathElement;
  private trackerEl!: SVGPathElement;
  private landmarksEl!: SVGGElement;
  private hintLeft!: SVGGElement;
  private hintRight!: SVGGElement;
  private successEl!: SVGGElement;
  private still!: HTMLImageElement;
  private stepsEl!: HTMLDivElement;
  private hintEl!: HTMLSpanElement;
  private preciseButton!: HTMLButtonElement;
  private turnGuide!: SVGGElement;
  private gauge!: SVGGElement;
  private gaugeFillEl!: SVGPathElement;
  private shutter!: HTMLButtonElement;
  private retake!: HTMLButtonElement;

  /**
   * The face detector: a {@link PoseSource} or a bare detect function.
   * When unset, pixelvision's HAAR cascades are used.
   */
  get source(): PoseSource | DetectFace | undefined {
    return this.sourceValue;
  }

  set source(value: PoseSource | DetectFace | undefined) {
    this.sourceValue = typeof value === "function" ? { detect: value } : value;
    this.replaceSource();
    // A directional source changes the instructions: start the steps over with it.
    if (this.running && this.viewState === "live") this.onStarted();
  }

  /**
   * Loads a more precise detector on request, e.g. YuNet through
   * {@link loadNeuralPoseSource}. When set, and while the default HAAR
   * detector is used, a "Use precise detection" button appears once a step
   * stalls; pressing it loads this source and starts the steps over.
   */
  get preciseSource(): (() => Promise<PoseSource | DetectFace>) | undefined {
    return this.preciseLoader;
  }

  set preciseSource(value: (() => Promise<PoseSource | DetectFace>) | undefined) {
    this.preciseLoader = value;
    this.preciseState = "idle";
    this.renderPrecise();
  }

  /** Switches to {@link preciseSource} now. */
  async usePreciseSource(): Promise<void> {
    if (!this.preciseLoader || this.preciseState === "loading") return;
    this.preciseState = "loading";
    this.renderPrecise();
    try {
      const source = await this.preciseLoader();
      this.preciseState = "idle";
      this.source = source;
      this.emit<DetectorDetail>("pv-detector", { name: this.sourceValue?.name ?? "custom" });
    } catch {
      // Keep the current detector; hide the offer rather than retrying in a loop.
      this.preciseState = "failed";
    }
    this.renderPrecise();
  }

  /**
   * HAAR cascades for the default detector. When neither this nor
   * `source` is set, the cascades are loaded from
   * `pixelvision/cascades/frontal-face` and `profile-face` on start.
   */
  get cascades(): HeadPoseCascades | undefined {
    return this.cascadesValue;
  }

  set cascades(value: HeadPoseCascades | undefined) {
    this.cascadesValue = value;
    this.replaceSource();
  }

  /** The flow's current state, or undefined before the camera starts. */
  get state(): FaceFlowState | undefined {
    return this.flowState;
  }

  private get steps(): boolean {
    return parseBoolean(this.getAttribute("steps"), true);
  }

  private get autoCapture(): boolean {
    return parseBoolean(this.getAttribute("auto-capture"), true);
  }

  private get showLandmarks(): boolean {
    return parseBoolean(this.getAttribute("show-landmarks"), false);
  }

  protected stageMarkup(): string {
    return `
      <img class="still" part="still" alt="" hidden>
      <div class="scrim" part="overlay"></div>
      <svg class="overlay" aria-hidden="true">
        <path class="ring-track"></path>
        <path class="ring" part="ring" pathLength="100"></path>
        <path class="guide" part="guide"></path>
        <path class="tracker" part="tracker"></path>
        <g class="landmarks" part="landmarks"></g>
        <g class="hint" part="hint" data-side="left"><g class="chevrons"><path d="M 10 -18 L -4 0 L 10 18"/><path d="M 26 -18 L 12 0 L 26 18" opacity="0.5"/></g></g>
        <g class="hint" part="hint" data-side="right"><g class="chevrons"><path d="M -10 -18 L 4 0 L -10 18"/><path d="M -26 -18 L -12 0 L -26 18" opacity="0.5"/></g></g>
        <g class="turn-guide" part="turn-guide">
          <g class="gauge" part="turn-gauge" hidden>
            <path class="gauge-track"></path>
            <path class="gauge-fill"></path>
          </g>
          <circle class="turn-head" r="17"></circle>
          <g class="turn-face">
            <circle cx="-6" cy="-4" r="2.2"></circle>
            <circle cx="6" cy="-4" r="2.2"></circle>
            <path class="nose" d="M 0 -1 L -2 6 L 1.5 6"></path>
          </g>
          <path class="turn-arrow" data-dir="left" d="M -30 0 H -44 M -38 -6 L -44 0 L -38 6"></path>
          <path class="turn-arrow" data-dir="right" d="M 30 0 H 44 M 38 -6 L 44 0 L 38 6"></path>
        </g>
        <g class="success" part="success">
          <circle class="check-disc" r="30"></circle>
          <path class="check" pathLength="100" d="M -13 1 L -4 10 L 14 -9"></path>
        </g>
      </svg>
      <button type="button" class="primary shutter" part="button button-primary shutter" hidden></button>
      <div class="done-actions" hidden><button type="button" part="button retake"></button></div>`;
  }

  protected setup(): void {
    const q = <T extends Element>(selector: string) => this.stage.querySelector(selector) as T;
    this.svg = q("svg");
    this.scrim = q(".scrim");
    this.guideEl = q(".guide");
    this.ringTrack = q(".ring-track");
    this.ring = q(".ring");
    this.trackerEl = q(".tracker");
    this.landmarksEl = q(".landmarks");
    this.hintLeft = q('.hint[data-side="left"]');
    this.hintRight = q('.hint[data-side="right"]');
    this.successEl = q(".success");
    this.still = q(".still");
    this.shutter = q(".shutter");
    this.retake = q(".done-actions button");
    this.stepsEl = document.createElement("div");
    this.stepsEl.className = "steps";
    this.stepsEl.setAttribute("part", "steps");
    this.stepsEl.hidden = true;
    this.instruction.prepend(this.stepsEl);
    this.hintEl = document.createElement("span");
    this.hintEl.className = "instruction-hint";
    this.hintEl.setAttribute("part", "hint-text");
    this.instruction.append(this.hintEl);
    this.preciseButton = document.createElement("button");
    this.preciseButton.type = "button";
    this.preciseButton.className = "precise";
    this.preciseButton.setAttribute("part", "button precise");
    this.preciseButton.hidden = true;
    this.preciseButton.addEventListener("click", () => void this.usePreciseSource());
    this.instruction.append(this.preciseButton);
    this.turnGuide = q(".turn-guide");
    this.gauge = q(".gauge");
    this.gaugeFillEl = q(".gauge-fill");
    this.gauge.querySelector(".gauge-track")!.setAttribute("d", gaugeArc(-1));
    // The pill hides from assistive tech; the live region speaks. The button must stay reachable.
    this.instruction.removeAttribute("aria-hidden");
    this.instructionText.setAttribute("aria-hidden", "true");
    this.hintEl.setAttribute("aria-hidden", "true");
    this.stepsEl.setAttribute("aria-hidden", "true");
    this.shutter.addEventListener("click", () => void this.capture());
    this.retake.addEventListener("click", () => {
      this.reset();
      void this.start();
    });
  }

  protected showIntro(): void {
    const t = this.text;
    this.container.dataset.tone = "idle";
    this.showPanel(t.faceIntroTitle, t.faceIntroBody, [
      { label: t.start, primary: true, action: () => void this.start() },
    ]);
  }

  protected renderText(): void {
    if (!this.ready) return;
    const t = this.text;
    this.video.setAttribute("aria-label", t.previewLabel);
    this.shutter.textContent = t.capture;
    this.retake.textContent = t.retake;
    this.renderPrecise();
    if (this.flowState && this.viewState === "live") {
      this.shownMessage = undefined;
      this.shownHint = undefined;
      this.render(this.flowState);
    }
    if (this.viewState === "done") this.setInstruction(t.faceDone, false);
  }

  override attributeChangedCallback(name: string): void {
    super.attributeChangedCallback(name);
    if (!this.ready) return;
    if (name === "guide-shape" || name === "guide-aspect") this.layout();
    if (name === "steps" && this.running) this.onStarted();
  }

  protected layout(): void {
    if (!this.ready || !this.viewWidth || !this.viewHeight) return;
    const { viewWidth: w, viewHeight: h } = this;
    const shape = parseShape(this.getAttribute("guide-shape"));
    const aspect = parseRatio(this.getAttribute("guide-aspect"), 0.78);
    this.guide = guideFor(w, h, { shape, aspect });
    const gap = parseFloat(getComputedStyle(this).getPropertyValue("--pv-ring-gap")) || 12;
    const ringGuide = inflateGuide(this.guide, gap);
    this.svg.setAttribute("viewBox", `0 0 ${round(w)} ${round(h)}`);
    const path = guidePath(this.guide);
    this.guideEl.setAttribute("d", path);
    const ringPath = guidePath(ringGuide);
    this.ring.setAttribute("d", ringPath);
    this.ringTrack.setAttribute("d", ringPath);
    const bleed = SCRIM_BLEED;
    const maskGuide = { ...this.guide, cx: this.guide.cx + bleed, cy: this.guide.cy + bleed };
    const mask = holeMask(w + bleed * 2, h + bleed * 2, guidePath(maskGuide));
    this.scrim.style.setProperty("mask-image", mask);
    this.scrim.style.setProperty("-webkit-mask-image", mask);
    const { cx, cy, rx } = this.guide;
    const side = rx + gap + 34;
    this.hintLeft.setAttribute("transform", `translate(${round(cx - side)} ${round(cy)})`);
    this.hintRight.setAttribute("transform", `translate(${round(cx + side)} ${round(cy)})`);
    const headY = Math.max(36, cy - this.guide.ry - gap - 44);
    this.turnGuide.setAttribute("transform", `translate(${round(cx)} ${round(headY)})`);
    this.successEl.setAttribute(
      "transform",
      `translate(${round(cx)} ${round(cy + this.guide.ry)})`,
    );
  }

  protected onStarted(): void {
    const holdFrames = parseNumber(this.getAttribute("hold-frames"), 3, 1, 60);
    this.flow = createFaceFlow({
      holdFrames,
      windowFrames: parseNumber(this.getAttribute("window-frames"), holdFrames * 2, 1, 120),
      timeoutMs: parseNumber(this.getAttribute("timeout"), 45_000, 0),
      steps: this.steps,
      // Only a custom source can be directional; the built-in HAAR one isn't.
      directional: this.sourceValue?.directional ?? false,
      firstTurn: this.getAttribute("first-turn") === "right" ? "right" : "left",
      acceptPauseMs: parseNumber(this.getAttribute("accept-pause"), 900, 0, 5000),
      hintDelayMs: parseNumber(this.getAttribute("hint-delay"), 700, 0, 5000),
      hintHoldMs: parseNumber(this.getAttribute("hint-hold"), 1500, 0, 10_000),
    });
    this.boxSmoother = createBoxSmoother({
      windowFrames: parseNumber(this.getAttribute("smooth-frames"), 8, 1, 30),
    });
    this.lastLandmarks = [];
    this.wasAccepted = false;
    this.messageShownAt = 0;
    this.tracker.reset();
    this.ringFill.snap(0);
    this.gaugeFill.snap(0);
    this.best = undefined;
    this.detections = 0;
    this.lastYaw = undefined;
    this.shownMessage = undefined;
    this.shownHint = undefined;
    this.hideStill();
    this.shutter.hidden = true;
    this.retake.parentElement!.hidden = true;
    this.flowState = this.flow.state;
    this.render(this.flowState);
  }

  protected onStopped(): void {
    clearTimeout(this.swapTimer);
    clearTimeout(this.hintTimer);
    this.activeSource?.dispose?.();
    this.activeSource = undefined;
    this.tracker.reset();
    this.trackerEl.removeAttribute("d");
    this.landmarksEl.replaceChildren();
    this.dropFrames();
  }

  protected clearCaptures(): void {
    this.dropFrames();
    this.hideStill();
  }

  /** Frees the kept frame and forgets the last detection. */
  private dropFrames(): void {
    zeroCanvas(this.best?.canvas);
    this.best = undefined;
    this.lastPose = undefined;
    this.lastLandmarks = [];
  }

  /**
   * Restarts the flow and clears the previous capture (see `clearSensitiveData`). A running
   * camera keeps running; otherwise the intro shows again.
   */
  reset(): void {
    if (!this.ready) return;
    this.clearSensitiveData();
    this.shutter.hidden = true;
    this.retake.parentElement!.hidden = true;
    if (this.running) {
      this.paused = false;
      this.startedAt = performance.now();
      this.onStarted();
    } else {
      this.setViewState("intro");
      this.container.dataset.tone = "idle";
      this.ringFill.snap(0);
      this.setRing(0);
      this.stepsEl.hidden = true;
      this.setHintText(undefined);
      this.setInstruction("", false);
      this.showIntro();
    }
  }

  /**
   * Builds the detector on first use, for the given run. A source built for a run that ended
   * meanwhile is disposed (its worker terminated) instead of kept.
   *
   * @param token - The run asking.
   * @param worker - Whether the default detector may use a worker.
   * @returns The detector, or undefined when the run ended while it was built.
   */
  private async ensureSource(token: RunToken, worker = true): Promise<PoseSource | undefined> {
    if (this.activeSource) return this.activeSource;
    if (this.sourceValue) {
      this.sourceKind = this.sourceValue.name ?? "custom";
      this.activeSource = this.sourceValue;
      return this.activeSource;
    }
    const built = await createDefaultPoseSource({
      token,
      cascades: this.cascadesValue,
      loadCascades,
      createWorker:
        worker && parseBoolean(this.getAttribute("worker"), true) ? createInlineWorker : undefined,
    });
    if (!built) return undefined;
    if (!token.current || this.activeSource) {
      built.source.dispose?.();
      return token.current ? this.activeSource : undefined;
    }
    this.sourceKind = built.kind;
    this.activeSource = built.source;
    return built.source;
  }

  /** Drops the active detector so the next frame builds the new one. */
  private replaceSource(): void {
    if (this.activeSource && this.activeSource !== this.sourceValue) this.activeSource.dispose?.();
    this.activeSource = undefined;
  }

  protected async processFrame(frame: GrabbedFrame, token: RunToken): Promise<void> {
    const source = await this.ensureSource(token);
    if (!source || !token.current) return;
    let observation;
    try {
      observation = (await source.detect(frame.image)) ?? { pose: "none" as const };
    } catch (error) {
      if (!token.current) return;
      if (source === this.activeSource && this.sourceKind === "haar (worker)") {
        // The worker failed to start (a strict Content Security Policy): detect on the main thread.
        source.dispose?.();
        this.activeSource = undefined;
        await this.ensureSource(token, false);
        return;
      }
      throw error;
    }
    if (!token.current || !this.flow || !this.guide) return;
    this.detections++;
    const { scale } = frame;
    const box = observation.box && scaleBox(observation.box, scale);
    const landmarks = observation.landmarks?.map((p) => ({ x: p.x * scale, y: p.y * scale }));
    const t = this.viewTransform();
    // Guidance and the tracker follow the smoothed box, for every detector: a one-off wrong
    // detection is ignored (its pose too), and brief gaps keep the last box.
    const smoothed = this.boxSmoother.update(box && boxToView(box, t));
    const viewBox = smoothed.box;
    const pose = smoothed.outlier ? "none" : observation.pose;
    const guidance = assessFace(viewBox, this.guide);
    const previous = this.flowState;
    const state = this.flow.update({ pose, guidance });
    this.flowState = state;

    if (landmarks && !smoothed.outlier) this.lastLandmarks = landmarks.map((p) => toView(p, t));
    if (!viewBox) this.lastLandmarks = [];
    if (viewBox) {
      this.tracker.setTarget([
        { x: viewBox.x, y: viewBox.y },
        { x: viewBox.x + viewBox.width, y: viewBox.y + viewBox.height },
        ...this.lastLandmarks,
      ]);
    } else {
      this.tracker.setTarget(undefined);
    }

    if (state.frontal && observation.box) {
      this.considerFrame(frame, observation.box, observation.pose);
    }

    this.lastYaw = observation.yaw;
    this.lastPose = {
      pose: observation.pose,
      guidance,
      phase: state.phase,
      box,
      landmarks,
      score: observation.score,
      yaw: observation.yaw,
    };
    this.emit<PoseDetail>("pv-pose", this.lastPose);

    const stepChanged =
      previous?.step !== state.step ||
      previous?.stepsDone !== state.stepsDone ||
      state.phase === "done";
    if (state.totalSteps > 0 && (state.phase === "challenge" || state.phase === "done")) {
      if (stepChanged && previous?.phase !== "done") {
        this.emit<StepDetail>("pv-step", {
          step: state.phase === "done" ? "done" : state.step!,
          stepsDone: state.stepsDone,
          totalSteps: state.totalSteps,
          progress: state.totalSteps ? state.stepsDone / state.totalSteps : 1,
        });
        if (previous?.phase === "challenge" && state.stepsDone > previous.stepsDone)
          vibrate(HAPTICS.step);
      }
    }

    this.render(state);

    if (state.phase === "done" && previous?.phase !== "done") {
      if (this.autoCapture) await this.capture();
      else this.shutter.hidden = false;
    } else if (state.phase === "failed") {
      this.fail("timeout");
    }
  }

  /**
   * Keeps the frame if it is the sharpest frontal frame so far.
   *
   * @param frame - The detection frame.
   * @param faceBox - The face box in detection-frame pixels.
   * @param pose - The pose.
   */
  private considerFrame(frame: GrabbedFrame, faceBox: Box, pose: HeadPose): void {
    const score = sharpness(grayscale(frame.image), faceBox);
    if (this.best && score <= this.best.score) return;
    const fit = fitToPixels(this.video.videoWidth, this.video.videoHeight, this.maxPixels);
    const canvas = this.best?.canvas ?? createCanvas(fit.width, fit.height);
    canvas.width = fit.width;
    canvas.height = fit.height;
    context2d(canvas).drawImage(this.video, 0, 0, fit.width, fit.height);
    this.best = { canvas, score, box: scaleBox(faceBox, frame.scale * fit.scale), pose };
  }

  /**
   * Captures now: the sharpest frontal frame when one was kept and the
   * flow is done, otherwise the current frame, scaled to at most
   * `max-pixels`. Fires `pv-capture` (on the element only) and
   * `pv-complete`, stops the camera and shows the still.
   *
   * The element keeps no reference to the capture once it is handed
   * off: kept frames are freed, and the still's Blob URL is revoked as
   * soon as it has decoded. Call `clearSensitiveData()` to remove the
   * still from view as well.
   *
   * @returns The capture, or undefined when the camera isn't running.
   */
  async capture(): Promise<FaceCaptureDetail | undefined> {
    const token = this.token;
    if (!this.running || !token?.current) return undefined;
    this.paused = true;
    this.shutter.hidden = true;
    const done = this.flowState?.phase === "done";
    const best = done ? this.best : undefined;
    let canvas: HTMLCanvasElement;
    let box: Box | undefined;
    if (best) {
      canvas = best.canvas;
      box = best.box;
    } else {
      const shot = this.snapshotVideo();
      canvas = shot.canvas;
      box = this.lastPose?.box && scaleBox(this.lastPose.box, shot.scale);
    }
    const metadata: FaceCaptureMetadata = {
      width: canvas.width,
      height: canvas.height,
      sharpness: best ? best.score : 0,
      box,
      pose: best ? best.pose : (this.lastPose?.pose ?? "none"),
      challengePassed: done && this.steps,
      durationMs: Math.round(performance.now() - this.startedAt),
      capturedAt: new Date().toISOString(),
      mirrored: false,
    };
    let blob: Blob;
    let image: ImageData | undefined;
    try {
      blob = await canvasToBlob(canvas);
      image = this.includeImageData && token.current ? canvasPixels(canvas) : undefined;
    } finally {
      // The encoded copy is all that's needed from here on; free the frame either way.
      zeroCanvas(canvas);
    }
    if (!token.current) return undefined;
    const detail: FaceCaptureDetail = image ? { blob, image, metadata } : { blob, metadata };
    this.stop();
    this.showStill(blob);
    this.setViewState("done");
    this.hidePanel();
    this.container.dataset.tone = "success";
    this.ringFill.snap(1);
    this.setRing(1);
    this.setHint(undefined);
    this.setHintText(undefined);
    this.preciseButton.hidden = true;
    this.trackerEl.removeAttribute("d");
    this.landmarksEl.replaceChildren();
    this.retake.parentElement!.hidden = false;
    this.setInstruction(this.text.faceDone);
    vibrate(HAPTICS.success);
    this.emitPayload<FaceCaptureDetail>("pv-capture", detail);
    this.emit<CompleteDetail>("pv-complete", {
      durationMs: metadata.durationMs,
      stepsDone: this.flowState?.stepsDone ?? 0,
    });
    return detail;
  }

  /**
   * Shows a flow state. The main instruction cross-fades only when it
   * changes (once per step), the secondary hint only when its settled
   * value changes, and the guide colour follows the settled tone; the
   * ring's target is set here and eased every display frame.
   *
   * @param state - The state.
   */
  private render(state: FaceFlowState): void {
    const t = this.text;
    this.container.dataset.tone = state.tone;
    this.container.dataset.phase = state.phase;
    this.container.toggleAttribute("data-accepted", state.accepted);
    // The ring shows the current check: it fills as a step (or the alignment) holds, is full
    // while a step is accepted, starts empty for the next one, and drains slowly when the face is lost.
    if (this.wasAccepted && !state.accepted) this.ringFill.snap(0);
    this.wasAccepted = state.accepted;
    this.ringFill.set(
      state.accepted || state.phase === "done" ? 1 : state.hint === "faceLost" ? 0 : state.hold,
    );
    this.ringTrack.style.opacity = "1";
    this.setHint(state.turn);
    this.renderSteps(state);
    if (state.message !== this.shownMessage) {
      const first = this.shownMessage === undefined;
      this.shownMessage = state.message;
      const stepNote =
        state.phase === "challenge"
          ? `${formatLabel(t.stepOf, { step: state.stepsDone + 1, total: state.totalSteps })}. `
          : "";
      this.swapPrimary(t[state.message], first);
      this.announce(stepNote + t[state.message]);
    }
    if (state.hint !== this.shownHint) {
      this.shownHint = state.hint;
      this.setHintText(state.hint && t[state.hint]);
      if (state.hint) this.announce(t[state.hint]);
    }
    this.renderPrecise();
  }

  /**
   * Cross-fades the main instruction.
   *
   * @param text - The new instruction.
   * @param immediate - Show without fading (the first instruction).
   */
  private swapPrimary(text: string, immediate: boolean): void {
    clearTimeout(this.swapTimer);
    if (immediate) {
      this.instructionText.removeAttribute("data-swap");
      this.setInstruction(text, false);
      this.messageShownAt = performance.now();
      return;
    }
    this.instructionText.setAttribute("data-swap", "");
    this.swapTimer = setTimeout(
      () => {
        this.setInstruction(text, false);
        this.instructionText.removeAttribute("data-swap");
      },
      motionMs(this, "--pv-motion-duration", 200),
    );
  }

  /**
   * Fades the secondary hint line out and the new one in.
   *
   * @param text - The hint, or undefined to clear it.
   */
  private setHintText(text: string | undefined): void {
    clearTimeout(this.hintTimer);
    if (!this.hintEl.textContent) {
      this.hintEl.textContent = text ?? "";
      return;
    }
    this.hintEl.setAttribute("data-swap", "");
    this.hintTimer = setTimeout(
      () => {
        this.hintEl.textContent = text ?? "";
        this.hintEl.removeAttribute("data-swap");
      },
      motionMs(this, "--pv-motion-slow", 300),
    );
  }

  /** Shows the "Use precise detection" offer when a step stalls on the default detector. */
  private renderPrecise(): void {
    if (!this.ready) return;
    const t = this.text;
    const onDefault = !this.sourceValue;
    const offer =
      this.preciseLoader !== undefined &&
      onDefault &&
      this.preciseState !== "failed" &&
      this.viewState === "live" &&
      (this.flowState?.stalled === true || this.preciseState === "loading");
    this.preciseButton.hidden = !offer;
    this.preciseButton.disabled = this.preciseState === "loading";
    this.preciseButton.textContent =
      this.preciseState === "loading" ? t.loadingPrecise : t.usePrecise;
  }

  private renderSteps(state: FaceFlowState): void {
    const show = state.totalSteps > 0 && (state.phase === "challenge" || state.phase === "done");
    this.stepsEl.hidden = !show;
    if (!show) return;
    if (this.stepsEl.childElementCount !== state.totalSteps) {
      this.stepsEl.replaceChildren(
        ...Array.from({ length: state.totalSteps }, () => document.createElement("span")),
      );
    }
    Array.from(this.stepsEl.children).forEach((dot, i) =>
      dot.toggleAttribute("data-done", i < state.stepsDone),
    );
  }

  private setRing(progress: number): void {
    this.ring.style.strokeDashoffset = String(
      round(100 - Math.min(1, Math.max(0, progress)) * 100),
    );
  }

  /**
   * Shows the turn arrows. The person's left is the screen's left in a
   * mirrored preview and the screen's right otherwise.
   *
   * @param hint - Side from the person's point of view.
   */
  private setHint(hint: TurnHint | undefined): void {
    const screen =
      hint === "either" || hint === undefined
        ? hint
        : (hint === "left") === this.mirrored
          ? "left"
          : "right";
    this.hintLeft.toggleAttribute("data-show", screen === "either" || screen === "left");
    this.hintRight.toggleAttribute("data-show", screen === "either" || screen === "right");
    this.turnGuide.toggleAttribute("data-show", screen !== undefined);
    if (screen) this.turnGuide.dataset.side = screen;
  }

  /** The screen side of a person's-point-of-view side in the preview. */
  private screenSide(side: "left" | "right"): "left" | "right" {
    return (side === "left") === this.mirrored ? "left" : "right";
  }

  protected drawFrame(now: number): void {
    this.setRing(this.ringFill.step(now));
    this.drawGauge(now);
    const shown = this.tracker.step(now);
    if (!shown) {
      if (this.trackerEl.hasAttribute("d")) this.trackerEl.removeAttribute("d");
      if (this.landmarksEl.childElementCount) this.landmarksEl.replaceChildren();
    } else {
      const [a, b, ...landmarks] = shown.points;
      const box = { x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y };
      this.trackerEl.setAttribute("d", bracketsPath(box));
      this.trackerEl.style.opacity = String(round(shown.opacity));
      this.drawLandmarks(this.showLandmarks ? landmarks : [], shown.opacity);
    }
    if (this.debug) {
      const s = this.flowState;
      this.debugView.textContent = [
        `detector  ${this.sourceKind}`,
        `phase     ${s?.phase ?? "-"}`,
        `step      ${s?.step ?? "-"} (${s?.stepsDone ?? 0}/${s?.totalSteps ?? 0})`,
        `pose      ${this.lastPose?.pose ?? "-"}`,
        `guidance  ${this.lastPose?.guidance ?? "-"}`,
        `hint      ${s?.hint ?? "-"}${s?.stalled ? " (stalled)" : ""}`,
        `yaw       ${this.lastYaw === undefined ? "-" : `${Math.round(this.lastYaw)}°`}`,
        `sharpest  ${this.best ? Math.round(this.best.score) : "-"}`,
        `rate      ${(this.detections / Math.max(1, (now - this.startedAt) / 1000)).toFixed(1)}/s`,
      ].join("\n");
    }
  }

  /**
   * Draws the live turn gauge: an arc over the head illustration that
   * fills towards the asked side as the head turns. Only with a source
   * that reports yaw.
   *
   * @param now - Animation time.
   */
  private drawGauge(now: number): void {
    const turn = this.flowState?.phase === "challenge" ? this.flowState.turn : undefined;
    const threshold = this.activeSource?.turnThreshold ?? 18;
    const amount = turnProgress(this.lastYaw, turn, threshold);
    this.gauge.toggleAttribute("hidden", amount === undefined);
    if (amount === undefined) {
      this.gaugeFill.snap(0);
      return;
    }
    this.gaugeFill.set(amount);
    const value = this.gaugeFill.step(now);
    // Which way the arc fills on screen: the asked side, or the side the head is turned to.
    const side: "left" | "right" =
      turn === "left" || turn === "right" ? turn : (this.lastYaw ?? 0) >= 0 ? "left" : "right";
    const direction = this.screenSide(side) === "left" ? -1 : 1;
    this.gaugeFillEl.setAttribute("d", value > 0.01 ? gaugeArc(direction * value) : "");
    this.gauge.toggleAttribute("data-reached", amount >= 1);
  }

  private drawLandmarks(points: Array<{ x: number; y: number }>, opacity: number): void {
    while (this.landmarksEl.childElementCount > points.length) this.landmarksEl.lastChild!.remove();
    while (this.landmarksEl.childElementCount < points.length) {
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("r", "4");
      this.landmarksEl.append(dot);
    }
    points.forEach((p, i) => {
      const dot = this.landmarksEl.children[i];
      dot.setAttribute("cx", String(round(p.x)));
      dot.setAttribute("cy", String(round(p.y)));
    });
    this.landmarksEl.style.opacity = String(round(opacity));
  }

  /**
   * Shows the capture as a still; its Blob URL is revoked once it has decoded.
   *
   * @param blob - The capture.
   */
  private showStill(blob: Blob): void {
    this.still.hidden = false;
    void this.showBlob(this.still, blob).then((shown) => {
      if (!shown) this.still.hidden = true;
    });
  }

  /** Removes the still. */
  private hideStill(): void {
    this.still.hidden = true;
    this.still.removeAttribute("src");
  }
}

/**
 * Scales a box.
 *
 * @param box - The box.
 * @param scale - Factor.
 * @returns The scaled box.
 */
function scaleBox(box: Box, scale: number): Box {
  return {
    x: box.x * scale,
    y: box.y * scale,
    width: box.width * scale,
    height: box.height * scale,
  };
}

/** Radius of the turn gauge around the head illustration. */
const GAUGE_RADIUS = 26;

/**
 * An arc over the head illustration, from the top towards one side.
 *
 * @param amount - -1 (a quarter turn to the screen's left) to 1 (to the right);
 *   -1 also draws the full track when passed as the track.
 * @returns SVG path data.
 */
function gaugeArc(amount: number): string {
  const r = GAUGE_RADIUS;
  if (amount === -1) {
    // The track: a half circle over the top, from left to right.
    return `M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0`;
  }
  const angle = (amount * Math.PI) / 2;
  const x = round(r * Math.sin(angle));
  const y = round(-r * Math.cos(angle));
  return `M 0 ${-r} A ${r} ${r} 0 0 ${amount > 0 ? 1 : 0} ${x} ${y}`;
}

/**
 * Reads a motion token in ms from the element's computed style.
 *
 * @param element - The element.
 * @param token - Custom property, e.g. `--pv-motion-duration`.
 * @param fallback - Used when the token is missing or not in ms or s.
 * @returns Milliseconds.
 */
function motionMs(element: Element, token: string, fallback: number): number {
  const value = getComputedStyle(element).getPropertyValue(token).trim();
  const match = /^([\d.]+)(ms|s)$/.exec(value);
  if (!match) return fallback;
  return parseFloat(match[1]) * (match[2] === "s" ? 1000 : 1);
}
