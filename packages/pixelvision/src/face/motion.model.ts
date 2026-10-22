/** A face region shrunk to a small grid of mean gray levels, to compare between frames. */
export interface RegionPatch {
  /** Cells across and down. */
  size: number;
  /** Mean gray level of each cell, row by row. */
  cells: Float32Array;
}

/** A rectangle in pixels, such as a face box. */
export interface RegionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
