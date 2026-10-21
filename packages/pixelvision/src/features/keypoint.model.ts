/** A detected interest point. */
export interface Keypoint {
  /** Column, in pixels (of the pyramid level it was found on). */
  x: number;
  /** Row, in pixels. */
  y: number;
  /** Detector response; higher is stronger. */
  score: number;
  /** Pyramid level, 0 for the full-size image. */
  level?: number;
  /** Orientation in radians, when known (needed by {@link describeOrb}). */
  angle?: number;
}
