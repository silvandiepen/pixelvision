import type { Quad } from "pixelvision";

/** Props of {@link Outline}. */
export interface OutlineProps {
  /** The corners, in image pixels. */
  corners: Quad;
  /** Display pixels per image pixel. */
  scale: number;
  /** Line colour. */
  color?: string;
  /** Line width in display pixels. */
  thickness?: number;
}
