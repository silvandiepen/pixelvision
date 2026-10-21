import { assertInteger, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { saturateU8 } from "../core/round";
import type { CalcBackProjectOptions } from "./calcBackProject.model";
import { binTable } from "./calcHist";

/**
 * Replaces every pixel with the histogram value of its bin, as OpenCV's
 * `calcBackProject` for one channel: a map of how well each pixel fits the
 * colours the histogram was built from. With a hue histogram of an object,
 * the object lights up; feed the map to {@link meanShift} or
 * {@link camShift} to track it.
 *
 * Bins are uniform over `range`, exactly as {@link calcHist} assigns them,
 * and the histogram's length is the number of bins. Each value is
 * multiplied by `scale` in single precision, rounded half to even and
 * clamped to 0–255, so the result is identical to OpenCV's; pixels outside
 * the range become 0. Scale a histogram of counts so its largest
 * bin maps to 255 with `scale: 255 / max`.
 *
 * @param image - `u8` matrix with any number of channels, e.g. HSV from {@link rgbToHsv}.
 * @param histogram - One value per bin, e.g. a row of {@link calcHist}'s result.
 * @param options - Channel, range, scale and an optional output.
 * @returns A single-channel `u8` matrix the size of the image.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the histogram is empty, the channel doesn't exist, the range is empty or not finite, or the scale isn't finite.
 *
 * @example
 * const hsv = rgbToHsv(frame);
 * const hue = calcHist(hsv, { bins: 16, range: [0, 180], mask: objectMask }); // row 0: hue
 * const counts = hue.data.subarray(0, 16);
 * const likelihood = calcBackProject(hsv, counts, {
 *   range: [0, 180],
 *   scale: 255 / Math.max(...counts),
 * });
 */
export function calcBackProject(
  image: Matrix<"u8">,
  histogram: ArrayLike<number>,
  options: CalcBackProjectOptions = {},
): Matrix<"u8"> {
  assertType("calcBackProject", image, "u8");
  const { channel = 0, range = [0, 256], scale = 1 } = options;
  const { width, height, channels, data } = image;
  assertInteger("calcBackProject", "histogram length", histogram.length, 1);
  assertInteger("calcBackProject", "channel", channel, 0);
  if (channel >= channels) {
    throw new RangeError(`calcBackProject: channel ${channel} of a ${channels}-channel image`);
  }
  if (!Number.isFinite(scale)) {
    throw new RangeError(`calcBackProject: scale must be finite, got ${scale}`);
  }
  const binOf = binTable("calcBackProject", histogram.length, range);
  // The output byte of every input byte. OpenCV keeps the histogram and the
  // scale in single precision and multiplies them in single precision.
  const factor = Math.fround(scale);
  const lookup = new Uint8Array(256);
  for (let v = 0; v < 256; v++) {
    if (binOf[v] >= 0)
      lookup[v] = saturateU8(Math.fround(Math.fround(histogram[binOf[v]]) * factor));
  }
  const out = prepareOutput(options.out, "u8", width, height, 1);
  for (let p = 0; p < width * height; p++) out.data[p] = lookup[data[p * channels + channel]];
  return out;
}
