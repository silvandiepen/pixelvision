import type { Quad } from "./document.model";

/** Options for {@link createDocumentTracker}. */
export interface DocumentTrackerOptions {
  /** Steady frames needed before the document counts as held still (default 8). */
  holdFrames?: number;
  /** Recent detections whose per-corner median gives the outline (default 5). */
  windowFrames?: number;
  /** Frames without a detection before the document counts as lost (default 4). */
  maxMisses?: number;
  /**
   * How far a corner may move between frames and still count as steady, as a
   * fraction of the document's diagonal (default 0.05).
   */
  tolerance?: number;
  /**
   * A detection with a corner further than this from the outline (as a fraction
   * of the diagonal) is set aside as a probable mistake (default 0.12).
   */
  jump?: number;
  /** Matching detections at a new place before the outline moves there (default 3). */
  confirmFrames?: number;
}

/** What the tracker knows after a frame. */
export interface DocumentTrackerState {
  /** `"searching"` with no outline, `"tracking"` while it moves, `"steady"` once held still. */
  status: "searching" | "tracking" | "steady";
  /** The smoothed outline, ordered as {@link findDocument} orders it, or null. */
  corners: Quad | null;
  /** How long it has been held still, 0–1: smooth enough to drive a progress ring. */
  progress: number;
}

/** A running tracker: feed it every frame's detection. */
export interface DocumentTracker {
  /** Advances with this frame's corners (or null when nothing was found). */
  update: (corners: Quad | null) => DocumentTrackerState;
  /** The current state. */
  readonly state: DocumentTrackerState;
  /** Starts over. */
  reset: () => void;
}
