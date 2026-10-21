import type { Matrix, RGBAImage } from "pixelvision";
import { toDisplayPixels } from "./display";

/**
 * Encodes an image as a PNG or JPEG file with a canvas.
 *
 * @param image - A `u8` matrix (1, 3 or 4 channels) or RGBA pixels.
 * @param type - The file type.
 * @param quality - JPEG quality, 0–1.
 * @returns The file.
 * @throws {Error} When the browser can't encode it.
 */
export function encodeImage(
  image: Matrix<"u8"> | RGBAImage,
  type: "image/png" | "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const { width, height, data } = toDisplayPixels(image);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("This browser can't draw on a 2D canvas."));
  context.putImageData(new ImageData(data, width, height), 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`This browser can't encode ${type}.`))),
      type,
      quality,
    ),
  );
}

/**
 * Hands a file to the browser to save, as a download.
 *
 * @param blob - The file's contents.
 * @param fileName - The suggested name.
 */
export function saveBlob(blob: Blob, fileName: string): void {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Some browsers read the URL after `click` returns, so it's released a little later.
  window.setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
}

/**
 * Cuts a rectangle out of an image, clamped to the image.
 *
 * @param image - RGBA pixels.
 * @param rect - The rectangle, in pixels.
 * @returns The cut-out pixels.
 */
export function cropImage(
  image: RGBAImage,
  rect: { x: number; y: number; width: number; height: number },
): RGBAImage {
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(image.width, Math.ceil(rect.x + rect.width));
  const y1 = Math.min(image.height, Math.ceil(rect.y + rect.height));
  const width = Math.max(1, x1 - x0);
  const height = Math.max(1, y1 - y0);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height && y0 + y < image.height; y++) {
    const from = ((y0 + y) * image.width + x0) * 4;
    data.set(
      image.data.subarray(from, from + Math.min(width, image.width - x0) * 4),
      y * width * 4,
    );
  }
  return { width, height, data };
}

/**
 * The square around a face to keep as its photo: the face with some room
 * for hair and chin, centred.
 *
 * @param face - The face's box.
 * @param margin - How much bigger than the face, e.g. 1.8.
 * @returns The square.
 */
export function portraitBox(
  face: { x: number; y: number; width: number; height: number },
  margin = 1.8,
): { x: number; y: number; width: number; height: number } {
  const size = Math.max(face.width, face.height) * margin;
  return {
    x: face.x + face.width / 2 - size / 2,
    y: face.y + face.height / 2 - size / 2,
    width: size,
    height: size,
  };
}
