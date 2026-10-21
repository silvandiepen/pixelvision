/** Options for {@link houghCircles}. */
export interface HoughCirclesOptions {
  /**
   * Inverse resolution of the centre accumulator: 1 (default) votes per
   * pixel, 2 per 2 x 2 pixels, and so on. Values below 1 count as 1.
   */
  dp?: number;
  /** Smallest distance between the centres of two circles found (default: an eighth of the image height). */
  minDist?: number;
  /** Upper Canny threshold on `|gx| + |gy|`; the lower one is half of it (default 100). */
  cannyThreshold?: number;
  /**
   * Votes a centre needs, and edge pixels a circle needs around its radius
   * (default 100). Lower it to find smaller or less complete circles, along
   * with more false ones.
   */
  accumulatorThreshold?: number;
  /** Smallest radius searched, in pixels (default 0). */
  minRadius?: number;
  /**
   * Largest radius searched, in pixels. 0 (default) searches up to the
   * larger image side; a value not above `minRadius` becomes `minRadius + 2`.
   */
  maxRadius?: number;
  /** Return at most this many circles, strongest first (default: all). */
  maxCircles?: number;
}

/** A circle found by {@link houghCircles}. */
export interface Circle {
  /**
   * Centre column, in pixel coordinates (pixel `x` is at `x`). It is the
   * middle of an accumulator cell: with `dp` 1, a whole number plus 0.5.
   */
  x: number;
  /** Centre row, in pixel coordinates, likewise. */
  y: number;
  /** Radius in pixels. */
  radius: number;
  /** Edge pixels supporting the radius: the circle's strength. */
  votes: number;
}
