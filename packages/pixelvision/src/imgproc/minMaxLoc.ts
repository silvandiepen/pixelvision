import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import type { MinMaxLoc } from "./minMaxLoc.model";

/**
 * Finds the smallest and largest values of a single-channel matrix and
 * where they are, as OpenCV's `minMaxLoc`: ties go to the first position in
 * row order. The usual last step of {@link matchTemplate}.
 *
 * @param matrix - Single-channel matrix of any element type.
 * @param mask - Optional single-channel `u8` matrix of the same size; only non-zero positions count.
 * @returns The extremes and their positions.
 * @throws {TypeError} When the mask isn't `u8`.
 * @throws {RangeError} When the matrix has more than one channel, the mask doesn't match it, or nothing is left to search (empty matrix or mask).
 *
 * @example
 * const { max, maxLoc } = minMaxLoc(matchTemplate(frame, logo));
 */
export function minMaxLoc(matrix: Matrix, mask?: Matrix<"u8">): MinMaxLoc {
  assertChannels("minMaxLoc", matrix, 1);
  const { width, height, data } = matrix;
  if (mask) {
    assertType("minMaxLoc", mask, "u8");
    assertChannels("minMaxLoc", mask, 1);
    if (mask.width !== width || mask.height !== height) {
      throw new RangeError(
        `minMaxLoc: mask is ${mask.width}x${mask.height}, matrix is ${width}x${height}`,
      );
    }
  }
  let min = Infinity;
  let max = -Infinity;
  let minIndex = -1;
  let maxIndex = -1;
  for (let i = 0; i < width * height; i++) {
    if (mask && mask.data[i] === 0) continue;
    const v = data[i];
    if (minIndex < 0 || v < min) {
      min = v;
      minIndex = i;
    }
    if (maxIndex < 0 || v > max) {
      max = v;
      maxIndex = i;
    }
  }
  if (minIndex < 0) throw new RangeError("minMaxLoc: no values to search");
  const at = (i: number) => ({ x: i % width, y: Math.floor(i / width) });
  return { min, max, minLoc: at(minIndex), maxLoc: at(maxIndex) };
}
