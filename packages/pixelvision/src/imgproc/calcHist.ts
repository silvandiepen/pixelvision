import { assertChannels, assertInteger, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { CalcHistOptions } from "./calcHist.model";

/**
 * The bin of every byte value for uniform bins over `range`, as OpenCV
 * computes it: `floor(v · bins / (high − low) − low · bins / (high − low))`,
 * with the range in single precision; -1 for values outside `[low, high)`.
 *
 * @param fn - Name of the calling function, for the error message.
 * @param bins - Number of bins.
 * @param range - `[low, high)`.
 * @returns 256 bin indices.
 * @throws {RangeError} When the range is empty or not finite.
 */
export const binTable = (
  fn: string,
  bins: number,
  range: readonly [number, number],
): Int32Array => {
  const low = Math.fround(range[0]);
  const high = Math.fround(range[1]);
  if (!(Number.isFinite(low) && Number.isFinite(high) && low < high)) {
    throw new RangeError(`${fn}: range must be finite with low < high, got [${range.join(", ")}]`);
  }
  const scale = bins / (high - low);
  const offset = -scale * low;
  const binOf = new Int32Array(256);
  for (let v = 0; v < 256; v++) {
    binOf[v] =
      v >= low && v < high ? Math.min(Math.max(Math.floor(v * scale + offset), 0), bins - 1) : -1;
  }
  return binOf;
};

/**
 * Counts how many pixels fall into each brightness bin, per channel, as
 * OpenCV's `calcHist` with uniform bins: one histogram per channel, each
 * over `bins` equal slices of `range`. Use it to compare images, find the
 * dominant colour or pick a threshold.
 *
 * Value `v` lands in bin `floor((v - low) · bins / (high - low))`; values
 * outside `[low, high)` aren't counted. Counts match OpenCV exactly.
 *
 * @param image - `u8` matrix with any number of channels.
 * @param options - `bins`, `range`, an optional `mask` and `out`.
 * @returns An `i32` matrix with one row per channel and one column per bin.
 * @throws {TypeError} When the image or mask isn't `u8`.
 * @throws {RangeError} When `bins` isn't a whole number of 1 or more, the range is empty or not finite, or the mask has the wrong size or channel count.
 *
 * @example
 * const histogram = calcHist(gray, { bins: 32 });
 * const darkPixels = histogram.data[0]; // values 0–7
 */
export function calcHist(image: Matrix<"u8">, options: CalcHistOptions = {}): Matrix<"i32"> {
  assertType("calcHist", image, "u8");
  const { bins = 256, range = [0, 256], mask } = options;
  assertInteger("calcHist", "bins", bins, 1);
  const { width, height, channels, data } = image;
  if (mask) {
    assertType("calcHist", mask, "u8");
    assertChannels("calcHist", mask, 1);
    if (mask.width !== width || mask.height !== height) {
      throw new RangeError(
        `calcHist: mask is ${mask.width}x${mask.height}, image is ${width}x${height}`,
      );
    }
  }
  const binOf = binTable("calcHist", bins, range);
  const out = prepareOutput(options.out, "i32", bins, channels, 1);
  out.data.fill(0, 0, bins * channels);
  const pixels = width * height;
  for (let p = 0; p < pixels; p++) {
    if (mask && mask.data[p] === 0) continue;
    for (let c = 0; c < channels; c++) {
      const bin = binOf[data[p * channels + c]];
      if (bin >= 0) out.data[c * bins + bin]++;
    }
  }
  return out;
}
