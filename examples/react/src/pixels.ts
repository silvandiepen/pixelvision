import { toImageData } from "pixelvision";
import type { Quad } from "pixelvision";
import type { DetectResult } from "./detect.model";

/** Photos are scaled down to at most this many pixels on their longer side. */
const MAX_SIZE = 1280;

/**
 * Reads the pixels of an image, video frame or bitmap, scaled down to
 * {@link MAX_SIZE} when it's larger.
 *
 * @param source - What to read.
 * @param width - Its width.
 * @param height - Its height.
 * @returns RGBA pixels.
 * @throws {Error} When the browser has no 2D canvas.
 */
function pixelsOf(source: CanvasImageSource, width: number, height: number): ImageData {
  const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This browser can't draw on a canvas.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Decodes an uploaded image file.
 *
 * @param file - The image file.
 * @returns Its RGBA pixels.
 */
export async function readImageFile(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  try {
    return pixelsOf(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

/**
 * Takes one frame from the camera, then turns the camera off again.
 *
 * @returns The frame's RGBA pixels.
 * @throws {Error} When the browser has no camera access (or it's refused).
 */
export async function readCameraFrame(): Promise<ImageData> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser can't use a camera here. Upload a photo instead.");
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    if (video.videoWidth === 0) {
      await new Promise((resolve) => video.addEventListener("resize", resolve, { once: true }));
    }
    return pixelsOf(video, video.videoWidth, video.videoHeight);
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * Draws the edge map on a canvas, with the document's outline on top.
 *
 * @param canvas - Where to draw; it's resized to the image.
 * @param result - What {@link detect} found.
 * @throws {Error} When the browser has no 2D canvas.
 */
export function drawResult(canvas: HTMLCanvasElement, result: DetectResult): void {
  const { edges, corners } = result;
  canvas.width = edges.width;
  canvas.height = edges.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't draw on a canvas.");
  const pixels = context.createImageData(edges.width, edges.height);
  pixels.data.set(toImageData(edges).data);
  context.putImageData(pixels, 0, 0);
  if (!corners) return;
  context.strokeStyle = "#3ddc84";
  context.lineWidth = 3;
  context.beginPath();
  corners.forEach((corner, i) =>
    i ? context.lineTo(corner.x, corner.y) : context.moveTo(corner.x, corner.y),
  );
  context.closePath();
  context.stroke();
}

/**
 * Writes corners as `"x,y x,y x,y x,y"`, rounded to whole pixels.
 *
 * @param corners - The corners.
 * @returns The text.
 */
export function formatCorners(corners: Quad): string {
  return corners.map((corner) => `${Math.round(corner.x)},${Math.round(corner.y)}`).join(" ");
}
