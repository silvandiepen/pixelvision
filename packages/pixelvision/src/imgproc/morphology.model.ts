import type { Matrix } from "../core/matrix.model";

/** Options for {@link dilate} and {@link erode}. */
export interface MorphologyOptions {
  /** Square neighbourhood radius: 1 is 3x3 (default 1). */
  radius?: number;
  /** How many times to apply it (default 1). */
  iterations?: number;
  /** Matrix to write into. */
  out?: Matrix<"u8">;
}
