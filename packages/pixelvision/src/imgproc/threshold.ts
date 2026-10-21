import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { ThresholdOptions } from "./threshold.model";

/**
 * Finds the gray level that best separates an image into dark and bright
 * (Otsu's method: the level maximising the variance between the two
 * classes).
 *
 * @param image - Single-channel `u8` matrix.
 * @returns The level, 0–255; pixels above it are the bright class.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const level = otsuLevel(gray);
 */
export function otsuLevel(image: Matrix<"u8">): number {
  assertType("otsuLevel", image, "u8");
  assertChannels("otsuLevel", image, 1);
  const histogram = new Float64Array(256);
  const total = image.width * image.height;
  for (let i = 0; i < total; i++) histogram[image.data[i]]++;
  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * histogram[i];
  let weightDark = 0;
  let sumDark = 0;
  let best = 0;
  let bestVariance = -1;
  for (let level = 0; level < 256; level++) {
    weightDark += histogram[level];
    if (weightDark === 0) continue;
    const weightBright = total - weightDark;
    if (weightBright === 0) break;
    sumDark += level * histogram[level];
    const meanDark = sumDark / weightDark;
    const meanBright = (sumAll - sumDark) / weightBright;
    const variance = weightDark * weightBright * (meanDark - meanBright) ** 2;
    if (variance > bestVariance) {
      bestVariance = variance;
      best = level;
    }
  }
  return best;
}

/**
 * Turns a gray image into black and white: pixels above `level` become
 * `max`, the rest 0. Without a level, Otsu's method picks one.
 *
 * @param image - Single-channel `u8` matrix.
 * @param options - Level (default automatic), output value, inversion, optional output matrix.
 * @returns A binary `u8` matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const paper = threshold(gray); // automatic level
 * const dark = threshold(gray, { level: 60, invert: true });
 */
export function threshold(image: Matrix<"u8">, options: ThresholdOptions = {}): Matrix<"u8"> {
  assertType("threshold", image, "u8");
  assertChannels("threshold", image, 1);
  const level = options.level ?? otsuLevel(image);
  const max = options.max ?? 255;
  const [above, below] = options.invert ? [0, max] : [max, 0];
  const out = prepareOutput(options.out, "u8", image.width, image.height, 1);
  const n = image.width * image.height;
  for (let i = 0; i < n; i++) out.data[i] = image.data[i] > level ? above : below;
  return out;
}
