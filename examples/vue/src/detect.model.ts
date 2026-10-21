import type { Matrix, Quad } from "pixelvision";

/** What {@link detect} finds in a photo. */
export interface DetectResult {
  /** Canny edges of the photo: 255 on edges, 0 elsewhere. */
  edges: Matrix<"u8">;
  /** The document's corners (top-left, top-right, bottom-right, bottom-left), or null when there's none. */
  corners: Quad | null;
}
