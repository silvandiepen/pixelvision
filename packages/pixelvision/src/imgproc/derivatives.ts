import { assertChannels } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix, PixelType } from "../core/matrix.model";
import type { DerivativeType, DerivativesOptions } from "./derivatives.model";

/**
 * Computes interleaved x/y gradients with a separable 3x3 kernel: a
 * vertical smoothing `[side, centre, side]` and difference `[-1, 0, 1]`,
 * then the transposed horizontal pass. Rows outside the image mirror
 * (row -1 reads row 1); columns outside repeat the edge.
 *
 * @param fn - Name of the calling function, for error messages.
 * @param image - Single-channel matrix.
 * @param side - Outer smoothing weight (1 for Sobel, 3 for Scharr).
 * @param centre - Centre smoothing weight (2 for Sobel, 10 for Scharr).
 * @param out - Optional output matrix.
 * @returns A 2-channel matrix of `[gx, gy]` per pixel.
 */
const derivatives = <T extends PixelType>(
  fn: string,
  image: Matrix<T>,
  side: number,
  centre: number,
  out: DerivativesOptions["out"],
): Matrix<DerivativeType<T>> => {
  assertChannels(fn, image, 1);
  const { width, height, data } = image;
  const integer = image.type === "u8" || image.type === "i32";
  const type = (integer ? "i32" : "f32") as DerivativeType<T>;
  const result = prepareOutput(
    out as Matrix<DerivativeType<T>> | undefined,
    type,
    width,
    height,
    2,
  );
  const gradients = result.data;
  const smooth = integer ? new Int32Array(width + 2) : new Float32Array(width + 2);
  const diff = integer ? new Int32Array(width + 2) : new Float32Array(width + 2);

  for (let y = 0, d = 0; y < height; y++) {
    const above = (y > 0 ? y - 1 : Math.min(1, height - 1)) * width;
    const row = y * width;
    const below = (y < height - 1 ? y + 1 : Math.max(height - 2, 0)) * width;
    for (let x = 0; x < width; x++) {
      const a = data[above + x];
      const b = data[below + x];
      smooth[x + 1] = (a + b) * side + data[row + x] * centre;
      diff[x + 1] = b - a;
    }
    smooth[0] = smooth[1];
    smooth[width + 1] = smooth[width];
    diff[0] = diff[1];
    diff[width + 1] = diff[width];
    for (let x = 0; x < width; x++) {
      gradients[d++] = smooth[x + 2] - smooth[x];
      gradients[d++] = (diff[x + 2] + diff[x]) * side + diff[x + 1] * centre;
    }
  }
  return result;
};

/**
 * Computes the horizontal and vertical gradient of every pixel with the
 * 3x3 Sobel operator. Large magnitudes mark edges; the direction of
 * `[gx, gy]` points across the edge.
 *
 * @param image - Single-channel matrix (gray).
 * @param options - Optional output matrix.
 * @returns A 2-channel matrix, `[gx, gy]` per pixel: `i32` for `u8`/`i32` input, `f32` otherwise.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const gradients = sobelDerivatives(gray);
 * const gx = gradients.data[(y * gray.width + x) * 2];
 */
export function sobelDerivatives<T extends PixelType>(
  image: Matrix<T>,
  options: DerivativesOptions = {},
): Matrix<DerivativeType<T>> {
  return derivatives("sobelDerivatives", image, 1, 2, options.out);
}

/**
 * Computes the horizontal and vertical gradient of every pixel with the
 * 3x3 Scharr operator: like Sobel, with better rotational accuracy.
 *
 * @param image - Single-channel matrix (gray).
 * @param options - Optional output matrix.
 * @returns A 2-channel matrix, `[gx, gy]` per pixel: `i32` for `u8`/`i32` input, `f32` otherwise.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const gradients = scharrDerivatives(gray);
 */
export function scharrDerivatives<T extends PixelType>(
  image: Matrix<T>,
  options: DerivativesOptions = {},
): Matrix<DerivativeType<T>> {
  return derivatives("scharrDerivatives", image, 3, 10, options.out);
}
