import type { Matrix } from "../core/matrix.model";

/** Which tables {@link integralImage} computes. Sums are on by default. */
export interface IntegralImageOptions {
  /** Sum of pixels above and left (default `true`). */
  sum?: boolean;
  /** Sum of squared pixels above and left, for local variance (default `false`). */
  squares?: boolean;
  /** Sum over the 45° rotated rectangle, for tilted Haar features (default `false`). */
  tilted?: boolean;
}

/**
 * Integral tables, each `(width + 1) x (height + 1)` with a zero first row
 * and column: `sum.data[y * (width + 1) + x]` is the sum of all pixels
 * above and left of `(x, y)`. Stored as `f64` so large images don't
 * overflow.
 */
export interface IntegralImage {
  sum?: Matrix<"f64">;
  squares?: Matrix<"f64">;
  tilted?: Matrix<"f64">;
}
