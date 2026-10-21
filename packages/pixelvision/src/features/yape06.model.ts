/** Options for {@link detectYape06}. */
export interface Yape06Options {
  /** Minimum absolute Laplacian response (default 30). */
  laplacianThreshold?: number;
  /** Minimum smaller Hessian eigenvalue, rejecting edges (default 25). */
  minEigenvalueThreshold?: number;
  /** Pixels to skip at each edge; at least 5 (default 5). */
  border?: number;
}
