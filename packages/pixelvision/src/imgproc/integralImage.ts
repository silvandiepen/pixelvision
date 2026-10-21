import { assertChannels } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { IntegralImage, IntegralImageOptions } from "./integralImage.model";

/**
 * Builds integral tables (summed-area tables) of a single-channel image.
 * Any rectangle sum is then four lookups:
 * `S(x1, y1) - S(x0, y1) - S(x1, y0) + S(x0, y0)`.
 *
 * @param image - Single-channel matrix.
 * @param options - Which tables to build: `sum` (default), `squares`, `tilted`.
 * @returns The requested tables, each `(width + 1) x (height + 1)`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const { sum } = integralImage(gray);
 * const stride = gray.width + 1;
 * const total = sum.data[gray.height * stride + gray.width];
 */
export function integralImage(image: Matrix, options: IntegralImageOptions = {}): IntegralImage {
  assertChannels("integralImage", image, 1);
  const { width, height, data } = image;
  const stride = width + 1;
  const make = () => createMatrix(stride, height + 1, { type: "f64" });
  const result: IntegralImage = {};

  const accumulate = (value: (v: number) => number): Matrix<"f64"> => {
    const table = make();
    const target = table.data;
    for (let y = 0, k = 0; y < height; y++) {
      let rowSum = 0;
      const p = (y + 1) * stride + 1;
      for (let x = 0; x < width; x++, k++) {
        rowSum += value(data[k]);
        target[p + x] = target[p + x - stride] + rowSum;
      }
    }
    return table;
  };

  if (options.sum ?? true) result.sum = accumulate((v) => v);
  if (options.squares) result.squares = accumulate((v) => v * v);
  if (options.tilted) {
    const table = make();
    const t = table.data;
    // Pass 1: each cell adds the pixel to the cell up-left of it.
    for (let y = 0, k = 0; y < height; y++) {
      for (let x = 0; x < width; x++, k++) {
        const p = (y + 1) * stride + x + 1;
        t[p] = data[k] + t[p - stride - 1];
      }
    }
    // Pass 2: the last column also takes the cell above.
    for (let y = 0, p = stride + width, up = width; y < height; y++, p += stride, up += stride) {
      t[p] += t[up];
    }
    // Pass 3: fold the right-hand diagonals in, bottom-up, column by column.
    for (let x = width - 1; x > 0; x--) {
      for (let y = height, p = x + height * stride; y > 0; y--, p -= stride) {
        t[p] += t[p - stride] + t[p - stride + 1];
      }
    }
    // Column 0 (left of the image) still covers the pixels of the diagonal
    // running down-right from it: the cell up-right of it holds exactly those.
    for (let y = 1, p = stride; y <= height; y++, p += stride) t[p] = t[p - stride + 1];
    result.tilted = table;
  }
  return result;
}
