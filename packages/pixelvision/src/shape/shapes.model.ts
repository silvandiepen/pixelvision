import type { Point } from "../math/transforms.model";

/** An axis-aligned rectangle in pixels. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A rectangle that may be rotated. */
export interface RotatedRect {
  /** Centre point. */
  center: Point;
  /** Side lengths. */
  width: number;
  height: number;
  /** Rotation in degrees. */
  angle: number;
  /** The four corners, in order around the rectangle. */
  corners: [Point, Point, Point, Point];
}

/** Image moments of a shape (as OpenCV's `moments`). */
export interface Moments {
  /** Spatial moments m_pq = Σ x^p y^q (area is m00). */
  m00: number;
  m10: number;
  m01: number;
  m20: number;
  m11: number;
  m02: number;
  m30: number;
  m21: number;
  m12: number;
  m03: number;
  /** Central moments (about the centroid). */
  mu20: number;
  mu11: number;
  mu02: number;
  mu30: number;
  mu21: number;
  mu12: number;
  mu03: number;
  /** Normalised central moments, invariant to scale. */
  nu20: number;
  nu11: number;
  nu02: number;
  nu30: number;
  nu21: number;
  nu12: number;
  nu03: number;
}
