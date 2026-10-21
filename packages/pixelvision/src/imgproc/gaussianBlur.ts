import { assertInteger } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix, PixelArrays, PixelType } from "../core/matrix.model";
import { gaussianKernel } from "../math/gaussianKernel";
import type { GaussianBlurOptions } from "./gaussianBlur.model";
import { forEachChannel } from "./planes";

type Values = PixelArrays[PixelType];

/**
 * Blurs one plane with a separable kernel: rows into `target`, then
 * columns of `target` in place. Borders repeat the edge pixel. 8-bit
 * planes use fixed-point weights summing to 256 and are capped at 255
 * after each pass.
 *
 * @param source - Input plane.
 * @param target - Output plane (also the intermediate).
 * @param buffer - Scratch row/column with room for the kernel overhang.
 * @param width - Plane width.
 * @param height - Plane height.
 * @param kernel - Kernel weights.
 * @param fixedPoint - Whether weights are 8.8 fixed point.
 */
const convolve = (
  source: ArrayLike<number>,
  target: Values,
  buffer: Values,
  width: number,
  height: number,
  kernel: ArrayLike<number>,
  fixedPoint: boolean,
): void => {
  const size = kernel.length;
  const half = size >> 1;
  const store = fixedPoint ? (sum: number) => Math.min(sum >> 8, 255) : (sum: number) => sum;

  const pass = (
    read: ArrayLike<number>,
    length: number,
    lines: number,
    start: (line: number) => number,
    step: number,
  ) => {
    for (let line = 0; line < lines; line++) {
      const first = start(line);
      const edgeStart = read[first];
      const edgeEnd = read[first + (length - 1) * step];
      for (let j = 0; j < half; j++) buffer[j] = edgeStart;
      for (let j = 0; j < length; j++) buffer[j + half] = read[first + j * step];
      for (let j = length; j < half + length; j++) buffer[j + half] = edgeEnd;
      for (let j = 0; j < length; j++) {
        let sum = buffer[j] * kernel[0];
        for (let k = 1; k < size; k++) sum += buffer[k + j] * kernel[k];
        target[first + j * step] = store(sum);
      }
    }
  };

  pass(source, width, height, (row) => row * width, 1);
  pass(target, height, width, (column) => column, width);
};

/**
 * Smooths an image with a Gaussian kernel, the usual first step before
 * edge or feature detection. Every channel is blurred separately; borders
 * repeat the edge pixel.
 *
 * 8-bit images use fixed-point weights (as jsfeat and OpenCV do), so
 * results are integers rounded down. Matrices of type `i32`, `f32` and
 * `f64` are supported too.
 *
 * @param image - Matrix to blur.
 * @param options - Kernel size and/or sigma, and an optional output matrix.
 * @returns A matrix of the same type, size and channels.
 * @throws {RangeError} When the kernel size is not a positive odd integer.
 *
 * @example
 * const smooth = gaussianBlur(gray, { kernelSize: 5 });
 * const softer = gaussianBlur(gray, { sigma: 2 });
 */
export function gaussianBlur<T extends PixelType>(
  image: Matrix<T>,
  options: GaussianBlurOptions<T> = {},
): Matrix<T> {
  const sigma = options.sigma ?? 0;
  const kernelSize = options.kernelSize ?? (sigma > 0 ? 2 * Math.ceil(3 * sigma) + 1 : 3);
  assertInteger("gaussianBlur", "kernelSize", kernelSize, 1);
  if (kernelSize % 2 === 0) {
    throw new RangeError(`gaussianBlur: kernelSize must be odd, got ${kernelSize}`);
  }
  const { width, height, channels, type } = image;
  const out = prepareOutput(options.out, type, width, height, channels);
  if (width === 0 || height === 0) return out;

  const fixedPoint = type === "u8";
  const kernel = fixedPoint
    ? gaussianKernel(kernelSize, { sigma, integer: true })
    : gaussianKernel(kernelSize, { sigma });
  const bufferLength = kernelSize + Math.max(width, height);
  const buffer: Values =
    type === "u8" || type === "i32" ? new Int32Array(bufferLength) : new Float32Array(bufferLength);

  forEachChannel(image, out, (input, output) =>
    convolve(input, output, buffer, width, height, kernel, fixedPoint),
  );
  return out;
}
