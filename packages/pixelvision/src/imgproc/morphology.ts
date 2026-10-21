import { assertChannels, assertInteger, assertType } from "../core/assert";
import { cloneMatrix, prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { MorphologyOptions } from "./morphology.model";

/**
 * Applies a square max or min filter, separably (rows, then columns), the
 * given number of times. Borders are ignored (treated as neutral).
 *
 * @param fn - Calling function name.
 * @param image - Single-channel `u8` matrix.
 * @param options - Radius, iterations, output.
 * @param pick - `Math.max` (dilate) or `Math.min` (erode).
 * @returns The filtered matrix.
 */
const morph = (
  fn: string,
  image: Matrix<"u8">,
  options: MorphologyOptions,
  pick: (a: number, b: number) => number,
): Matrix<"u8"> => {
  assertType(fn, image, "u8");
  assertChannels(fn, image, 1);
  const radius = options.radius ?? 1;
  const iterations = options.iterations ?? 1;
  assertInteger(fn, "radius", radius, 0);
  assertInteger(fn, "iterations", iterations, 0);
  const { width: w, height: h } = image;
  let current = cloneMatrix(image).data;
  const temp = new Uint8Array(w * h);
  for (let it = 0; it < iterations; it++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let v = current[y * w + x];
        for (let k = Math.max(0, x - radius); k <= Math.min(w - 1, x + radius); k++)
          v = pick(v, current[y * w + k]);
        temp[y * w + x] = v;
      }
    }
    const next = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let v = temp[y * w + x];
        for (let k = Math.max(0, y - radius); k <= Math.min(h - 1, y + radius); k++)
          v = pick(v, temp[k * w + x]);
        next[y * w + x] = v;
      }
    }
    current = next;
  }
  const out = prepareOutput(options.out, "u8", w, h, 1);
  out.data.set(current);
  return out;
};

/**
 * Grows bright regions: every pixel becomes the maximum of its square
 * neighbourhood. Closes small gaps in edge maps and masks.
 *
 * @param image - Single-channel `u8` matrix.
 * @param options - Radius (1 = 3x3), iterations, output matrix.
 * @returns The dilated matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it has more than one channel or the radius or iterations are invalid.
 *
 * @example
 * const closedEdges = dilate(canny(gray, { low: 30, high: 90 }));
 */
export function dilate(image: Matrix<"u8">, options: MorphologyOptions = {}): Matrix<"u8"> {
  return morph("dilate", image, options, Math.max);
}

/**
 * Shrinks bright regions: every pixel becomes the minimum of its square
 * neighbourhood. Removes specks and thin bridges.
 *
 * @param image - Single-channel `u8` matrix.
 * @param options - Radius (1 = 3x3), iterations, output matrix.
 * @returns The eroded matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it has more than one channel or the radius or iterations are invalid.
 *
 * @example
 * const cleaned = erode(mask, { radius: 1 });
 */
export function erode(image: Matrix<"u8">, options: MorphologyOptions = {}): Matrix<"u8"> {
  return morph("erode", image, options, Math.min);
}
