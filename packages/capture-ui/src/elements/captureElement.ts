import { cameraConstraints, openCamera, stopStream } from "../camera/camera";
import { cameraContext, classifyCameraError } from "../camera/errors";
import { FrameGrabber } from "../camera/frames";
import type { GrabbedFrame } from "../camera/frames";
import { parseBoolean, parseNumber } from "../logic/attributes";
import { coverTransform } from "../logic/geometry";
import type { ViewTransform } from "../logic/geometry.model";
import { HAPTICS, vibrate } from "../logic/haptics";
import { resolveLabels } from "../logic/labels";
import type { CaptureLabels, LabelKey } from "../logic/labels.model";
import type { CaptureErrorCode, ErrorDetail, ReadyDetail } from "./events.model";
import { baseStyles } from "./styles";

/** `HTMLElement`, or a stand-in where it doesn't exist (server rendering), so importing never throws. */
const ElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

/**
 * How far the blurred surround reaches past the element's edges, so the
 * blur doesn't sample the transparent outside and darken the borders.
 * Matches `inset` of `.scrim` in the styles.
 */
export const SCRIM_BLEED = 40;

/** What the element is showing. */
export type ViewState = "intro" | "starting" | "live" | "review" | "adjust" | "done" | "error";

const ERROR_LABELS: Record<CaptureErrorCode, [LabelKey, LabelKey]> = {
  denied: ["cameraDeniedTitle", "cameraDeniedBody"],
  "blocked-frame": ["cameraBlockedFrameTitle", "cameraBlockedFrameBody"],
  unavailable: ["cameraUnavailableTitle", "cameraUnavailableBody"],
  "in-use": ["cameraInUseTitle", "cameraInUseBody"],
  insecure: ["cameraInsecureTitle", "cameraInsecureBody"],
  unknown: ["cameraErrorTitle", "cameraErrorBody"],
  timeout: ["timeoutTitle", "timeoutBody"],
  detector: ["cameraErrorTitle", "cameraErrorBody"],
};

/**
 * Waits.
 *
 * @param ms - Milliseconds.
 * @returns A promise that resolves after `ms`.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Shared camera plumbing for the capture elements: shadow DOM, camera
 * start and stop, permission and error states, the detection loop (a few
 * times a second, one frame at a time) and the animation loop (every
 * display frame), labels and the live region.
 */
export abstract class CaptureElement extends ElementBase {
  static get observedAttributes(): string[] {
    return ["lang", "show-debug", "detect-size", "detect-interval", "mirrored"];
  }

  protected readonly shadow: ShadowRoot;
  protected readonly container: HTMLDivElement;
  protected readonly video: HTMLVideoElement;
  protected readonly stage: HTMLDivElement;
  protected readonly instruction: HTMLDivElement;
  protected readonly instructionText: HTMLSpanElement;
  protected readonly liveRegion: HTMLDivElement;
  protected readonly debugView: HTMLPreElement;
  private readonly panel: HTMLDivElement;
  private readonly panelTitle: HTMLHeadingElement;
  private readonly panelBody: HTMLParagraphElement;
  private readonly panelActions: HTMLDivElement;

  protected viewWidth = 0;
  protected viewHeight = 0;
  protected running = false;
  protected paused = false;
  protected startedAt = 0;
  protected viewState: ViewState = "intro";
  /** Bumped on every start and stop, so stale async work can tell it's stale. */
  protected generation = 0;
  /** The subclass has built its DOM (one microtask after construction). */
  protected ready = false;

  private labelOverrides: Partial<CaptureLabels> = {};
  private externalStream: MediaStream | undefined;
  private activeStream: MediaStream | undefined;
  private readonly grabber = new FrameGrabber();
  private animationId = 0;
  private resizeObserver: ResizeObserver | undefined;
  private announced = "";

  /** Which camera to open. */
  protected abstract readonly facingMode: "user" | "environment";
  /** Element-specific stylesheet. */
  protected abstract readonly styles: string;
  /** Element-specific markup inside the stage. */
  protected abstract stageMarkup(): string;
  /** Called once the shadow DOM exists. */
  protected abstract setup(): void;
  /** Analyses one detection frame. */
  protected abstract processFrame(frame: GrabbedFrame, generation: number): Promise<void>;
  /** Draws one display frame. */
  protected abstract drawFrame(now: number): void;
  /** The view was resized. */
  protected abstract layout(): void;
  /** Shows the intro panel. */
  protected abstract showIntro(): void;
  /** The camera started: reset the flow. */
  protected abstract onStarted(): void;
  /** The camera stopped: free detectors. */
  protected abstract onStopped(): void;
  /** Labels or language changed: re-render text. */
  protected abstract renderText(): void;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    this.shadow.append(style);
    this.container = document.createElement("div");
    this.container.className = "root";
    this.container.setAttribute("part", "root");
    this.container.innerHTML = `
      <video part="video" playsinline muted autoplay disablepictureinpicture></video>
      <div class="stage"></div>
      <div class="instruction" part="instruction" aria-hidden="true" data-empty>
        <span class="instruction-text"></span>
      </div>
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
      <div class="panel" part="panel" role="dialog" aria-modal="false" hidden>
        <h2 part="title"></h2>
        <p part="body"></p>
        <div class="actions"></div>
      </div>
      <pre class="debug" part="debug" hidden></pre>`;
    this.shadow.append(this.container);
    this.video = this.container.querySelector("video")!;
    this.stage = this.container.querySelector(".stage")!;
    this.instruction = this.container.querySelector(".instruction")!;
    this.instructionText = this.container.querySelector(".instruction-text")!;
    this.liveRegion = this.container.querySelector("[role=status]")!;
    this.panel = this.container.querySelector(".panel")!;
    this.panelTitle = this.panel.querySelector("h2")!;
    this.panelBody = this.panel.querySelector("p")!;
    this.panelActions = this.panel.querySelector(".actions")!;
    this.debugView = this.container.querySelector(".debug")!;
    this.video.muted = true;
    this.video.setAttribute("aria-hidden", "true");
    queueMicrotask(() => {
      style.textContent = baseStyles + this.styles;
      this.stage.innerHTML = this.stageMarkup();
      this.setup();
      this.ready = true;
      this.debugView.hidden = !this.debug;
      this.applyMirroring();
      this.renderText();
      if (this.viewState === "intro") this.showIntro();
    });
  }

  /** Overrides any of the shown texts; merged over the built-in language. */
  get labels(): Partial<CaptureLabels> {
    return this.labelOverrides;
  }

  set labels(value: Partial<CaptureLabels> | undefined) {
    this.labelOverrides = value ?? {};
    this.renderText();
    this.refreshPanel();
  }

  /** A camera stream to use instead of opening one (e.g. from your own device picker). */
  get stream(): MediaStream | undefined {
    return this.externalStream;
  }

  set stream(value: MediaStream | undefined) {
    this.externalStream = value;
    if (this.running) {
      this.stop();
      void this.start();
    }
  }

  /** The resolved labels for the current language. */
  protected get text(): CaptureLabels {
    const lang =
      this.getAttribute("lang") ??
      this.closest?.("[lang]")?.getAttribute("lang") ??
      document.documentElement?.lang;
    return resolveLabels(lang, this.labelOverrides);
  }

  protected get mirrored(): boolean {
    return parseBoolean(this.getAttribute("mirrored"), this.facingMode === "user");
  }

  protected get detectSize(): number {
    return parseNumber(this.getAttribute("detect-size"), 480, 120, 1920);
  }

  protected get detectInterval(): number {
    return parseNumber(this.getAttribute("detect-interval"), 120, 0, 2000);
  }

  protected get debug(): boolean {
    return parseBoolean(this.getAttribute("show-debug"), false);
  }

  connectedCallback(): void {
    this.resizeObserver ??= new ResizeObserver((entries) => {
      const rect = entries[entries.length - 1].contentRect;
      this.viewWidth = rect.width;
      this.viewHeight = rect.height;
      if (this.ready) this.layout();
    });
    this.resizeObserver.observe(this);
    if (parseBoolean(this.getAttribute("autostart"), false)) {
      queueMicrotask(() => void this.start());
    }
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.stop();
  }

  attributeChangedCallback(name: string): void {
    if (!this.ready) return;
    if (name === "lang") {
      this.renderText();
      this.refreshPanel();
    }
    if (name === "mirrored") this.applyMirroring();
    if (name === "show-debug") this.debugView.hidden = !this.debug;
  }

  /**
   * Opens the camera and starts detecting. Shows a clear message (and
   * fires `pv-error`) when the camera is denied, missing, busy, or blocked
   * by the embedding page.
   *
   * @returns Resolves once the preview runs, or after the error is shown.
   */
  async start(): Promise<void> {
    if (this.running || this.viewState === "starting") return;
    const generation = ++this.generation;
    this.setViewState("starting");
    this.hidePanel();
    this.setInstruction(this.text.startingCamera, true);
    let stream: MediaStream;
    try {
      stream = this.externalStream ?? (await openCamera(cameraConstraints(this.facingMode)));
    } catch (error) {
      if (generation !== this.generation) return;
      this.fail(classifyCameraError(error, cameraContext()), error);
      return;
    }
    if (generation !== this.generation) {
      if (stream !== this.externalStream) stopStream(stream);
      return;
    }
    this.activeStream = stream;
    this.video.srcObject = stream;
    try {
      await this.video.play();
    } catch {
      // Autoplay rules can reject play() even for a muted inline video; frames still arrive once metadata loads.
    }
    if (!this.video.videoWidth) {
      await new Promise<void>((resolve) => {
        this.video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      });
    }
    if (generation !== this.generation) return;
    this.running = true;
    this.paused = false;
    this.startedAt = performance.now();
    this.setViewState("live");
    this.setInstruction("", false);
    this.onStarted();
    this.emit<ReadyDetail>("pv-ready", {
      width: this.video.videoWidth,
      height: this.video.videoHeight,
      facingMode: this.facingMode,
    });
    this.layout();
    void this.detectionLoop(generation);
    const frame = (now: number) => {
      if (generation !== this.generation) return;
      this.drawFrame(now);
      this.animationId = requestAnimationFrame(frame);
    };
    this.animationId = requestAnimationFrame(frame);
  }

  /** Stops the camera and detection. The camera light goes off. */
  stop(): void {
    this.generation++;
    this.running = false;
    cancelAnimationFrame(this.animationId);
    if (this.activeStream && this.activeStream !== this.externalStream) {
      stopStream(this.activeStream);
    }
    this.activeStream = undefined;
    this.video.srcObject = null;
    if (!this.ready) return;
    this.onStopped();
    if (this.viewState === "starting" || this.viewState === "live") {
      this.setViewState("intro");
      this.showIntro();
    }
  }

  /**
   * Analyses frames until stopped: grab a small frame, wait for the
   * detector, wait out the rest of the interval. Only one frame is in
   * flight at a time, so a slow detector lowers the rate instead of
   * queueing work.
   *
   * @param generation - The run this loop belongs to.
   */
  private async detectionLoop(generation: number): Promise<void> {
    while (generation === this.generation) {
      const began = performance.now();
      if (!this.paused && document.visibilityState !== "hidden") {
        const frame = this.grabber.grab(this.video, this.detectSize);
        if (frame) {
          try {
            await this.processFrame(frame, generation);
          } catch (error) {
            if (generation !== this.generation) return;
            this.fail("detector", error);
            return;
          }
        }
      }
      await delay(Math.max(16, this.detectInterval - (performance.now() - began)));
    }
  }

  /** The current frame-to-view transform. */
  protected viewTransform(): ViewTransform {
    return coverTransform(
      this.video.videoWidth,
      this.video.videoHeight,
      this.viewWidth,
      this.viewHeight,
      this.mirrored,
    );
  }

  /**
   * Shows an error, stops the camera and fires `pv-error`.
   *
   * @param code - What went wrong.
   * @param cause - The underlying error.
   */
  protected fail(code: CaptureErrorCode, cause?: unknown): void {
    const [titleKey, bodyKey] = ERROR_LABELS[code];
    this.stop();
    this.setViewState("error");
    this.setInstruction("", false);
    this.errorCode = code;
    this.renderErrorPanel();
    vibrate(HAPTICS.error);
    this.announce(`${this.text[titleKey]}. ${this.text[bodyKey]}`);
    this.emit<ErrorDetail>("pv-error", { code, message: this.text[titleKey], cause });
  }

  private errorCode: CaptureErrorCode | undefined;

  private renderErrorPanel(): void {
    if (!this.errorCode) return;
    const [titleKey, bodyKey] = ERROR_LABELS[this.errorCode];
    this.showPanel(this.text[titleKey], this.text[bodyKey], [
      { label: this.text.retry, primary: true, action: () => void this.start() },
    ]);
    this.panel.dataset.tone = "error";
  }

  /** Re-renders an open panel in the current language. */
  private refreshPanel(): void {
    if (this.viewState === "error") this.renderErrorPanel();
    else if (this.viewState === "intro") this.showIntro();
  }

  /**
   * Shows the panel (intro or error).
   *
   * @param title - Heading.
   * @param body - Explanation.
   * @param actions - Buttons; the first primary one gets focus.
   */
  protected showPanel(
    title: string,
    body: string,
    actions: Array<{ label: string; primary?: boolean; action: () => void }>,
  ): void {
    this.panelTitle.textContent = title;
    this.panelBody.textContent = body;
    this.panelActions.replaceChildren(
      ...actions.map(({ label, primary, action }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.setAttribute("part", primary ? "button button-primary" : "button");
        if (primary) button.classList.add("primary");
        button.addEventListener("click", action);
        return button;
      }),
    );
    delete this.panel.dataset.tone;
    this.panel.setAttribute("aria-label", title);
    this.panel.hidden = false;
  }

  /** Hides the panel. */
  protected hidePanel(): void {
    this.panel.hidden = true;
  }

  /**
   * Sets the visible instruction.
   *
   * @param text - Instruction; empty hides the pill.
   * @param announce - Also read it out through the live region.
   */
  protected setInstruction(text: string, announce = true): void {
    if (this.instructionText.textContent !== text) this.instructionText.textContent = text;
    this.instruction.toggleAttribute(
      "data-empty",
      !text && !this.instruction.querySelector(".steps:not([hidden])"),
    );
    if (announce && text) this.announce(text);
  }

  /**
   * Reads text out to screen readers, once per change.
   *
   * @param text - What to announce.
   */
  protected announce(text: string): void {
    if (text === this.announced) return;
    this.announced = text;
    this.liveRegion.textContent = text;
  }

  /**
   * Records what the element shows, as `data-state` on the root for styling.
   *
   * @param state - The new view state.
   */
  protected setViewState(state: ViewState): void {
    this.viewState = state;
    this.container.dataset.state = state;
  }

  /**
   * Dispatches a bubbling, composed `CustomEvent`.
   *
   * @param type - Event name.
   * @param detail - Event detail.
   */
  protected emit<T>(type: string, detail: T): void {
    this.dispatchEvent(new CustomEvent<T>(type, { detail, bubbles: true, composed: true }));
  }

  /** Applies the `mirrored` attribute to the preview. */
  private applyMirroring(): void {
    this.container.classList.toggle("mirrored", this.mirrored);
    this.layout();
  }
}
