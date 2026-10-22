import type { Quad } from "pixelvision";

/** A finished scan, as the screen shows it. */
export interface Scan {
  /** The JPEG that was scanned. */
  uri: string;
  /** Its width in pixels. */
  width: number;
  /** Its height in pixels. */
  height: number;
  /** The document's corners, or null when there's none. */
  corners: Quad | null;
  /** How many edge pixels Canny found. */
  edgeCount: number;
  /** How long {@link detect} took, in milliseconds. */
  milliseconds: number;
}
