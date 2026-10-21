import { cameraConstraints, openCamera, stopStream } from "../camera/camera";
import { cameraContext, classifyCameraError } from "../camera/errors";
import { FrameGrabber, snapshot } from "../camera/frames";
import type { GrabbedFrame } from "../camera/frames";
import {
  DEFAULT_START_TIMEOUT_MS,
  StreamError,
  liveVideoTrack,
  waitForVideo,
  watchVideo,
} from "../camera/startup";
import { parseBoolean, parseNumber } from "../logic/attributes";
import {
  DEFAULT_MAX_CAPTURE_PIXELS,
  MAX_CAPTURE_PIXELS,
  MIN_CAPTURE_PIXELS,
  fitToPixels,
} from "../logic/captureSize";
import { createBlobUrls, showBlobImage } from "../logic/disposal";
import { coverTransform } from "../logic/geometry";
import type { ViewTransform } from "../logic/geometry.model";
import { HAPTICS, vibrate } from "../logic/haptics";
import { resolveLabels } from "../logic/labels";
import type { CaptureLabels, LabelKey } from "../logic/labels.model";
import { createRunCounter } from "../logic/runToken";
import type { RunToken } from "../logic/runToken.model";
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
  "no-video": ["cameraUnavailableTitle", "cameraUnavailableBody"],
  ended: ["cameraUnavailableTitle", "cameraUnavailableBody"],
  "media-error": ["cameraErrorTitle", "cameraErrorBody"],
  "start-timeout": ["cameraErrorTitle", "cameraErrorBody"],
};

/** Status events: they bubble and cross the shadow root, and never carry images. */
const STATUS_EVENT: EventInit = { bubbles: true, composed: true };
/**
 * Events with image data: they stay on the element (no bubbling, no crossing the shadow
 * root), so only listeners on the element itself receive the capture.
 */
const PAYLOAD_EVENT: EventInit = { bubbles: false, composed: false };

/**
 * The `pv-error` code for a stream that failed to start.
 *
 * @param error - What `waitForVideo` rejected with.
 * @returns The stream failure, or `unknown` for anything else.
 */
const startFailureCode = (error: unknown): CaptureErrorCode =>
  error instanceof StreamError && error.reason !== "aborted" ? error.reason : "unknown";

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
  /** The current run's token, until it stops; async work checks it after every await. */
  protected token: RunToken | undefined;
  /** Every Blob URL the element created, so all of them can be revoked. */
  protected readonly blobUrls = createBlobUrls();
  /** The subclass has built its DOM (one microtask after construction). */
  protected ready = false;

  private labelOverrides: Partial<CaptureLabels> = {};
  private externalStream: MediaStream | undefined;
  private activeStream: MediaStream | undefined;
  private readonly grabber = new FrameGrabber();
  private readonly runs = createRunCounter();
  private imageLoads = new AbortController();
  private unwatchStream: (() => void) | undefined;
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
  /** Analyses one detection frame; checks `token` after every await. */
  protected abstract processFrame(frame: GrabbedFrame, token: RunToken): Promise<void>;
  /** Draws one display frame. */
  protected abstract drawFrame(now: number): void;
  /** The view was resized. */
  protected abstract layout(): void;
  /** Shows the intro panel. */
  protected abstract showIntro(): void;
  /** The camera started: reset the flow. */
  protected abstract onStarted(): void;
  /** The camera stopped: free detectors and working buffers. */
  protected abstract onStopped(): void;
  /** Drops the element's captured images, canvases and results (see {@link clearSensitiveData}). */
  protected abstract clearCaptures(): void;
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

  /** Milliseconds the stream gets to deliver its first frame size (`start-timeout`). */
  protected get startTimeout(): number {
    return parseNumber(this.getAttribute("start-timeout"), DEFAULT_START_TIMEOUT_MS, 100, 120_000);
  }

  /**
   * The most pixels a capture may have (`max-pixels`, default 1920 × 1440). A larger camera
   * frame is scaled down before it is encoded, so an unexpectedly large stream can't exhaust
   * memory. Kept between 320 × 240 and 4096 × 4096.
   */
  get maxPixels(): number {
    return parseNumber(
      this.getAttribute("max-pixels"),
      DEFAULT_MAX_CAPTURE_PIXELS,
      MIN_CAPTURE_PIXELS,
      MAX_CAPTURE_PIXELS,
    );
  }

  set maxPixels(value: number) {
    this.setAttribute("max-pixels", String(value));
  }

  /**
   * Whether `pv-capture` also carries the raw `ImageData` (`include-image-data`, default off).
   * Off, the capture is only the encoded JPEG, so the pixels aren't held twice in memory.
   */
  get includeImageData(): boolean {
    return parseBoolean(this.getAttribute("include-image-data"), false);
  }

  set includeImageData(value: boolean) {
    this.setAttribute("include-image-data", value ? "on" : "off");
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
    this.dispose();
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
    const token = this.runs.begin();
    this.token = token;
    this.setViewState("starting");
    this.hidePanel();
    this.setInstruction(this.text.startingCamera, true);
    const external = this.externalStream;
    let stream: MediaStream;
    try {
      stream = external ?? (await openCamera(cameraConstraints(this.facingMode)));
    } catch (error) {
      if (!token.current) return;
      this.fail(classifyCameraError(error, cameraContext()), error);
      return;
    }
    if (!token.current) {
      if (stream !== external) stopStream(stream);
      return;
    }
    const track = liveVideoTrack(stream);
    if (!track) {
      if (stream !== external) stopStream(stream);
      this.fail("no-video", new StreamError("no-video"));
      return;
    }
    this.activeStream = stream;
    this.video.srcObject = stream;
    // Autoplay rules can reject play() even for a muted inline video, and frames still arrive
    // once metadata loads, so the outcome is decided by waitForVideo. A rejection is kept as the
    // cause in case the stream then never starts.
    let playFailure: unknown;
    this.video.play().catch((error: unknown) => {
      playFailure = error;
    });
    try {
      await waitForVideo(this.video, track, {
        timeoutMs: this.startTimeout,
        signal: token.signal,
      });
    } catch (error) {
      if (!token.current) return;
      this.fail(startFailureCode(error), playFailure ?? error);
      return;
    }
    if (!token.current) return;
    this.unwatchStream = watchVideo(this.video, track, (reason) => {
      if (token.current) this.fail(reason, new StreamError(reason));
    });
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
    void this.detectionLoop(token);
    const frame = (now: number) => {
      if (!token.current) return;
      this.drawFrame(now);
      this.animationId = requestAnimationFrame(frame);
    };
    this.animationId = requestAnimationFrame(frame);
  }

  /** Stops the camera and detection. The camera light goes off. */
  stop(): void {
    this.runs.cancel();
    this.token = undefined;
    this.running = false;
    cancelAnimationFrame(this.animationId);
    this.unwatchStream?.();
    this.unwatchStream = undefined;
    if (this.activeStream && this.activeStream !== this.externalStream) {
      stopStream(this.activeStream);
    }
    this.activeStream = undefined;
    this.video.srcObject = null;
    this.grabber.release();
    if (!this.ready) return;
    this.onStopped();
    if (this.viewState === "starting" || this.viewState === "live") {
      this.setViewState("intro");
      this.showIntro();
    }
  }

  /**
   * Stops the camera and clears every captured image (see {@link clearSensitiveData}). Called
   * when the element is removed from the page. Safe to call repeatedly; `start()` works again
   * afterwards.
   */
  dispose(): void {
    this.stop();
    this.clearSensitiveData();
  }

  /**
   * Clears every captured image the element holds: revokes its Blob URLs, sets its canvases to
   * zero size, removes shown stills, and drops its references to blobs, `ImageData`, kept
   * frames and results. The element keeps no copy of a capture after this; your own references
   * (from `pv-capture` or `capture()`) are untouched. Called on disconnect, reset, retake and
   * errors. Safe to call repeatedly.
   */
  clearSensitiveData(): void {
    this.imageLoads.abort();
    this.imageLoads = new AbortController();
    this.blobUrls.revokeAll();
    this.grabber.release();
    if (this.ready) this.clearCaptures();
  }

  /**
   * Shows a captured image in an `<img>` and revokes its Blob URL as soon as it has decoded.
   *
   * @param image - The `<img>`.
   * @param blob - The encoded image.
   * @returns True once shown; false when it failed to decode or the data was cleared first.
   */
  protected showBlob(image: HTMLImageElement, blob: Blob): Promise<boolean> {
    return showBlobImage(image, blob, this.blobUrls, this.imageLoads.signal);
  }

  /**
   * Draws the current video frame for a capture, scaled down to at most {@link maxPixels}.
   *
   * @returns The canvas, and its pixels per video pixel.
   */
  protected snapshotVideo(): { canvas: HTMLCanvasElement; scale: number } {
    const { width, height, scale } = fitToPixels(
      this.video.videoWidth,
      this.video.videoHeight,
      this.maxPixels,
    );
    return { canvas: snapshot(this.video, width, height), scale };
  }

  /**
   * Analyses frames until stopped: grab a small frame, wait for the
   * detector, wait out the rest of the interval. Only one frame is in
   * flight at a time, so a slow detector lowers the rate instead of
   * queueing work.
   *
   * @param token - The run this loop belongs to.
   */
  private async detectionLoop(token: RunToken): Promise<void> {
    while (token.current) {
      const began = performance.now();
      if (!this.paused && document.visibilityState !== "hidden") {
        const frame = this.grabber.grab(this.video, this.detectSize);
        if (frame) {
          try {
            await this.processFrame(frame, token);
          } catch (error) {
            if (!token.current) return;
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
   * Shows an error, stops the camera, clears captured data and fires `pv-error`.
   *
   * @param code - What went wrong.
   * @param cause - The underlying error.
   */
  protected fail(code: CaptureErrorCode, cause?: unknown): void {
    const [titleKey, bodyKey] = ERROR_LABELS[code];
    this.stop();
    this.clearSensitiveData();
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
   * Dispatches a status event: bubbling and composed, so page-level listeners see it. Never
   * use it for image data; see {@link emitPayload}.
   *
   * @param type - Event name.
   * @param detail - Event detail.
   */
  protected emit<T>(type: string, detail: T): void {
    this.dispatchEvent(new CustomEvent<T>(type, { ...STATUS_EVENT, detail }));
  }

  /**
   * Dispatches an event that carries image data. It neither bubbles nor crosses the shadow
   * root, so only listeners on the element itself receive it, not ones on `document` or
   * `window`.
   *
   * @param type - Event name.
   * @param detail - Event detail.
   */
  protected emitPayload<T>(type: string, detail: T): void {
    this.dispatchEvent(new CustomEvent<T>(type, { ...PAYLOAD_EVENT, detail }));
  }

  /** Applies the `mirrored` attribute to the preview. */
  private applyMirroring(): void {
    this.container.classList.toggle("mirrored", this.mirrored);
    this.layout();
  }
}
