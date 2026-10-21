import type { RGBAImage } from "pixelvision";

/** Largest width and height of uploaded images and webcam frames. */
export const MAX_INPUT_SIZE = { width: 640, height: 480 };

/** Largest width and height of webcam frames, kept small so demos run every frame. */
export const MAX_WEBCAM_SIZE = { width: 320, height: 240 };

/**
 * Fits a size inside a box, keeping the aspect ratio and never enlarging.
 *
 * @param width - Source width.
 * @param height - Source height.
 * @param box - Largest allowed width and height.
 * @returns The fitted size in whole pixels.
 */
export function fitSize(
  width: number,
  height: number,
  box: { width: number; height: number },
): { width: number; height: number } {
  const scale = Math.min(1, box.width / width, box.height / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Draws an image source onto a canvas, scaled to fit a box, and reads the
 * pixels back.
 *
 * @param source - An image bitmap or a playing video.
 * @param sourceWidth - Width of the source.
 * @param sourceHeight - Height of the source.
 * @param box - Largest allowed width and height.
 * @param canvas - Canvas to reuse (e.g. frame after frame).
 * @returns RGBA pixels.
 */
export function readPixels(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  box: { width: number; height: number },
  canvas: HTMLCanvasElement = document.createElement("canvas"),
): RGBAImage {
  const { width, height } = fitSize(sourceWidth, sourceHeight, box);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This browser can't draw on a 2D canvas.");
  context.drawImage(source, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

/**
 * Decodes an image file and reads its pixels, scaled down to at most
 * {@link MAX_INPUT_SIZE}.
 *
 * @param file - An image file (PNG, JPEG, …).
 * @returns RGBA pixels.
 * @throws {Error} When the file can't be decoded.
 */
export async function readImageFile(file: File): Promise<RGBAImage> {
  const bitmap = await createImageBitmap(file);
  try {
    return readPixels(bitmap, bitmap.width, bitmap.height, MAX_INPUT_SIZE);
  } finally {
    bitmap.close();
  }
}
