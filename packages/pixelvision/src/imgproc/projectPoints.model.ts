/** A point in 3D, in the units of the scene (e.g. metres). */
export interface Point3 {
  x: number;
  y: number;
  z: number;
}

/**
 * A pinhole camera's intrinsic matrix, 9 values row by row:
 * `[fx, 0, cx, 0, fy, cy, 0, 0, 1]`, with the focal lengths and the
 * principal point in pixels. The skew entry is ignored.
 */
export type CameraMatrix = ArrayLike<number>;

/**
 * Radial lens distortion: a point at distance `r` from the optical axis (on
 * the image plane at depth 1) moves to `r · (1 + k1 r² + k2 r⁴)`. These are
 * the first two of OpenCV's distortion coefficients.
 */
export interface RadialDistortion {
  k1: number;
  /** Default 0. */
  k2?: number;
}

/** Options for {@link projectPoints}. */
export interface ProjectPointsOptions {
  /** Radial lens distortion (default: none). */
  distortion?: RadialDistortion;
}

/** Focal lengths, principal point and radial distortion, read once from a camera. */
export interface Intrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  k1: number;
  k2: number;
}
