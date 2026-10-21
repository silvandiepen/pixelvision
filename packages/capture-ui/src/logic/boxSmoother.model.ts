import type { Box } from "./geometry.model";

/** Options for {@link createBoxSmoother}. */
export interface BoxSmootherOptions {
  /** Recent accepted boxes the median is taken over (default 8). */
  windowFrames?: number;
  /**
   * A box counts as an outlier when its centre is further from the smoothed
   * centre than this fraction of the smoothed size, or its size differs by
   * more than this fraction (default 0.5).
   */
  outlierDistance?: number;
  /** Outliers in a row, agreeing with each other, before they are believed (default 3). */
  persistFrames?: number;
  /** Detections without a face that keep the last smoothed box (default 3). */
  gapFrames?: number;
}

/** What the smoother makes of one detection. */
export interface SmoothedBox {
  /** The smoothed box, or undefined when the face has been gone for longer than a brief gap. */
  box?: Box;
  /** This detection's box was ignored as a one-off outlier. */
  outlier: boolean;
  /** This detection had no face, but the box is held through a brief gap. */
  held: boolean;
}

/**
 * Smooths face boxes from a detector that is occasionally wrong: a running
 * median over recent boxes, one-off jumps ignored until they persist, and
 * brief gaps bridged.
 */
export interface BoxSmoother {
  /** Adds one detection's box (undefined when no face) and returns the smoothed result. */
  update: (box: Box | undefined) => SmoothedBox;
  /** Forgets everything. */
  reset: () => void;
}
