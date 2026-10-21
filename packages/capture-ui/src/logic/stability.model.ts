import type { Point } from "pixelvision";

/** Options for {@link createStabilityTracker}. */
export interface StabilityOptions {
  /** Consecutive steady detections needed (default 8). */
  holdFrames?: number;
  /** Largest movement between detections, as a fraction of the reference size (default 0.025). */
  tolerance?: number;
}

/** Stability after a detection. */
export interface StabilityState {
  /** Steady for `holdFrames` detections in a row. */
  stable: boolean;
  /** 0 to 1: how far along the hold is. */
  progress: number;
  /** Steady detections in a row so far. */
  count: number;
}

/** Tracks whether detections hold still: a document before auto-capture, a face before the challenge. */
export interface StabilityTracker {
  /** Adds a detection (undefined when nothing was found) and returns the new state. */
  update: (points: readonly Point[] | undefined, reference?: number) => StabilityState;
  /** Starts over. */
  reset: () => void;
}
