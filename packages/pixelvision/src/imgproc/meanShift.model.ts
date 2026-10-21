import type { Rect, RotatedRect } from "../shape/shapes.model";

/**
 * When {@link meanShift} and {@link camShift} stop: after `maxIterations`
 * moves, or as soon as a move is shorter than `epsilon` pixels, whichever
 * comes first (OpenCV's `TermCriteria` with `COUNT | EPS`).
 */
export interface MeanShiftOptions {
  /** Most moves of the window (default 10). OpenCV's `maxCount`. */
  maxIterations?: number;
  /**
   * Stop when the window moves less than this many pixels (default 1).
   * Compared as `dx² + dy² < round(epsilon²)`; 0 never stops early.
   */
  epsilon?: number;
}

/** The result of {@link meanShift}. */
export interface MeanShiftResult {
  /** The window where the search ended. */
  window: Rect;
  /**
   * Iterations completed before the one that stopped the search, as OpenCV
   * returns it: 0 when the first move was already shorter than `epsilon`,
   * `maxIterations` when the search never settled.
   */
  iterations: number;
}

/** The result of {@link camShift}. */
export interface CamShiftResult extends MeanShiftResult {
  /**
   * The object's centre, size and orientation: `height` is the long axis
   * and `width` the short one, each four standard deviations of the
   * probability mass (the full axes of a uniform ellipse), and `angle` is
   * the direction of `width` in degrees, from 0 to 180. All zero when the
   * window holds no probability.
   */
  box: RotatedRect;
}

/** Raw moments of a window: total, first and second order. */
export interface WindowMoments {
  m00: number;
  m10: number;
  m01: number;
  m20: number;
  m11: number;
  m02: number;
}
