import { assertChannels } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { Eigen, SVD } from "./linalg.model";
import { hypot } from "./hypot";
import type { NumericMatrix } from "./matmath.model";

// Tolerances are double precision throughout. Single-precision ones (1.19e-7)
// on double data would stop iterating early and call small-valued matrices
// singular.
const EPSILON = Number.EPSILON;
/** Smallest singular value treated as non-zero. */
const MIN_SINGULAR = 1e-300;

/**
 * Largest absolute value in a matrix.
 *
 * @param data - Values.
 * @returns The largest magnitude (0 when empty).
 */
const maxAbs = (data: ArrayLike<number>): number => {
  let max = 0;
  for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
  return max;
};

/**
 * Checks a square system `A · x = b`.
 *
 * @param fn - Name of the calling function.
 * @param a - Coefficient matrix.
 * @param b - Right-hand side.
 * @throws {RangeError} When `a` isn't square or `b` has the wrong length.
 */
const assertSquareSystem = (fn: string, a: NumericMatrix, b: ArrayLike<number>): void => {
  assertChannels(fn, a, 1);
  if (a.width !== a.height) throw new RangeError(`${fn} needs a square matrix`);
  if (b.length !== a.height) {
    throw new RangeError(`${fn}: b has ${b.length} values, ${a.height} needed`);
  }
};

/**
 * Solves the square system `A · x = b` by LU decomposition with partial
 * pivoting. `a` and `b` are not modified.
 *
 * @param a - Square coefficient matrix.
 * @param b - Right-hand side.
 * @returns The solution `x`.
 * @throws {RangeError} When the matrix is singular or the sizes don't match.
 *
 * @example
 * luSolve(matrixFromRows([[2, 1], [1, 3]]), [3, 5]); // [0.8, 1.4]
 */
export function luSolve(a: NumericMatrix, b: ArrayLike<number>): Float64Array {
  assertSquareSystem("luSolve", a, b);
  const n = a.width;
  const ad = Float64Array.from(a.data.subarray(0, n * n));
  const bd = Float64Array.from(b);
  const singular = n * EPSILON * maxAbs(ad);
  for (let i = 0; i < n; i++) {
    let k = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(ad[j * n + i]) > Math.abs(ad[k * n + i])) k = j;
    }
    if (Math.abs(ad[k * n + i]) <= singular) {
      throw new RangeError("luSolve: the matrix is singular");
    }
    if (k !== i) {
      for (let j = i; j < n; j++) [ad[i * n + j], ad[k * n + j]] = [ad[k * n + j], ad[i * n + j]];
      [bd[i], bd[k]] = [bd[k], bd[i]];
    }
    const d = -1 / ad[i * n + i];
    for (let j = i + 1; j < n; j++) {
      const alpha = ad[j * n + i] * d;
      for (let c = i + 1; c < n; c++) ad[j * n + c] += alpha * ad[i * n + c];
      bd[j] += alpha * bd[i];
    }
    ad[i * n + i] = -d;
  }
  for (let i = n - 1; i >= 0; i--) {
    let s = bd[i];
    for (let k = i + 1; k < n; k++) s -= ad[i * n + k] * bd[k];
    bd[i] = s * ad[i * n + i];
  }
  return bd;
}

/**
 * Solves `A · x = b` for a symmetric positive-definite `A` (such as
 * `Aᵀ·A` in least squares) by Cholesky decomposition: about twice as fast
 * as LU. `a` and `b` are not modified.
 *
 * @param a - Symmetric positive-definite matrix.
 * @param b - Right-hand side.
 * @returns The solution `x`.
 * @throws {RangeError} When the matrix isn't positive-definite or the sizes don't match.
 *
 * @example
 * choleskySolve(matrixFromRows([[4, 2], [2, 3]]), [2, 1]); // [0.5, 0]
 */
export function choleskySolve(a: NumericMatrix, b: ArrayLike<number>): Float64Array {
  assertSquareSystem("choleskySolve", a, b);
  const size = a.width;
  const ad = Float64Array.from(a.data.subarray(0, size * size));
  const bd = Float64Array.from(b);
  for (let col = 0; col < size; col++) {
    let inverseDiagonal = 1;
    const cs = col * size;
    for (let row = col, rs = cs; row < size; row++, rs += size) {
      let value = ad[rs + col];
      for (let col2 = 0; col2 < col; col2++) value -= ad[col2 * size + col] * ad[rs + col2];
      if (row === col) {
        // Not only exact zeros: anything not positive means A isn't positive-definite.
        if (!(value > 0)) throw new RangeError("choleskySolve: the matrix isn't positive-definite");
        ad[rs + col] = value;
        inverseDiagonal = 1 / value;
      } else {
        ad[cs + row] = value;
        ad[rs + col] = value * inverseDiagonal;
      }
    }
  }
  for (let i = 0, cs = 0; i < size; i++, cs += size) {
    let value = bd[i];
    for (let j = 0; j < i; j++) value -= ad[cs + j] * bd[j];
    bd[i] = value;
  }
  for (let i = 0, cs = 0; i < size; i++, cs += size) bd[i] /= ad[cs + i];
  for (let i = size - 1; i >= 0; i--) {
    let value = bd[i];
    for (let j = i + 1, cs = j * size; j < size; j++, cs += size) value -= ad[cs + i] * bd[j];
    bd[i] = value;
  }
  return bd;
}

/**
 * One-sided Jacobi SVD on the rows of `at` (`n` rows of length `m`, the
 * transpose of an `m x n` matrix with `m >= n`). On return the first `n`
 * rows of `at` hold the left singular vectors, rows `n..m-1` an
 * orthonormal completion, `w` the singular values (largest first) and
 * `vt` the right singular vectors as rows.
 *
 * @param at - `m x m` buffer whose first `n` rows hold Aᵀ.
 * @param w - Receives `n` singular values.
 * @param vt - `n x n` buffer receiving Vᵀ.
 * @param m - Rows of A.
 * @param n - Columns of A.
 */
const jacobiSvd = (at: Float64Array, w: Float64Array, vt: Float64Array, m: number, n: number) => {
  const eps = EPSILON * 10;
  const maxIterations = Math.max(m, 30);
  for (let i = 0; i < n; i++) {
    let sd = 0;
    for (let k = 0; k < m; k++) sd += at[i * m + k] * at[i * m + k];
    w[i] = sd;
    vt.fill(0, i * n, i * n + n);
    vt[i * n + i] = 1;
  }
  const rotate = (
    data: Float64Array,
    ri: number,
    rj: number,
    length: number,
    c: number,
    s: number,
  ) => {
    let a = 0;
    let b = 0;
    for (let k = 0; k < length; k++) {
      const t0 = c * data[ri + k] + s * data[rj + k];
      const t1 = -s * data[ri + k] + c * data[rj + k];
      data[ri + k] = t0;
      data[rj + k] = t1;
      a += t0 * t0;
      b += t1 * t1;
    }
    return [a, b];
  };
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let changed = false;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const ai = i * m;
        const aj = j * m;
        const a = w[i];
        const b = w[j];
        let p = 0;
        for (let k = 0; k < m; k++) p += at[ai + k] * at[aj + k];
        if (Math.abs(p) <= eps * Math.sqrt(a * b)) continue;
        p *= 2;
        const beta = a - b;
        const gamma = hypot(p, beta);
        let c: number;
        let s: number;
        if (beta < 0) {
          s = Math.sqrt(((gamma - beta) * 0.5) / gamma);
          c = p / (gamma * s * 2);
        } else {
          c = Math.sqrt((gamma + beta) / (gamma * 2));
          s = p / (gamma * c * 2);
        }
        [w[i], w[j]] = rotate(at, ai, aj, m, c, s);
        changed = true;
        rotate(vt, i * n, j * n, n, c, s);
      }
    }
    if (!changed) break;
  }
  for (let i = 0; i < n; i++) {
    let sd = 0;
    for (let k = 0; k < m; k++) sd += at[i * m + k] * at[i * m + k];
    w[i] = Math.sqrt(sd);
  }
  // Sort singular values (and their vectors) largest first.
  for (let i = 0; i < n - 1; i++) {
    let j = i;
    for (let k = i + 1; k < n; k++) if (w[j] < w[k]) j = k;
    if (i === j) continue;
    [w[i], w[j]] = [w[j], w[i]];
    for (let k = 0; k < m; k++) [at[i * m + k], at[j * m + k]] = [at[j * m + k], at[i * m + k]];
    for (let k = 0; k < n; k++) [vt[i * n + k], vt[j * n + k]] = [vt[j * n + k], vt[i * n + k]];
  }
  // Normalise the left vectors; complete zero ones (and rows n..m-1) with random
  // vectors orthogonalised against the previous ones. A 32-bit LCG keeps this
  // finite: one computed in doubles would grow, overflow and could loop forever.
  let seed = 0x1234;
  for (let i = 0; i < m; i++) {
    let sd = i < n ? w[i] : 0;
    while (sd <= MIN_SINGULAR) {
      const value = 1 / m;
      for (let k = 0; k < m; k++) {
        seed = (Math.imul(seed, 214013) + 2531011) | 0;
        at[i * m + k] = ((seed >>> 16) & 0x7fff & 256) !== 0 ? value : -value;
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let j = 0; j < i; j++) {
          let dot = 0;
          for (let k = 0; k < m; k++) dot += at[i * m + k] * at[j * m + k];
          let sum = 0;
          for (let k = 0; k < m; k++) {
            const t = at[i * m + k] - dot * at[j * m + k];
            at[i * m + k] = t;
            sum += Math.abs(t);
          }
          // Discard rounding residue, as OpenCV does; scaling it back up would
          // produce a copy of an earlier vector and leave U not orthonormal.
          const scale = sum > eps * 100 ? 1 / sum : 0;
          for (let k = 0; k < m; k++) at[i * m + k] *= scale;
        }
      }
      sd = 0;
      for (let k = 0; k < m; k++) sd += at[i * m + k] * at[i * m + k];
      sd = Math.sqrt(sd);
    }
    const scale = 1 / sd;
    for (let k = 0; k < m; k++) at[i * m + k] *= scale;
  }
};

/**
 * Decomposes any matrix as `A = U · diag(values) · Vᵀ` (one-sided Jacobi,
 * double precision).
 *
 * @param a - Single-channel matrix, any shape.
 * @returns Singular values (largest first) and the orthonormal `u` and `v`.
 * @throws {RangeError} When the matrix has more than one channel.
 *
 * @example
 * const { values, u, v } = svd(matrixFromRows([[3, 0], [0, -2], [0, 0]]));
 * // values: [3, 2]
 */
export function svd(a: NumericMatrix): SVD {
  assertChannels("svd", a, 1);
  const { width: columns, height: rows, data } = a;
  const tall = rows >= columns;
  const m = tall ? rows : columns;
  const n = tall ? columns : rows;
  // Work on the transpose of the tall form: n rows of length m.
  const at = new Float64Array(m * m);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (tall) at[x * m + y] = data[y * columns + x];
      else at[y * m + x] = data[y * columns + x];
    }
  }
  const w = new Float64Array(n);
  const vt = new Float64Array(n * n);
  if (n > 0) jacobiSvd(at, w, vt, m, n);

  // at holds Uᵀ (m x m) of the tall form; vt holds Vᵀ (n x n).
  const asColumns = (rowsData: Float64Array, size: number) => {
    const matrix = createMatrix(size, size, { type: "f64" });
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) matrix.data[c * size + r] = rowsData[r * size + c];
    }
    return matrix;
  };
  const left = asColumns(at, m);
  const right = asColumns(vt, n);
  return tall ? { values: w, u: left, v: right } : { values: w, u: right, v: left };
}

/**
 * Computes the Moore–Penrose pseudo-inverse via SVD, ignoring singular
 * values below `ε · largest · max(rows, columns)` (as NumPy does).
 *
 * @param a - Single-channel matrix, `rows x columns`.
 * @returns The `columns x rows` pseudo-inverse.
 * @throws {RangeError} When the matrix has more than one channel.
 *
 * @example
 * const x = multiply(pseudoInverse(a), b); // least-squares solution
 */
export function pseudoInverse(a: NumericMatrix): Matrix<"f64"> {
  const { values, u, v } = svd(a);
  const { width: columns, height: rows } = a;
  const tolerance = EPSILON * (values[0] ?? 0) * Math.max(rows, columns);
  const result = createMatrix(rows, columns, { type: "f64" });
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      let sum = 0;
      for (let k = 0; k < values.length; k++) {
        if (values[k] > tolerance)
          sum += (v.data[i * columns + k] * u.data[j * rows + k]) / values[k];
      }
      result.data[i * rows + j] = sum;
    }
  }
  return result;
}

/**
 * Solves `A · x = b` in the least-squares sense via SVD: exact for square
 * non-singular systems, best fit for overdetermined ones, minimum-norm
 * for underdetermined ones. Works for square and non-square systems alike.
 *
 * @param a - `rows x columns` coefficient matrix.
 * @param b - Right-hand side with `rows` values.
 * @returns The solution with `columns` values.
 * @throws {RangeError} When `b` has the wrong length.
 *
 * @example
 * // Fit y = c0 + c1·x through (0, 1), (1, 3), (2, 5):
 * svdSolve(matrixFromRows([[1, 0], [1, 1], [1, 2]]), [1, 3, 5]); // [1, 2]
 */
export function svdSolve(a: NumericMatrix, b: ArrayLike<number>): Float64Array {
  assertChannels("svdSolve", a, 1);
  if (b.length !== a.height) {
    throw new RangeError(`svdSolve: b has ${b.length} values, ${a.height} needed`);
  }
  const inverse = pseudoInverse(a);
  const x = new Float64Array(a.width);
  for (let i = 0; i < a.width; i++) {
    let sum = 0;
    for (let k = 0; k < a.height; k++) sum += inverse.data[i * a.height + k] * b[k];
    x[i] = sum;
  }
  return x;
}

/**
 * Computes eigenvalues and eigenvectors of a symmetric matrix (Jacobi
 * rotations, double precision). Only the upper triangle is read.
 *
 * @param a - Square symmetric matrix.
 * @returns Eigenvalues, largest first, and eigenvectors as matching rows.
 * @throws {RangeError} When the matrix isn't square or has more than one channel.
 *
 * @example
 * const { values, vectors } = eigenSymmetric(matrixFromRows([[2, 1], [1, 2]]));
 * // values: [3, 1]; vectors: [[0.707, 0.707], [-0.707, 0.707]] (up to sign)
 */
export function eigenSymmetric(a: NumericMatrix): Eigen {
  assertChannels("eigenSymmetric", a, 1);
  if (a.width !== a.height) throw new RangeError("eigenSymmetric needs a square matrix");
  const n = a.width;
  const A = Float64Array.from(a.data.subarray(0, n * n));
  const W = new Float64Array(n);
  const vectors = createMatrix(n, n, { type: "f64" });
  const V = vectors.data;
  // Rotations keep the Frobenius norm, so this bounds what rounding can reach.
  let norm = 0;
  for (let i = 0; i < n * n; i++) norm += A[i] * A[i];
  const tolerance = EPSILON * Math.sqrt(norm);
  const indR = new Int32Array(n);
  const indC = new Int32Array(n);
  for (let i = 0; i < n; i++) V[i * n + i] = 1;

  const pivotInRow = (k: number) => {
    let m = k + 1;
    let mv = Math.abs(A[n * k + m]);
    for (let i = k + 2; i < n; i++) {
      const value = Math.abs(A[n * k + i]);
      if (mv < value) {
        mv = value;
        m = i;
      }
    }
    indR[k] = m;
  };
  const pivotInColumn = (k: number) => {
    let m = 0;
    let mv = Math.abs(A[k]);
    for (let i = 1; i < k; i++) {
      const value = Math.abs(A[n * i + k]);
      if (mv < value) {
        mv = value;
        m = i;
      }
    }
    indC[k] = m;
  };
  for (let k = 0; k < n; k++) {
    W[k] = A[(n + 1) * k];
    if (k < n - 1) pivotInRow(k);
    if (k > 0) pivotInColumn(k);
  }

  const rotate = (i0: number, i1: number, c: number, s: number, data: Float64Array) => {
    const a0 = data[i0];
    const b0 = data[i1];
    data[i0] = a0 * c - b0 * s;
    data[i1] = a0 * s + b0 * c;
  };
  for (let iteration = 0, max = n * n * 30; n > 1 && iteration < max; iteration++) {
    let k = 0;
    let mv = Math.abs(A[indR[0]]);
    for (let i = 1; i < n - 1; i++) {
      const value = Math.abs(A[n * i + indR[i]]);
      if (mv < value) {
        mv = value;
        k = i;
      }
    }
    let l = indR[k];
    for (let i = 1; i < n; i++) {
      const value = Math.abs(A[n * indC[i] + i]);
      if (mv < value) {
        mv = value;
        k = indC[i];
        l = i;
      }
    }
    const p = A[n * k + l];
    if (Math.abs(p) <= tolerance) break;
    const y = (W[l] - W[k]) * 0.5;
    let t = Math.abs(y) + hypot(p, y);
    let s = hypot(p, t);
    const c = t / s;
    s = p / s;
    t = (p / t) * p;
    if (y < 0) {
      s = -s;
      t = -t;
    }
    A[n * k + l] = 0;
    W[k] -= t;
    W[l] += t;
    for (let i = 0; i < k; i++) rotate(n * i + k, n * i + l, c, s, A);
    for (let i = k + 1; i < l; i++) rotate(n * k + i, n * i + l, c, s, A);
    for (let i = l + 1; i < n; i++) rotate(n * k + i, n * l + i, c, s, A);
    for (let i = 0; i < n; i++) rotate(n * k + i, n * l + i, c, s, V);
    for (const idx of [k, l]) {
      if (idx < n - 1) pivotInRow(idx);
      if (idx > 0) pivotInColumn(idx);
    }
  }
  // Sort largest first.
  for (let k = 0; k < n - 1; k++) {
    let m = k;
    for (let i = k + 1; i < n; i++) if (W[m] < W[i]) m = i;
    if (k === m) continue;
    [W[m], W[k]] = [W[k], W[m]];
    for (let i = 0; i < n; i++) [V[n * m + i], V[n * k + i]] = [V[n * k + i], V[n * m + i]];
  }
  return { values: W, vectors };
}
