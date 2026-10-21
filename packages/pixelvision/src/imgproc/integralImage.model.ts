import type { Matrix } from "../core/matrix.model";

/** Which tables {@link integralImage} computes. Sums are on by default. */
export interface IntegralImageOptions {
  /** Sum of pixels above and left (default `true`). */
  sum?: boolean;
  /** Sum of squared pixels above and left, for local variance (default `false`). */
  squares?: boolean;
  /**
   * Sums over 45° rotated triangles, for tilted Haar features (default
   * `false`): `tilted.data[Y * (width + 1) + X]` sums every pixel `(x, y)`
   * with `y < Y` and `|x - X + 1| <= Y - y - 1`, as OpenCV's `integral`.
   */
  tilted?: boolean;
}

/**
 * Integral tables, each `(width + 1) x (height + 1)` with a zero first row
 * (and, for `sum` and `squares`, a zero first column):
 * `sum.data[y * (width + 1) + x]` is the sum of all pixels above and left
 * of `(x, y)`. Stored as `f64` so large images don't overflow.
 */
export interface IntegralImage {
  sum?: Matrix<"f64">;
  squares?: Matrix<"f64">;
  tilted?: Matrix<"f64">;
}
