import type { Matrix } from "../core/matrix.model";

/** Options for {@link adaptiveThreshold}. */
export interface AdaptiveThresholdOptions {
  /** Odd neighbourhood size used for the local level, 3 or more (default 11). */
  blockSize?: number;
  /** Subtracted from the local mean; raise it to keep only clearly brighter pixels (default 2). */
  offset?: number;
  /** Local level as the plain mean (default) or a Gaussian-weighted mean. */
  method?: "mean" | "gaussian";
  /** Make pixels darker than their surroundings white instead (default `false`). */
  invert?: boolean;
  /** Value for selected pixels (default 255). */
  max?: number;
  /** Matrix to write into. */
  out?: Matrix<"u8">;
}
