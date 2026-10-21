import type { ImageLike } from "pixelvision";
import { INPUT_SIZE } from "./decode";
import { FaceNeuralError } from "./errors";

/**
 * Checks that an image can be read safely: positive integer sizes, 1, 3 or 4 channels, and a
 * buffer holding at least `width × height × channels` values.
 *
 * @param image - The image to check.
 * @returns The channel count (4 when not given).
 * @throws {FaceNeuralError} With code `invalid-image` when any of these doesn't hold.
 */
export const validateImage = (image: ImageLike): number => {
  const { width, height, data } = image;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new FaceNeuralError(
      "invalid-image",
      `letterbox: width and height must be positive integers, got ${width} x ${height}`,
    );
  }
  const channels = image.channels ?? 4;
  if (channels !== 1 && channels !== 3 && channels !== 4) {
    throw new FaceNeuralError(
      "invalid-image",
      `letterbox: images must have 1, 3 or 4 channels, got ${channels}`,
    );
  }
  const needed = width * height * channels;
  const length = (data as ArrayLike<number> | undefined)?.length;
  if (typeof length !== "number" || length < needed) {
    throw new FaceNeuralError(
      "invalid-image",
      `letterbox: a ${width} x ${height} image with ${channels} channels needs ${needed} values, got ${length ?? "none"}`,
    );
  }
  return channels;
};

/**
 * Letterboxes an image into YuNet's 640x640 BGR float input (values
 * 0–255, channels first): scaled to fit, top-left aligned, padded with 0.
 *
 * @param image - RGBA pixels (`ImageData`) or a matrix with 1, 3 or 4 channels (RGB order).
 * @returns The input tensor data and the scale from image to model pixels.
 * @throws {FaceNeuralError} With code `invalid-image` for zero or non-finite sizes, other channel
 *   counts, or a buffer shorter than the sizes say.
 */
export const letterbox = (image: ImageLike): { data: Float32Array; scale: number } => {
  const channels = validateImage(image);
  const { width, height, data } = image;
  const scale = INPUT_SIZE / Math.max(width, height);
  const area = INPUT_SIZE * INPUT_SIZE;
  const tensor = new Float32Array(3 * area);
  const outWidth = Math.min(INPUT_SIZE, Math.round(width * scale));
  const outHeight = Math.min(INPUT_SIZE, Math.round(height * scale));
  const sample = (x: number, y: number, c: number) => {
    // Bilinear, centre-aligned.
    const sx = Math.min(Math.max((x + 0.5) / scale - 0.5, 0), width - 1);
    const sy = Math.min(Math.max((y + 0.5) / scale - 0.5, 0), height - 1);
    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    const x1 = Math.min(x0 + 1, width - 1);
    const y1 = Math.min(y0 + 1, height - 1);
    const a = sx - x0;
    const b = sy - y0;
    const at = (px: number, py: number) =>
      data[(py * width + px) * channels + (channels === 1 ? 0 : c)];
    const top = at(x0, y0) + a * (at(x1, y0) - at(x0, y0));
    const bottom = at(x0, y1) + a * (at(x1, y1) - at(x0, y1));
    return top + b * (bottom - top);
  };
  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const p = y * INPUT_SIZE + x;
      // Model expects BGR.
      tensor[p] = sample(x, y, 2);
      tensor[area + p] = sample(x, y, 1);
      tensor[2 * area + p] = sample(x, y, 0);
    }
  }
  return { data: tensor, scale };
};
