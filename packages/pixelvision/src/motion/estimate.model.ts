/** Robust estimation method. */
export type EstimationMethod = "ransac" | "lmeds";

/** Options for {@link estimateAffine} and {@link estimateHomography}. */
export interface EstimateOptions {
  /**
   * `"ransac"` (default) keeps the model with the most points within
   * `threshold`; `"lmeds"` keeps the one with the smallest median error and
   * needs no threshold, but tolerates at most ~50% outliers.
   */
  method?: EstimationMethod;
  /** RANSAC: maximum distance in pixels for a point to count as an inlier (default 3). */
  threshold?: number;
  /** Probability of finding a good model; sets how long RANSAC searches (default 0.99). */
  confidence?: number;
  /** Upper bound on the number of random samples (default 1000). */
  maxIterations?: number;
  /**
   * Refit the winning model to all its inliers by least squares, then
   * recount the inliers (default `true`). jsfeat returned the model of the
   * minimal random sample, which carries that sample's noise.
   */
  refine?: boolean;
  /** Random source in [0, 1); pass a seeded one for reproducible results (default `Math.random`). */
  random?: () => number;
}

/** A fitted model and which points agree with it. */
export interface Estimate {
  /** 3x3 matrix, row by row, mapping `from` points onto `to` points. */
  model: Float64Array;
  /** `true` for every point the model explains. */
  inliers: boolean[];
  /** Number of `true` entries in `inliers`. */
  inlierCount: number;
}
