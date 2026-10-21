/** Options for {@link houghLines}. */
export interface HoughLinesOptions {
  /** Distance resolution in pixels (default 1). */
  rhoStep?: number;
  /** Angle resolution in radians (default 1°, `Math.PI / 180`). */
  thetaStep?: number;
  /** Minimum number of edge pixels on a line (default 50). */
  threshold?: number;
  /** Return at most this many lines, strongest first (default: all). */
  maxLines?: number;
}

/**
 * A line in normal form: the points `(x, y)` with
 * `x * cos(theta) + y * sin(theta) = rho`.
 */
export interface HoughLine {
  /** Signed distance from the origin (top-left), in pixels. */
  rho: number;
  /** Angle of the line's normal, in radians, in `[0, π)`. */
  theta: number;
  /** Number of edge pixels that voted for the line. */
  votes: number;
}
