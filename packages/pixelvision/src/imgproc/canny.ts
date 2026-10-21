import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { CannyOptions } from "./canny.model";
import { sobelDerivatives } from "./derivatives";

// tan(22.5°) in 15-bit fixed point.
const TAN_22_5 = 13573;

/**
 * Finds edges with the Canny detector: Sobel gradients (L1 magnitude),
 * thinning to one-pixel ridges along the gradient direction, then
 * hysteresis — strong pixels (above `high`) start edges, which grow
 * through connected pixels above `low`.
 *
 * Blur first (e.g. {@link gaussianBlur}) to keep noise from producing
 * edges. The magnitude is `|gx| + |gy|`, so thresholds scale with it.
 *
 * @param image - Single-channel `u8` matrix (gray).
 * @param options - Hysteresis thresholds (swapped if `low > high`) and an optional output matrix.
 * @returns A `u8` matrix: 255 on edges, 0 elsewhere.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const edges = canny(gaussianBlur(gray, { kernelSize: 3 }), { low: 20, high: 50 });
 */
export function canny(image: Matrix<"u8">, options: CannyOptions): Matrix<"u8"> {
  assertType("canny", image, "u8");
  assertChannels("canny", image, 1);
  const { width: w, height: h } = image;
  const low = Math.min(options.low, options.high);
  const high = Math.max(options.low, options.high);
  const out = prepareOutput(options.out, "u8", w, h, 1);
  cannyFromGradients(sobelDerivatives(image).data, w, h, low, high, out);
  return out;
}

/**
 * The Canny steps after the gradients: thinning along the gradient
 * direction, then hysteresis. Shared with detectors that compute their own
 * gradients.
 *
 * @param dxdy - Interleaved `[gx, gy]` per pixel, row by row.
 * @param w - Width.
 * @param h - Height.
 * @param low - Lower hysteresis threshold (on `|gx| + |gy|`).
 * @param high - Upper hysteresis threshold, at least `low`.
 * @param out - `u8` matrix of `w x h` that receives 255 on edges, 0 elsewhere.
 */
export const cannyFromGradients = (
  dxdy: ArrayLike<number>,
  w: number,
  h: number,
  low: number,
  high: number,
  out: Matrix<"u8">,
): void => {
  const mapWidth = w + 2;
  // Edge state per pixel, with a one-pixel frame: 0 none, 1 candidate, 2 edge.
  const map = new Int32Array((h + 2) * mapWidth);
  // Three rolling rows of magnitudes (previous, current, next), each padded by one.
  const magnitudes = new Int32Array(3 * mapWidth);
  const stack = new Int32Array(w * h);
  let stackSize = 0;
  let row0 = 1;
  let row1 = mapWidth + 1;
  let row2 = 2 * mapWidth + 1;
  let mapIndex = mapWidth + 1;

  const magnitudeRow = (target: number, gradientRow: number) => {
    for (let j = 0; j < w; j++) {
      magnitudes[target + j] =
        Math.abs(dxdy[gradientRow + 2 * j]) + Math.abs(dxdy[gradientRow + 2 * j + 1]);
    }
  };

  magnitudeRow(row1, 0);
  for (let i = 1, gradient = 2 * w; i <= h; i++, gradient += 2 * w) {
    if (i === h) magnitudes.fill(0, row2, row2 + w);
    else magnitudeRow(row2, gradient);

    let suppress = false;
    map[mapIndex - 1] = 0;
    for (let j = 0, g = gradient - 2 * w; j < w; j++, g += 2) {
      const f = magnitudes[row1 + j];
      let isRidge = false;
      if (f > low) {
        const gx = dxdy[g];
        const gy = dxdy[g + 1];
        const x = Math.abs(gx);
        const y = Math.abs(gy) << 15;
        const tg22x = x * TAN_22_5;
        const tg67x = tg22x + ((x + x) << 15);
        if (y < tg22x) {
          isRidge = f > magnitudes[row1 + j - 1] && f >= magnitudes[row1 + j + 1];
        } else if (y > tg67x) {
          isRidge = f > magnitudes[row0 + j] && f >= magnitudes[row2 + j];
        } else {
          const s = (gx ^ gy) < 0 ? -1 : 1;
          isRidge = f > magnitudes[row0 + j - s] && f > magnitudes[row2 + j + s];
        }
      }
      if (isRidge) {
        if (f > high && !suppress && map[mapIndex + j - mapWidth] !== 2) {
          map[mapIndex + j] = 2;
          suppress = true;
          stack[stackSize++] = mapIndex + j;
        } else {
          map[mapIndex + j] = 1;
        }
      } else {
        map[mapIndex + j] = 0;
        suppress = false;
      }
    }
    map[mapIndex + w] = 0;
    mapIndex += mapWidth;
    const recycled = row0;
    row0 = row1;
    row1 = row2;
    row2 = recycled;
  }

  // Hysteresis: grow edges into neighbouring candidates.
  const neighbours = [
    -mapWidth - 1,
    -mapWidth,
    -mapWidth + 1,
    -1,
    1,
    mapWidth - 1,
    mapWidth,
    mapWidth + 1,
  ];
  while (stackSize > 0) {
    const centre = stack[--stackSize];
    for (const offset of neighbours) {
      const n = centre + offset;
      if (map[n] === 1) {
        map[n] = 2;
        stack[stackSize++] = n;
      }
    }
  }

  for (let i = 0, d = 0, m = mapWidth + 1; i < h; i++, m += mapWidth) {
    for (let j = 0; j < w; j++) out.data[d++] = map[m + j] === 2 ? 255 : 0;
  }
};
