import { assertInteger } from "../core/assert";
import type { GaussianKernelOptions } from "./gaussianKernel.model";

const binomial: Record<number, readonly number[]> = {
  1: [1],
  3: [0.25, 0.5, 0.25],
  5: [0.0625, 0.25, 0.375, 0.25, 0.0625],
  7: [0.03125, 0.109375, 0.21875, 0.28125, 0.21875, 0.109375, 0.03125],
};

/**
 * Computes a 1D Gaussian kernel. Apply it along rows and then columns for
 * a 2D blur.
 *
 * @param size - Number of weights (at least 1).
 * @param options - Sigma, and whether to return fixed-point integers.
 * @returns Float weights summing to 1, or integer weights summing to about 256.
 * @throws {RangeError} When `size` is not a positive integer.
 *
 * @example
 * gaussianKernel(5); // Float32Array [0.0625, 0.25, 0.375, 0.25, 0.0625]
 * gaussianKernel(5, { integer: true }); // Int32Array [16, 64, 96, 64, 16]
 */
export function gaussianKernel(
  size: number,
  options: GaussianKernelOptions & { integer: true },
): Int32Array;
export function gaussianKernel(size: number, options?: GaussianKernelOptions): Float32Array;
export function gaussianKernel(
  size: number,
  options: GaussianKernelOptions = {},
): Float32Array | Int32Array {
  assertInteger("gaussianKernel", "size", size, 1);
  const sigma = options.sigma ?? 0;
  // Weights are held in single precision before normalising, as in jsfeat,
  // so 8-bit blurs round exactly the same way.
  const weights = new Float32Array(size);
  let sum = 0;
  const fixed = sigma <= 0 ? binomial[size] : undefined;
  if (fixed) {
    weights.set(fixed);
    for (const weight of fixed) sum += weight;
  } else {
    const sigmaX = sigma > 0 ? sigma : ((size - 1) * 0.5 - 1) * 0.3 + 0.8;
    const scale = -0.5 / (sigmaX * sigmaX);
    for (let i = 0; i < size; i++) {
      const x = i - (size - 1) * 0.5;
      const t = Math.exp(scale * x * x);
      weights[i] = t;
      sum += t;
    }
  }
  if (options.integer) {
    const kernel = new Int32Array(size);
    const norm = 256 / sum;
    for (let i = 0; i < size; i++) kernel[i] = (weights[i] * norm + 0.5) | 0;
    return kernel;
  }
  const kernel = new Float32Array(size);
  const norm = 1 / sum;
  for (let i = 0; i < size; i++) kernel[i] = weights[i] * norm;
  return kernel;
}
