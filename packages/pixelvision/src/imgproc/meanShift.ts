import { assertChannels, assertInteger, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import { roundHalfEven } from "../core/round";
import type { Rect } from "../shape/shapes.model";
import type { MeanShiftOptions, MeanShiftResult, WindowMoments } from "./meanShift.model";

/**
 * Sums the moments of a window of a `u8` image, with coordinates relative to
 * the window's top-left pixel. Every sum is a whole number, so it is exact.
 *
 * @param image - Single-channel `u8` matrix.
 * @param window - Region inside the image.
 * @returns The moments.
 */
export const windowMoments = (image: Matrix<"u8">, window: Rect): WindowMoments => {
  let m00 = 0;
  let m10 = 0;
  let m01 = 0;
  let m20 = 0;
  let m11 = 0;
  let m02 = 0;
  for (let y = 0; y < window.height; y++) {
    const row = (window.y + y) * image.width + window.x;
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    for (let x = 0; x < window.width; x++) {
      const v = image.data[row + x];
      s0 += v;
      s1 += v * x;
      s2 += v * x * x;
    }
    m00 += s0;
    m10 += s1;
    m20 += s2;
    m01 += s0 * y;
    m11 += s1 * y;
    m02 += s0 * y * y;
  }
  return { m00, m10, m01, m20, m11, m02 };
};

/**
 * Checks a probability image and a search window, and reads the stopping
 * rule.
 *
 * @param fn - Name of the calling function, for the error message.
 * @param image - The probability image.
 * @param window - The window.
 * @param options - The stopping rule.
 * @returns Most moves, and the squared distance below which to stop.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel, the window isn't whole numbers with a positive size, `maxIterations` isn't a whole number of 1 or more, or `epsilon` is negative.
 */
export const readSearch = (
  fn: string,
  image: Matrix<"u8">,
  window: Rect,
  options: MeanShiftOptions,
): { maxIterations: number; minMove2: number } => {
  assertType(fn, image, "u8");
  assertChannels(fn, image, 1);
  if (
    ![window.x, window.y, window.width, window.height].every(Number.isInteger) ||
    window.width <= 0 ||
    window.height <= 0
  ) {
    throw new RangeError(`${fn}: the window needs whole-number coordinates and a positive size`);
  }
  const { maxIterations = 10, epsilon = 1 } = options;
  assertInteger(fn, "maxIterations", maxIterations, 1);
  if (!(epsilon >= 0)) throw new RangeError(`${fn}: epsilon must be 0 or more, got ${epsilon}`);
  return { maxIterations, minMove2: roundHalfEven(epsilon * epsilon) };
};

/**
 * Intersects a rectangle with the image.
 *
 * @param r - The rectangle.
 * @param width - Image width.
 * @param height - Image height.
 * @returns The overlap; zero-sized when there's none.
 */
const clip = (r: Rect, width: number, height: number): Rect => {
  const x = Math.max(r.x, 0);
  const y = Math.max(r.y, 0);
  const w = Math.min(r.x + r.width, width) - x;
  const h = Math.min(r.y + r.height, height) - y;
  return w > 0 && h > 0 ? { x, y, width: w, height: h } : { x: 0, y: 0, width: 0, height: 0 };
};

/**
 * Moves a window to the densest nearby part of a probability image, as
 * OpenCV's `meanShift`: it repeatedly centres the window on the centroid of
 * the probability under it, until it moves less than `epsilon` pixels or
 * `maxIterations` moves were made. Use it to follow an object from frame to
 * frame: back-project its colour histogram (see {@link calcBackProject})
 * and start from the previous frame's window.
 *
 * The window keeps its size, stays inside the image, and moves in whole
 * pixels; the result is identical to OpenCV's.
 *
 * @param probability - Single-channel `u8` matrix: how likely each pixel is part of the object.
 * @param window - Where to start; whole pixels, positive size.
 * @param options - When to stop.
 * @returns The final window and the iteration count.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel, the window isn't whole numbers with a positive size, or a stopping option is invalid.
 *
 * @example
 * let window = { x: 100, y: 80, width: 60, height: 60 };
 * // Each frame:
 * ({ window } = meanShift(calcBackProject(rgbToHsv(frame), hueHistogram, backProjectOptions), window));
 */
export function meanShift(
  probability: Matrix<"u8">,
  window: Rect,
  options: MeanShiftOptions = {},
): MeanShiftResult {
  const { maxIterations, minMove2 } = readSearch("meanShift", probability, window, options);
  const { width, height } = probability;
  let current = { ...window };
  let iterations = 0;
  for (; iterations < maxIterations; iterations++) {
    current = clip(current, width, height);
    if (current.width === 0) {
      current = { x: width >> 1, y: height >> 1, width: 1, height: 1 };
    }
    const m = windowMoments(probability, current);
    if (m.m00 === 0) break;
    let dx = roundHalfEven(m.m10 / m.m00 - current.width * 0.5);
    let dy = roundHalfEven(m.m01 / m.m00 - current.height * 0.5);
    const nx = Math.min(Math.max(current.x + dx, 0), width - current.width);
    const ny = Math.min(Math.max(current.y + dy, 0), height - current.height);
    dx = nx - current.x;
    dy = ny - current.y;
    current.x = nx;
    current.y = ny;
    if (dx * dx + dy * dy < minMove2) break;
  }
  return { window: current, iterations };
}
