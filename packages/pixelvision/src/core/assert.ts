import type { Matrix, PixelType } from "./matrix.model";

/**
 * Checks that a matrix has one of the allowed channel counts.
 *
 * @param fn - Name of the calling function, for the error message.
 * @param matrix - The matrix to check.
 * @param allowed - Allowed channel counts.
 * @throws {RangeError} When the channel count isn't allowed.
 */
export const assertChannels = (fn: string, matrix: Matrix, ...allowed: number[]): void => {
  if (!allowed.includes(matrix.channels)) {
    throw new RangeError(`${fn} needs ${allowed.join(" or ")} channel(s), got ${matrix.channels}`);
  }
};

/**
 * Checks that a matrix has one of the allowed element types.
 *
 * @param fn - Name of the calling function, for the error message.
 * @param matrix - The matrix to check.
 * @param allowed - Allowed element types.
 * @throws {TypeError} When the element type isn't allowed.
 */
export const assertType = (fn: string, matrix: Matrix, ...allowed: PixelType[]): void => {
  if (!allowed.includes(matrix.type)) {
    throw new TypeError(`${fn} needs a ${allowed.join(" or ")} matrix, got ${matrix.type}`);
  }
};

/**
 * Checks that a number is a whole number within a range.
 *
 * @param fn - Name of the calling function, for the error message.
 * @param name - Name of the value.
 * @param value - The value to check.
 * @param min - Smallest allowed value.
 * @throws {RangeError} When the value is fractional, not finite or below `min`.
 */
export const assertInteger = (fn: string, name: string, value: number, min: number): void => {
  if (!Number.isInteger(value) || value < min) {
    throw new RangeError(`${fn}: ${name} must be an integer >= ${min}, got ${value}`);
  }
};
