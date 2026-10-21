import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { forEachChannel } from "./planes";

/**
 * Replaces every pixel by the median of its square neighbourhood, as
 * OpenCV's `medianBlur`: removes salt-and-pepper noise while keeping edges
 * sharp. Borders repeat the edge pixel.
 *
 * @param image - `u8` matrix with 1, 3 or 4 channels (each blurred separately).
 * @param size - Odd window size, 3 or more (default 3).
 * @param out - Optional output matrix.
 * @returns The filtered matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the size isn't odd and at least 3, or the channel count isn't 1, 3 or 4.
 *
 * @example
 * const clean = medianBlur(noisyScan, 5);
 */
export function medianBlur(image: Matrix<"u8">, size = 3, out?: Matrix<"u8">): Matrix<"u8"> {
  assertType("medianBlur", image, "u8");
  assertChannels("medianBlur", image, 1, 3, 4);
  if (!Number.isInteger(size) || size < 3 || size % 2 === 0) {
    throw new RangeError(`medianBlur: size must be an odd integer >= 3, got ${size}`);
  }
  const { width: w, height: h, channels } = image;
  const result = prepareOutput(out, "u8", w, h, channels);
  const r = size >> 1;
  const histogram = new Int32Array(256);
  const half = (size * size) >> 1;
  const clamp = (v: number, max: number) => (v < 0 ? 0 : v > max ? max : v);
  forEachChannel(image, result, (src, dst) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        histogram.fill(0);
        for (let dy = -r; dy <= r; dy++) {
          const row = clamp(y + dy, h - 1) * w;
          for (let dx = -r; dx <= r; dx++) histogram[src[row + clamp(x + dx, w - 1)]]++;
        }
        let count = 0;
        let value = 0;
        while ((count += histogram[value]) <= half) value++;
        dst[y * w + x] = value;
      }
    }
  });
  return result;
}
