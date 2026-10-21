import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { EqualizeHistogramOptions } from "./equalizeHistogram.model";

/**
 * Spreads gray levels evenly over 0–255 using the cumulative histogram,
 * raising contrast in dull or badly lit images.
 *
 * @param image - Single-channel `u8` matrix.
 * @param options - Optional output matrix.
 * @returns An equalised `u8` matrix of the same size.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const contrasted = equalizeHistogram(gray);
 */
export function equalizeHistogram(
  image: Matrix<"u8">,
  options: EqualizeHistogramOptions = {},
): Matrix<"u8"> {
  assertType("equalizeHistogram", image, "u8");
  assertChannels("equalizeHistogram", image, 1);
  const { width, height, data } = image;
  const size = width * height;
  const out = prepareOutput(options.out, "u8", width, height, 1);
  const histogram = new Int32Array(256);
  for (let i = 0; i < size; i++) histogram[data[i]]++;
  for (let i = 1; i < 256; i++) histogram[i] += histogram[i - 1];
  const norm = 255 / size;
  for (let i = 0; i < size; i++) out.data[i] = (histogram[data[i]] * norm + 0.5) | 0;
  return out;
}
