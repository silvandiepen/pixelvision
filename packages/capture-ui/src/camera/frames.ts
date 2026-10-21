import type { RGBAImage } from "pixelvision";

/** A frame grabbed from a video, scaled down for detection. */
export interface GrabbedFrame {
  image: ImageData;
  /** Multiply frame coordinates by this to get video pixels. */
  scale: number;
}

/**
 * Creates a canvas element of the given size.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @returns The canvas.
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Gets a canvas's 2D context, preferring frequent pixel reads.
 *
 * @param canvas - The canvas.
 * @returns The context.
 * @throws {Error} When the browser can't create one.
 */
export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas is not available");
  return context;
}

/**
 * Grabs video frames into a reused canvas.
 */
export class FrameGrabber {
  private canvas: HTMLCanvasElement | undefined;
  private context: CanvasRenderingContext2D | undefined;

  /**
   * Draws the current video frame, scaled so its longer side is at most
   * `maxSize`, and reads its pixels.
   *
   * @param video - A playing video.
   * @param maxSize - Longest side of the result.
   * @returns The frame, or undefined before the video has a frame.
   */
  grab(video: HTMLVideoElement, maxSize: number): GrabbedFrame | undefined {
    const { videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight) return undefined;
    const scale = Math.min(1, maxSize / Math.max(videoWidth, videoHeight));
    const width = Math.max(1, Math.round(videoWidth * scale));
    const height = Math.max(1, Math.round(videoHeight * scale));
    if (!this.canvas || !this.context) {
      this.canvas = createCanvas(width, height);
      this.context = context2d(this.canvas);
    }
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.context.drawImage(video, 0, 0, width, height);
    return { image: this.context.getImageData(0, 0, width, height), scale: videoWidth / width };
  }
}

/**
 * Draws the video's current frame at full resolution.
 *
 * @param video - A playing video.
 * @returns A canvas holding the frame.
 */
export function snapshot(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = createCanvas(video.videoWidth, video.videoHeight);
  context2d(canvas).drawImage(video, 0, 0);
  return canvas;
}

/**
 * Puts pixels on a new canvas.
 *
 * @param image - RGBA pixels (e.g. from `toImageData`).
 * @returns The canvas.
 */
export function imageToCanvas(image: RGBAImage | ImageData): HTMLCanvasElement {
  const canvas = createCanvas(image.width, image.height);
  const data = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
  context2d(canvas).putImageData(data, 0, 0);
  return canvas;
}

/**
 * Reads a whole canvas's pixels.
 *
 * @param canvas - The canvas.
 * @returns Its pixels.
 */
export function canvasPixels(canvas: HTMLCanvasElement): ImageData {
  return context2d(canvas).getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Encodes a canvas.
 *
 * @param canvas - The canvas.
 * @param type - Image type (default JPEG).
 * @param quality - Encoder quality for lossy types (default 0.92).
 * @returns The image file.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image"))),
      type,
      quality,
    );
  });
}
