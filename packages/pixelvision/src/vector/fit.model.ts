import type { Point } from "../math/transforms.model";

/** Settings for {@link fitLoop}. */
export interface FitSettings {
  /** Largest distance between the samples and the fitted segments, in pixels. */
  tolerance: number;
  /** Smallest change of direction kept as a sharp corner, in radians. */
  cornerAngle: number;
  /** Fit Bézier curves (`true`) or straight lines only. */
  curves: boolean;
}

/** A run of outline samples to draw as one exact straight line. */
export interface StraightSpan {
  /** Index of the first sample. */
  start: number;
  /** Number of samples after the first, along the loop (it may wrap past the end). */
  length: number;
}

/** A straight line through a point, with a unit direction. */
export interface Line {
  /** A point on the line. */
  point: Point;
  /** Unit direction. */
  direction: Point;
}
