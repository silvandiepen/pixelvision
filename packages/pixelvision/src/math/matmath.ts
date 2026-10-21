import { assertChannels } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { MultiplyOptions, NumericMatrix } from "./matmath.model";

/**
 * Builds a numeric matrix from rows of numbers.
 *
 * @param rows - Values row by row; every row must have the same length.
 * @returns An `f64` matrix.
 * @throws {RangeError} When rows have different lengths.
 *
 * @example
 * const a = matrixFromRows([[1, 2], [3, 4]]);
 */
export function matrixFromRows(rows: readonly (readonly number[])[]): Matrix<"f64"> {
  const width = rows.length ? rows[0].length : 0;
  if (rows.some((row) => row.length !== width)) {
    throw new RangeError("matrixFromRows: every row must have the same length");
  }
  const matrix = createMatrix(width, rows.length, { type: "f64" });
  rows.forEach((row, y) => matrix.data.set(row, y * width));
  return matrix;
}

/**
 * Reads a matrix back as rows of numbers.
 *
 * @param matrix - Any single-channel matrix.
 * @returns Values row by row.
 *
 * @example
 * matrixToRows(identity(2)); // [[1, 0], [0, 1]]
 */
export function matrixToRows(matrix: Matrix): number[][] {
  const { width, height, data } = matrix;
  return Array.from({ length: height }, (_, y) =>
    Array.from(data.subarray(y * width, (y + 1) * width)),
  );
}

/**
 * Creates a square identity matrix, optionally scaled.
 *
 * @param size - Number of rows and columns.
 * @param value - Value on the diagonal (default 1).
 * @returns An `f64` matrix.
 *
 * @example
 * identity(3, 2); // 2 on the diagonal
 */
export function identity(size: number, value = 1): Matrix<"f64"> {
  const matrix = createMatrix(size, size, { type: "f64" });
  for (let i = 0; i < size; i++) matrix.data[i * size + i] = value;
  return matrix;
}

/**
 * Transposes a matrix: rows become columns.
 *
 * @param a - Single-channel matrix.
 * @returns An `f64` matrix with `width = a.height` and `height = a.width`.
 * @throws {RangeError} When the matrix has more than one channel.
 */
export function transpose(a: NumericMatrix): Matrix<"f64"> {
  assertChannels("transpose", a, 1);
  const { width, height, data } = a;
  const result = createMatrix(height, width, { type: "f64" });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) result.data[x * height + y] = data[y * width + x];
  }
  return result;
}

/**
 * Multiplies two matrices, optionally transposing either first, without
 * building the transposed copy.
 *
 * @param a - Left matrix.
 * @param b - Right matrix.
 * @param options - Whether to use the transpose of `a` and/or `b`.
 * @returns The product as an `f64` matrix.
 * @throws {RangeError} When the inner dimensions don't match or a matrix has more than one channel.
 *
 * @example
 * const ata = multiply(a, a, { transposeA: true }); // Aᵀ·A
 */
export function multiply(
  a: NumericMatrix,
  b: NumericMatrix,
  options: MultiplyOptions = {},
): Matrix<"f64"> {
  assertChannels("multiply", a, 1);
  assertChannels("multiply", b, 1);
  const { transposeA = false, transposeB = false } = options;
  const rows = transposeA ? a.width : a.height;
  const inner = transposeA ? a.height : a.width;
  const innerB = transposeB ? b.width : b.height;
  const columns = transposeB ? b.height : b.width;
  if (inner !== innerB) {
    throw new RangeError(`multiply: inner dimensions differ (${inner} vs ${innerB})`);
  }
  const ad = a.data;
  const bd = b.data;
  const aRow = transposeA ? 1 : a.width;
  const aStep = transposeA ? a.width : 1;
  const bColumn = transposeB ? b.width : 1;
  const bStep = transposeB ? 1 : b.width;
  const result = createMatrix(columns, rows, { type: "f64" });
  for (let i = 0, c = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++, c++) {
      let sum = 0;
      for (let k = 0, pa = i * aRow, pb = j * bColumn; k < inner; k++, pa += aStep, pb += bStep) {
        sum += ad[pa] * bd[pb];
      }
      result.data[c] = sum;
    }
  }
  return result;
}

/**
 * Checks that a matrix is 3x3.
 *
 * @param fn - Name of the calling function.
 * @param m - The matrix.
 * @throws {RangeError} When it isn't.
 */
const assert3x3 = (fn: string, m: NumericMatrix): void => {
  if (m.width !== 3 || m.height !== 3 || m.channels !== 1) {
    throw new RangeError(`${fn} needs a 3x3 matrix, got ${m.width}x${m.height}`);
  }
};

/**
 * Computes the determinant of a 3x3 matrix.
 *
 * @param m - 3x3 matrix.
 * @returns The determinant.
 * @throws {RangeError} When the matrix isn't 3x3.
 */
export function determinant3x3(m: NumericMatrix): number {
  assert3x3("determinant3x3", m);
  const d = m.data;
  return (
    d[0] * d[4] * d[8] -
    d[0] * d[5] * d[7] -
    d[3] * d[1] * d[8] +
    d[3] * d[2] * d[7] +
    d[6] * d[1] * d[5] -
    d[6] * d[2] * d[4]
  );
}

/**
 * Inverts a 3x3 matrix in closed form.
 *
 * @param m - 3x3 matrix.
 * @returns The inverse as an `f64` matrix.
 * @throws {RangeError} When the matrix isn't 3x3 or is singular.
 *
 * @example
 * const back = invert3x3(matrixFromRows([[2, 0, 0], [0, 2, 0], [0, 0, 1]]));
 */
export function invert3x3(m: NumericMatrix): Matrix<"f64"> {
  assert3x3("invert3x3", m);
  const A = m.data;
  const t1 = A[4];
  const t2 = A[8];
  const t4 = A[5];
  const t5 = A[7];
  const t8 = A[0];
  const t9 = t8 * t1;
  const t11 = t8 * t4;
  const t13 = A[3];
  const t14 = A[1];
  const t15 = t13 * t14;
  const t17 = A[2];
  const t18 = t13 * t17;
  const t20 = A[6];
  const t21 = t20 * t14;
  const t23 = t20 * t17;
  const det = t9 * t2 - t11 * t5 - t15 * t2 + t18 * t5 + t21 * t4 - t23 * t1;
  if (det === 0 || !Number.isFinite(det)) throw new RangeError("invert3x3: the matrix is singular");
  const t26 = 1.0 / det;
  const result = createMatrix(3, 3, { type: "f64" });
  result.data.set([
    (t1 * t2 - t4 * t5) * t26,
    -(t14 * t2 - t17 * t5) * t26,
    -(-t14 * t4 + t17 * t1) * t26,
    -(t13 * t2 - t4 * t20) * t26,
    (t8 * t2 - t23) * t26,
    -(t11 - t18) * t26,
    -(-t13 * t5 + t1 * t20) * t26,
    -(t8 * t5 - t21) * t26,
    (t9 - t15) * t26,
  ]);
  return result;
}
