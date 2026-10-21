import { createMatrix } from "./core/matrix";
import type { Matrix, PixelType } from "./core/matrix.model";

/**
 * Builds a matrix from rows of numbers, for readable tests.
 *
 * @param rows - Pixel values row by row (channels interleaved).
 * @param options - Element type and channel count.
 * @returns The matrix.
 */
export const fromRows = <T extends PixelType = "u8">(
  rows: number[][],
  options: { type?: T; channels?: number } = {},
): Matrix<T> => {
  const channels = options.channels ?? 1;
  const height = rows.length;
  const width = height ? rows[0].length / channels : 0;
  const matrix = createMatrix(width, height, { type: options.type, channels }) as Matrix<T>;
  matrix.data.set(rows.flat());
  return matrix;
};

/**
 * Reads a matrix back as rows of numbers.
 *
 * @param matrix - The matrix.
 * @returns Values row by row.
 */
export const toRows = (matrix: Matrix): number[][] => {
  const rowLength = matrix.width * matrix.channels;
  return Array.from({ length: matrix.height }, (_, y) =>
    Array.from(matrix.data.subarray(y * rowLength, (y + 1) * rowLength)),
  );
};
