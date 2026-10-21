import { assertChannels, assertInteger, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import { pyrDown } from "../imgproc/pyrDown";

/**
 * Builds an image pyramid: the image itself, then each level half the
 * size of the one before (2x2 averages). Coarse levels let trackers and
 * detectors handle large motion and scale.
 *
 * @param image - Single-channel `u8` matrix; becomes level 0 (not copied).
 * @param levels - Number of levels including the full-size one (at least 1).
 * @returns The levels, largest first.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel or `levels` is below 1.
 *
 * @example
 * const pyramid = buildPyramid(gray, 4); // full, 1/2, 1/4, 1/8
 */
export function buildPyramid(image: Matrix<"u8">, levels: number): Matrix<"u8">[] {
  assertType("buildPyramid", image, "u8");
  assertChannels("buildPyramid", image, 1);
  assertInteger("buildPyramid", "levels", levels, 1);
  const pyramid = [image];
  for (let i = 1; i < levels; i++) pyramid.push(pyrDown(pyramid[i - 1]));
  return pyramid;
}
