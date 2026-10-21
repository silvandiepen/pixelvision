import type { Matrix } from "pixelvision";

/**
 * Counts the non-zero values of a matrix, such as the edge pixels of a
 * Canny result or the pixels of a mask.
 *
 * @param matrix - Any matrix.
 * @returns How many of its `width * height * channels` values aren't 0.
 */
export function countNonZero(matrix: Matrix): number {
  const length = matrix.width * matrix.height * matrix.channels;
  let count = 0;
  for (let i = 0; i < length; i++) if (matrix.data[i] !== 0) count++;
  return count;
}

/**
 * Averages the values of a matrix over all pixels and channels.
 *
 * @param matrix - Any matrix.
 * @returns The mean, or `NaN` when it's empty.
 */
export function mean(matrix: Matrix): number {
  const length = matrix.width * matrix.height * matrix.channels;
  let sum = 0;
  for (let i = 0; i < length; i++) sum += matrix.data[i];
  return sum / length;
}

/**
 * Finds the smallest and largest values of a matrix.
 *
 * @param matrix - Any matrix.
 * @returns `[min, max]`.
 */
export function minMax(matrix: Matrix): [number, number] {
  const length = matrix.width * matrix.height * matrix.channels;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < length; i++) {
    const value = matrix.data[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
}

/**
 * Computes the standard deviation of a matrix's values.
 *
 * @param matrix - Any matrix.
 * @returns The population standard deviation.
 */
export function standardDeviation(matrix: Matrix): number {
  const length = matrix.width * matrix.height * matrix.channels;
  const average = mean(matrix);
  let sum = 0;
  for (let i = 0; i < length; i++) sum += (matrix.data[i] - average) ** 2;
  return Math.sqrt(sum / length);
}

/**
 * Reads one value of a matrix.
 *
 * @param matrix - Any matrix.
 * @param x - Column.
 * @param y - Row.
 * @param channel - Channel (default 0).
 * @returns The value.
 */
export function valueAt(matrix: Matrix, x: number, y: number, channel = 0): number {
  return matrix.data[(y * matrix.width + x) * matrix.channels + channel];
}

/**
 * Counts how many values of a matrix differ between two matrices of the
 * same shape.
 *
 * @param a - First matrix.
 * @param b - Second matrix.
 * @returns The number of differing values, or `Infinity` when the shapes differ.
 */
export function countDifferences(a: Matrix, b: Matrix): number {
  if (a.width !== b.width || a.height !== b.height || a.channels !== b.channels) return Infinity;
  const length = a.width * a.height * a.channels;
  let count = 0;
  for (let i = 0; i < length; i++) if (a.data[i] !== b.data[i]) count++;
  return count;
}

/**
 * Finds the largest absolute difference between two lists of numbers.
 *
 * @param a - First list.
 * @param b - Second list, same length.
 * @returns The largest `|a[i] - b[i]|`, or `Infinity` when the lengths differ.
 */
export function maxDifference(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length !== b.length) return Infinity;
  let max = 0;
  for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i] - b[i]));
  return max;
}

/**
 * Counts sharp steps: horizontally adjacent pixels whose values differ by
 * more than `threshold`. Blurring lowers the count.
 *
 * @param matrix - Single-channel matrix.
 * @param threshold - Smallest difference that counts as sharp.
 * @returns The number of sharp steps.
 */
export function countSharpSteps(matrix: Matrix, threshold: number): number {
  let count = 0;
  for (let y = 0; y < matrix.height; y++) {
    for (let x = 1; x < matrix.width; x++) {
      const i = y * matrix.width + x;
      if (Math.abs(matrix.data[i] - matrix.data[i - 1]) > threshold) count++;
    }
  }
  return count;
}

/**
 * Counts the pixels of each gray level.
 *
 * @param matrix - Single-channel `u8` matrix.
 * @returns 256 counts.
 */
export function histogram(matrix: Matrix<"u8">): number[] {
  const counts = new Array<number>(256).fill(0);
  for (let i = 0; i < matrix.width * matrix.height; i++) counts[matrix.data[i]]++;
  return counts;
}
