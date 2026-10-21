import type { Point, Quad } from "pixelvision";
import type { LabelKey } from "./labels.model";

/** Document shape presets. */
export type AspectPreset = "auto" | "id-card" | "a4";

/** Where the document scanner's live view is. */
export type DocumentPhase = "searching" | "holding" | "ready";

/** Options for {@link createDocumentFlow}. */
export interface DocumentFlowOptions {
  /** Steady detections in a row before capturing (default 8). */
  holdFrames?: number;
  /** Largest corner movement between detections, as a fraction of the document diagonal (default 0.02). */
  tolerance?: number;
}

/** The live view's state after a detection. */
export interface DocumentFlowState {
  phase: DocumentPhase;
  /** 0–1: how far the hold-still ring is filled. */
  progress: number;
  /** The instruction to show. */
  message: LabelKey;
  /** The detected corners, when found. */
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
