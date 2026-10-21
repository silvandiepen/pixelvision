import { assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";

/**
 * Marks pixels whose every channel lies within `[lower, upper]` (inclusive),
 * as OpenCV's `inRange`: the usual way to pick a colour, e.g. green screen
 * or a coloured marker in HSV.
 *
 * @param image - `u8` matrix, any number of channels.
 * @param lower - Minimum per channel (one value per channel).
 * @param upper - Maximum per channel.
 * @param out - Optional output matrix.
 * @returns A single-channel `u8` mask: 255 inside the range, 0 outside.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the bounds don't have one value per channel.
 *
 * @example
 * const greenish = inRange(rgbToHsv(frame), [35, 80, 40], [85, 255, 255]);
 */
export function inRange(
  image: Matrix<"u8">,
  lower: readonly number[],
  upper: readonly number[],
  out?: Matrix<"u8">,
): Matrix<"u8"> {
  assertType("inRange", image, "u8");
  const { width, height, channels, data } = image;
  if (lower.length !== channels || upper.length !== channels) {
    throw new RangeError(`inRange: bounds need ${channels} values, one per channel`);
  }
  const result = prepareOutput(out, "u8", width, height, 1);
  for (let p = 0, i = 0; p < width * height; p++, i += channels) {
    let inside = true;
    for (let c = 0; c < channels && inside; c++)
      inside = data[i + c] >= lower[c] && data[i + c] <= upper[c];
    result.data[p] = inside ? 255 : 0;
  }
  return result;
}
