import type { Matrix } from "../core/matrix.model";

/** Singular value decomposition `A = U · diag(values) · Vᵀ`. */
export interface SVD {
  /** Singular values, largest first; `min(rows, columns)` of them. */
  values: Float64Array;
  /** Left singular vectors as columns, `rows x rows`, orthonormal. */
  u: Matrix<"f64">;
  /** Right singular vectors as columns, `columns x columns`, orthonormal. */
  v: Matrix<"f64">;
}

/** Eigen-decomposition of a symmetric matrix. */
export interface Eigen {
  /** Eigenvalues, largest first. */
  values: Float64Array;
  /** Eigenvectors as rows, in the order of `values`. */
  vectors: Matrix<"f64">;
}
