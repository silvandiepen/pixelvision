import type { Matrix } from "../core/matrix.model";

/** Options for {@link canny}. */
export interface CannyOptions {
  /** Gradient strength below which a pixel is never an edge. */
  low: number;
  /** Gradient strength above which a pixel always starts an edge. */
  high: number;
  /** Matrix to write into, reused across calls. */
  out?: Matrix<"u8">;
}
