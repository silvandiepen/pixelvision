import type { Point } from "pixelvision";

/** Proportions to straighten to. */
export type DocumentAspect = "auto" | "id-card" | "a4";

export interface ScanDocumentDemoOptions {
  aspect: DocumentAspect;
}

/** Tunables of {@link isStable}. */
export interface StabilityOptions {
  /** Detections in a row that must agree (default 8). */
  frames?: number;
  /** Largest movement of any corner between two detections, in pixels (default 6). */
  tolerance?: number;
}

/** Four corners, or `null` for a frame without a document. */
export type CornerHistoryEntry = readonly Point[] | null;
