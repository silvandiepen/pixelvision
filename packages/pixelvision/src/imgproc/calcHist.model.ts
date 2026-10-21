import type { Matrix } from "../core/matrix.model";

/** Options for {@link calcHist}. */
export interface CalcHistOptions {
  /** Number of equal-width bins (default 256). */
  bins?: number;
  /** Values counted, `[low, high)`: high itself is left out (default `[0, 256]`). */
  range?: readonly [number, number];
  /** Count only pixels where this single-channel `u8` mask is non-zero; same size as the image. */
  mask?: Matrix<"u8">;
  /** Matrix to write into. */
  out?: Matrix<"i32">;
}
