import type { Matrix } from "../core/matrix.model";
import type { Point } from "../math/transforms.model";

/** A frame for {@link trackPoints}: a gray image, or a pyramid of one from {@link buildPyramid}. */
export type FlowFrame = Matrix<"u8"> | readonly Matrix<"u8">[];

/** Options for {@link trackPoints}. */
export interface TrackPointsOptions {
  /** Side of the square search window in pixels (default 20). */
  windowSize?: number;
  /** Pyramid levels to build when frames are passed as images (default 3). */
  levels?: number;
  /** Maximum refinement steps per level (default 30). */
  maxIterations?: number;
  /** Stop refining when a step moves less than this many pixels (default 0.01). */
  epsilon?: number;
  /**
   * Reject points whose window has too little texture: minimum eigenvalue
   * of the gradient covariance, normalised by window area (default 0.0001).
   */
  minEigenvalue?: number;
}

/** Where a point went. */
export interface TrackedPoint extends Point {
  /** `false` when the point was lost (left the image or had too little texture). */
  tracked: boolean;
}
