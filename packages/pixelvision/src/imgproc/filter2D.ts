import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { saturateU8 } from "../core/round";
import type { Filter2DFloatOptions, Filter2DOptions, Kernel } from "./filter2D.model";

const f32 = Math.fround;

/**
 * Checks that a kernel is a non-empty rectangle of finite numbers.
 *
 * @param kernel - Rows of weights.
 * @throws {RangeError} When it is empty, ragged or holds a non-finite value.
 */
function assertKernel(kernel: Kernel): void {
  const width = kernel[0]?.length ?? 0;
  if (width === 0 || kernel.some((row) => row.length !== width || !row.every(Number.isFinite))) {
    throw new RangeError(
      "filter2D: kernel must be non-empty rows of equal length of finite numbers",
    );
  }
}

/**
 * Maps every position from `-before` to `size + after - 1` to the index it
 * reads, repeating the edge (OpenCV's `BORDER_REPLICATE`).
 *
 * @param size - Number of pixels along the axis.
 * @param before - Positions needed before the first pixel.
 * @param after - Positions needed after the last pixel.
 * @returns Clamped indices, offset by `before`.
 */
export function replicateIndices(size: number, before: number, after: number): Int32Array {
  const table = new Int32Array(size + before + after);
  for (let i = 0; i < table.length; i++) table[i] = Math.min(size - 1, Math.max(0, i - before));
  return table;
}

/**
 * Convolves an image with any kernel (strictly, correlates: the kernel is
 * not flipped), as OpenCV's `filter2D` with the anchor at the kernel centre
 * and `BORDER_REPLICATE`: pixels outside the image repeat the edge pixel.
 * Sharpen, emboss, detect edges in a chosen direction, or blur with a custom
 * shape.
 *
 * Sums are accumulated in single precision in OpenCV's order, so results
 * match OpenCV exactly for kernels under 50 elements (7 x 7 and smaller).
 * For larger kernels OpenCV switches to a Fourier transform, whose rounding
 * can differ by one level; this function always sums directly.
 *
 * @param image - `u8` matrix with 1, 3 or 4 channels (each filtered separately).
 * @param kernel - Rows of weights; the anchor is at `(floor(width / 2), floor(height / 2))`.
 * @param options - `delta` added to each sum, output `type` (`"u8"` rounds and clamps, `"f32"` keeps the sum) and `out`.
 * @returns The filtered matrix, same size and channels.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the channel count isn't 1, 3 or 4, or the kernel is empty, ragged or not finite.
 *
 * @example
 * const sharp = filter2D(gray, [
 *   [0, -1, 0],
 *   [-1, 5, -1],
 *   [0, -1, 0],
 * ]);
 * const edges = filter2D(gray, [[-1, 0, 1]], { type: "f32" });
 */
export function filter2D(
  image: Matrix<"u8">,
  kernel: Kernel,
  options?: Filter2DOptions,
): Matrix<"u8">;
/**
 * Convolves an image with any kernel into a single-precision float matrix.
 *
 * @param image - `u8` matrix with 1, 3 or 4 channels.
 * @param kernel - Rows of weights.
 * @param options - `type: "f32"`, `delta` and `out`.
 * @returns The filtered `f32` matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the channel count isn't 1, 3 or 4, or the kernel is invalid.
 *
 * @example
 * const dx = filter2D(gray, [[-1, 0, 1]], { type: "f32" });
 */
export function filter2D(
  image: Matrix<"u8">,
  kernel: Kernel,
  options: Filter2DFloatOptions,
): Matrix<"f32">;
export function filter2D(
  image: Matrix<"u8">,
  kernel: Kernel,
  options: Filter2DOptions | Filter2DFloatOptions = {},
): Matrix<"u8"> | Matrix<"f32"> {
  assertType("filter2D", image, "u8");
  assertChannels("filter2D", image, 1, 3, 4);
  assertKernel(kernel);
  const { width: w, height: h, channels: cn, data } = image;
  const kh = kernel.length;
  const kw = kernel[0].length;
  const ax = kw >> 1;
  const ay = kh >> 1;
  // Non-zero weights in row order, as OpenCV keeps them.
  const dx: number[] = [];
  const dy: number[] = [];
  const weights: number[] = [];
  kernel.forEach((row, ky) =>
    row.forEach((value, kx) => {
      const weight = f32(value);
      if (weight !== 0) {
        dx.push(kx);
        dy.push(ky);
        weights.push(weight);
      }
    }),
  );
  const columns = replicateIndices(w, ax, kw - 1 - ax);
  const rows = replicateIndices(h, ay, kh - 1 - ay);
  const delta = f32(options.delta ?? 0);
  const float = options.type === "f32";
  const out = float
    ? prepareOutput(options.out as Matrix<"f32"> | undefined, "f32", w, h, cn)
    : prepareOutput(options.out as Matrix<"u8"> | undefined, "u8", w, h, cn);
  const target = out.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < cn; c++) {
        let sum = delta;
        for (let k = 0; k < weights.length; k++) {
          const value = data[(rows[y + dy[k]] * w + columns[x + dx[k]]) * cn + c];
          sum = f32(sum + f32(weights[k] * value));
        }
        target[(y * w + x) * cn + c] = float ? sum : saturateU8(sum);
      }
    }
  }
  return out;
}
