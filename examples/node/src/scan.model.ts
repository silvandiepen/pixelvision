import type { Quad } from "pixelvision";

/** What {@link scanFile} found and wrote. */
export interface ScanResult {
  /** The document's corners in the input image: top-left, top-right, bottom-right, bottom-left. */
  corners: Quad;
  /** Width of the straightened document. */
  width: number;
  /** Height of the straightened document. */
  height: number;
}
