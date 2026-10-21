import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";

/**
 * Second derivative of brightness (sum of the x and y second derivatives),
 * as OpenCV's `Laplacian` with a 3x3 aperture: strong positive or negative
 * values mark edges and fine detail. Its variance is a common sharpness
 * score: blurry photos have little.
 *
 * @param image - Single-channel `u8` matrix.
 * @param options - `size`: 1 for the 4-neighbour kernel `[0 1 0; 1 -4 1; 0 1 0]`
 *   (default), 3 for `[2 0 2; 0 -8 0; 2 0 2]`. Borders mirror (OpenCV's default).
 * @returns An `i32` matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel or the size isn't 1 or 3.
 *
 * @example
 * const l = laplacian(gray);
 * const sharpness = variance(l.data); // higher is sharper
 */
export function laplacian(
  image: Matrix<"u8">,
  options: { size?: 1 | 3; out?: Matrix<"i32"> } = {},
): Matrix<"i32"> {
  assertType("laplacian", image, "u8");
  assertChannels("laplacian", image, 1);
  const size = options.size ?? 1;
  if (size !== 1 && size !== 3) throw new RangeError(`laplacian: size must be 1 or 3, got ${size}`);
  const { width: w, height: h, data } = image;
  const out = prepareOutput(options.out, "i32", w, h, 1);
  // Mirror without repeating the edge (OpenCV's BORDER_REFLECT_101).
  const reflect = (v: number, n: number) => (n === 1 ? 0 : v < 0 ? -v : v >= n ? 2 * n - 2 - v : v);
  const at = (x: number, y: number) => data[reflect(y, h) * w + reflect(x, w)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      out.data[y * w + x] =
        size === 1
          ? at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1) - 4 * at(x, y)
          : 2 * (at(x - 1, y - 1) + at(x + 1, y - 1) + at(x - 1, y + 1) + at(x + 1, y + 1)) -
            8 * at(x, y);
    }
  }
  return out;
}
