import type { Matrix } from "../core/matrix.model";

/** Options for {@link bilateralFilter}. */
export interface BilateralFilterOptions {
  /**
   * Diameter of the neighbourhood in pixels. 0 or less derives it from
   * `sigmaSpace` (radius `round(1.5 · sigmaSpace)`). An even value grows to
   * the next odd one (default 9).
   */
  diameter?: number;
  /**
   * How different a neighbour's colour may be and still count: neighbours
   * this many levels away weigh about 60 % (default 75). Large values make
   * it an ordinary blur.
   */
  sigmaColor?: number;
  /** How far neighbours count, in pixels (default 75). */
  sigmaSpace?: number;
  /** Matrix to write into. */
  out?: Matrix<"u8">;
}
