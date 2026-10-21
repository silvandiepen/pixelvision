import { assertInteger } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix, PixelType } from "../core/matrix.model";
import { forEachChannel } from "./planes";
import type { Transform, WarpOptions } from "./warp.model";

/**
 * Reads the coefficients of a transform.
 *
 * @param fn - Name of the calling function, for error messages.
 * @param transform - 9 numbers (or 6 for affine), or a matrix holding them.
 * @param count - Number of coefficients needed.
 * @returns The coefficients.
 * @throws {RangeError} When fewer than `count` numbers are given.
 */
const coefficients = (fn: string, transform: Transform, count: number): ArrayLike<number> => {
  const values = "data" in transform ? transform.data : transform;
  if (values.length < count) {
    throw new RangeError(`${fn} needs ${count} transform values, got ${values.length}`);
  }
  return values;
};

/**
 * Samples a plane bilinearly at `(xs, ys)`, or returns `fill` when the
 * point lies outside the image. Points on the last row or column sample
 * that edge exactly instead of reading past it.
 *
 * @param src - Input plane.
 * @param width - Plane width.
 * @param height - Plane height.
 * @param xs - Column, in pixels.
 * @param ys - Row, in pixels.
 * @param fill - Value outside the image.
 * @returns The interpolated value.
 */
const sample = (
  src: ArrayLike<number>,
  width: number,
  height: number,
  xs: number,
  ys: number,
  fill: number,
): number => {
  if (!(xs >= 0 && ys >= 0 && xs <= width - 1 && ys <= height - 1)) return fill;
  const x0 = Math.floor(xs);
  const y0 = Math.floor(ys);
  const a = xs - x0;
  const b = ys - y0;
  const x1 = x0 + 1 < width ? x0 + 1 : x0;
  const row0 = width * y0;
  const row1 = y0 + 1 < height ? row0 + width : row0;
  const p0 = src[row0 + x0] + a * (src[row0 + x1] - src[row0 + x0]);
  const p1 = src[row1 + x0] + a * (src[row1 + x1] - src[row1 + x0]);
  return p0 + b * (p1 - p0);
};

/**
 * Resolves the output size and output matrix of a warp.
 *
 * @param fn - Name of the calling function.
 * @param image - Input matrix.
 * @param options - Warp options.
 * @returns The output matrix.
 */
const output = <T extends PixelType>(fn: string, image: Matrix<T>, options: WarpOptions<T>) => {
  const width = options.width ?? image.width;
  const height = options.height ?? image.height;
  assertInteger(fn, "width", width, 0);
  assertInteger(fn, "height", height, 0);
  return prepareOutput(options.out, image.type, width, height, image.channels);
};

/**
 * Warps an image through a perspective (projective) transform with
 * bilinear sampling. The transform maps *output* coordinates to *input*
 * coordinates, so pass the inverse of the mapping you want to apply.
 * Each channel is warped separately; 8-bit and integer output is rounded
 * down. Pixels mapping anywhere inside the input, edges included, are
 * sampled (jsfeat filled the first and last row and column).
 *
 * @param image - Matrix to warp, any type and number of channels.
 * @param transform - 3x3 matrix, row by row, mapping output to input pixels.
 * @param options - Output size, fill value for pixels mapping outside, optional output matrix.
 * @returns The warped matrix, same type and channels.
 * @throws {RangeError} When the transform has fewer than 9 values or the size is invalid.
 *
 * @example
 * // Straighten a document whose corners were found in the photo:
 * const toPhoto = perspectiveTransform(outputCorners, photoCorners);
 * const flat = warpPerspective(photo, toPhoto, { width: 856, height: 540 });
 */
export function warpPerspective<T extends PixelType>(
  image: Matrix<T>,
  transform: Transform,
  options: WarpOptions<T> = {},
): Matrix<T> {
  const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = Array.from(
    coefficients("warpPerspective", transform, 9),
  ).slice(0, 9);
  const out = output("warpPerspective", image, options);
  const fill = options.fill ?? 0;
  const { width: sw, height: sh } = image;
  const { width: dw, height: dh } = out;
  forEachChannel(image, out, (src, dst) => {
    for (let y = 0, d = 0; y < dh; y++) {
      let xs0 = m01 * y + m02;
      let ys0 = m11 * y + m12;
      let ws = m21 * y + m22;
      for (let x = 0; x < dw; x++, d++, xs0 += m00, ys0 += m10, ws += m20) {
        const scale = 1 / ws;
        dst[d] = sample(src, sw, sh, xs0 * scale, ys0 * scale, fill);
      }
    }
  });
  return out;
}

/**
 * Warps an image through an affine transform (rotation, scale, shear,
 * translation) with bilinear sampling. The transform maps *output*
 * coordinates to *input* coordinates; only the first two rows are used.
 * Pixels mapping outside the input get `fill` (jsfeat extrapolated up to
 * one pixel past the top and left edges).
 *
 * @param image - Matrix to warp, any type and number of channels.
 * @param transform - 2x3 or 3x3 matrix, row by row, mapping output to input pixels.
 * @param options - Output size, fill value for pixels mapping outside, optional output matrix.
 * @returns The warped matrix, same type and channels.
 * @throws {RangeError} When the transform has fewer than 6 values or the size is invalid.
 *
 * @example
 * // Sample the input shifted 10 px right and 5 px down:
 * const moved = warpAffine(gray, [1, 0, 10, 0, 1, 5]);
 */
export function warpAffine<T extends PixelType>(
  image: Matrix<T>,
  transform: Transform,
  options: WarpOptions<T> = {},
): Matrix<T> {
  const [m00, m01, m02, m10, m11, m12] = Array.from(coefficients("warpAffine", transform, 6)).slice(
    0,
    6,
  );
  const out = output("warpAffine", image, options);
  const fill = options.fill ?? 0;
  const { width: sw, height: sh } = image;
  const { width: dw, height: dh } = out;
  forEachChannel(image, out, (src, dst) => {
    for (let y = 0, d = 0; y < dh; y++) {
      let xs = m01 * y + m02;
      let ys = m11 * y + m12;
      for (let x = 0; x < dw; x++, d++, xs += m00, ys += m10) {
        dst[d] = sample(src, sw, sh, xs, ys, fill);
      }
    }
  });
  return out;
}
