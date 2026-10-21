import type { Matrix } from "../core/matrix.model";

/** Number of tiles across and down. */
export interface TileGridSize {
  width: number;
  height: number;
}

/** Options for {@link clahe}. */
export interface ClaheOptions {
  /**
   * Contrast limit: a histogram bin may hold at most `clipLimit` times its
   * fair share (tile pixels / 256); the excess is spread over all bins.
   * Lower values amplify noise less. 0 or less turns limiting off (default 40).
   */
  clipLimit?: number;
  /** Tiles across and down; each gets its own equalisation (default 8 x 8). */
  tileGridSize?: TileGridSize;
  /** Matrix to write into. */
  out?: Matrix<"u8">;
}
