import { expect } from "vitest";

/**
 * Asserts two value sequences are identical over their first `length`
 * values, reporting the first mismatch with its index instead of dumping
 * both arrays.
 *
 * @param actual - pixelvision output.
 * @param expected - jsfeat output.
 * @param length - Number of values to compare.
 */
export const expectIdentical = (
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  length: number,
): void => {
  for (let i = 0; i < length; i++) {
    if (actual[i] !== expected[i]) {
      expect.fail(`value ${i} differs: pixelvision ${actual[i]}, jsfeat ${expected[i]}`);
    }
  }
};

/**
 * Asserts two float sequences agree within a tolerance, relative to the
 * magnitude of the expected value (absolute below 1).
 *
 * @param actual - pixelvision output.
 * @param expected - jsfeat output.
 * @param length - Number of values to compare.
 * @param tolerance - Allowed relative difference (default 1e-6).
 */
export const expectClose = (
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  length: number,
  tolerance = 1e-6,
): void => {
  for (let i = 0; i < length; i++) {
    const scale = Math.max(1, Math.abs(expected[i]));
    if (!(Math.abs(actual[i] - expected[i]) <= tolerance * scale)) {
      expect.fail(`value ${i} differs: pixelvision ${actual[i]}, jsfeat ${expected[i]}`);
    }
  }
};
