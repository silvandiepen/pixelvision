import type { Point } from "../math/transforms.model";

/** Result of {@link minMaxLoc}. */
export interface MinMaxLoc {
  /** Smallest value. */
  min: number;
  /** Largest value. */
  max: number;
  /** First position (in row order) holding the smallest value. */
  minLoc: Point;
  /** First position (in row order) holding the largest value. */
  maxLoc: Point;
}
