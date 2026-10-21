import type { Matrix } from "../core/matrix.model";

/**
 * How distance is measured: `"l1"` counts horizontal plus vertical steps
 * (city block), `"c"` the larger of the two (chessboard), `"l2"` straight
 * line (Euclidean, approximated by a mask).
 */
export type DistanceMetric = "l1" | "l2" | "c";

/** Options for {@link distanceTransform}. */
export interface DistanceTransformOptions {
  /** Distance measure (default `"l2"`). */
  metric?: DistanceMetric;
  /**
   * Mask size for `"l2"`: 3 uses steps of 0.955 (straight) and 1.3693
   * (diagonal), 5 adds knight moves of 2.1969 and is closer to the true
   * distance (default 5). `"l1"` and `"c"` are exact with 3 and always use it.
   */
  maskSize?: 3 | 5;
  /** Matrix to write into. */
  out?: Matrix<"f32">;
}
