// Test helpers for the elements under happy-dom: a camera stream, a video with a frame size,
// and a 2D canvas that records draws. Imported by tests only; not part of the package.
import { vi } from "vitest";
import { FrameGrabber } from "../camera/frames";

/** A video track stand-in that counts its listeners. */
export class FakeTrack extends EventTarget {
  kind = "video";
  readyState: "live" | "ended" = "live";
  stopped = false;
  listeners = 0;

  override addEventListener(...args: Parameters<EventTarget["addEventListener"]>): void {
    this.listeners++;
    super.addEventListener(...args);
  }

  override removeEventListener(...args: Parameters<EventTarget["removeEventListener"]>): void {
    this.listeners--;
    super.removeEventListener(...args);
  }

  /** Stops the track, as `MediaStreamTrack.stop()` does (no `ended` event). */
  stop(): void {
    this.stopped = true;
    this.readyState = "ended";
  }

  /** Ends the track from outside (unplugged, revoked): fires `ended`. */
  end(): void {
    this.readyState = "ended";
    this.dispatchEvent(new Event("ended"));
  }
}

/**
 * A `MediaStream` happy-dom accepts as `srcObject`, holding the given tracks.
 *
 * @param tracks - Its video tracks.
 * @returns The stream.
 */
export function fakeStream(...tracks: FakeTrack[]): MediaStream {
  const stream = Object.create(window.MediaStream.prototype) as MediaStream;
  Object.defineProperty(stream, "getVideoTracks", { value: () => tracks });
  Object.defineProperty(stream, "getTracks", { value: () => tracks });
  return stream;
}

/**
 * Makes `getUserMedia` resolve with a stream.
 *
 * @param stream - What it resolves with.
 * @returns The mock, to inspect calls.
 */
export function provideCamera(stream: MediaStream): ReturnType<typeof vi.fn> {
  const getUserMedia = vi.fn(async () => stream);
  Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
  });
  return getUserMedia;
}

/**
 * Gives an element's preview video a frame size, as if metadata had loaded.
 *
 * @param element - The capture element.
 * @param width - Frame width.
 * @param height - Frame height.
 * @returns The video.
 */
export function videoWithSize(element: HTMLElement, width: number, height: number) {
  const video = element.shadowRoot!.querySelector("video")!;
  Object.defineProperty(video, "videoWidth", { value: width, configurable: true });
  Object.defineProperty(video, "videoHeight", { value: height, configurable: true });
  return video;
}

/** The canvases that got a 2D context from the stand-in. */
export interface CanvasRecord {
  canvases: HTMLCanvasElement[];
}

/**
 * Replaces the 2D canvas (absent in happy-dom) with a stand-in that returns blank pixels of
 * the canvas's size, and `toBlob` with one that encodes a small JPEG-typed blob.
 *
 * @returns The canvases that got a context.
 */
export function fakeCanvas(): CanvasRecord {
  const record: CanvasRecord = { canvases: [] };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
    this: HTMLCanvasElement,
  ) {
    record.canvases.push(this);
    return {
      drawImage() {},
      putImageData() {},
      getImageData: (_x: number, _y: number, width: number, height: number) => ({
        width,
        height,
        data: new Uint8ClampedArray(width * height * 4),
        colorSpace: "srgb",
      }),
      canvas: this,
    } as unknown as CanvasRenderingContext2D;
  } as never);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
  ) {
    const size = `${this.width}x${this.height}`;
    setTimeout(() => callback(new Blob([size], { type: "image/jpeg" })), 0);
  });
  return record;
}

/**
 * Makes the detection loop see a small blank frame on every grab.
 *
 * @returns The spy.
 */
export function fakeFrames() {
  return vi.spyOn(FrameGrabber.prototype, "grab").mockImplementation(() => ({
    image: { width: 4, height: 4, data: new Uint8ClampedArray(64), colorSpace: "srgb" } as never,
    scale: 1,
  }));
}

/**
 * Waits for timers and microtasks.
 *
 * @param ms - Milliseconds to wait (default 0).
 * @returns Resolves after the wait.
 */
export const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/** Installs the ResizeObserver happy-dom lacks. */
export function installResizeObserver(): void {
  globalThis.ResizeObserver ??= class {
    observe() {}
    disconnect() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver;
}
