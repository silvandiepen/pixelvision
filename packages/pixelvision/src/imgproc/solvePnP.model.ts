import type { RadialDistortion } from "./projectPoints.model";
import type { Vec3 } from "./rodrigues.model";

/** A camera pose: how scene coordinates map to camera coordinates, `R(rvec) · point + tvec`. */
export interface Pose {
  /** Rotation vector (see {@link rodrigues}). */
  rvec: Vec3;
  /** Translation, in scene units. */
  tvec: Vec3;
}

/** Options for {@link solvePnP}. */
export interface SolvePnPOptions {
  /** Radial lens distortion of the camera (default: none). */
  distortion?: RadialDistortion;
  /**
   * Start the refinement from this pose instead of estimating one, e.g. the
   * previous frame's pose when tracking. Allows solving from 3 points.
   */
  guess?: Pose;
  /** Most Levenberg–Marquardt iterations (default 20). */
  maxIterations?: number;
}

/** The result of {@link solvePnP}. */
export interface PnPResult extends Pose {
  /** Root-mean-square distance in pixels between the image points and the projected object points. */
  error: number;
  /** Levenberg–Marquardt iterations run. */
  iterations: number;
}
