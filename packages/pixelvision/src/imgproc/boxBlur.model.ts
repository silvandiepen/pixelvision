import type { Matrix } from "../core/matrix.model";

/** Options for {@link boxBlur}. */
export interface BoxBlurOptions {
  /** Pixels on each side of the centre; the window is `2 * radius + 1` square. */
  radius: number;
  /** Matrix to write into, reused across calls. */
  out?: Matrix<"u8">;
}

/** Options for {@link boxSum}. */
export interface BoxSumOptions {
  /** Pixels on each side of the centre; the window is `2 * radius + 1` square. */
  radius: number;
  /** Matrix to write into, reused across calls. */
  out?: Matrix<"i32">;
}
