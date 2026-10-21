import type { DocumentTrackerOptions, Point, Quad } from "pixelvision";
import type { LabelKey } from "./labels.model";

/** Document shape presets. */
export type AspectPreset = "auto" | "id-card" | "a4";

/** Where the document scanner's live view is. */
export type DocumentPhase = "searching" | "holding" | "ready";

/**
 * Options for {@link createDocumentFlow}: pixelvision's `DocumentTrackerOptions`, e.g.
 * `holdFrames` (steady detections before capturing, default 8) and `tolerance` (corner
 * movement that still counts as steady, as a fraction of the document's diagonal, default 0.05).
 */
export type DocumentFlowOptions = DocumentTrackerOptions;

/** The live view's state after a detection. */
export interface DocumentFlowState {
  phase: DocumentPhase;
  /** 0–1: how far the hold-still ring is filled. */
  progress: number;
  /** The instruction to show. */
  message: LabelKey;
  /** The smoothed outline, in the coordinates the detections were given in. */
  corners?: Quad;
}

/** The document scanner's live view: find a document, wait until it holds still. */
export interface DocumentFlow {
  /** Advances with one detection (undefined when no document was found). */
  update: (corners: Quad | undefined) => DocumentFlowState;
  /** Starts over. */
  reset: () => void;
}

export type { Point, Quad };
