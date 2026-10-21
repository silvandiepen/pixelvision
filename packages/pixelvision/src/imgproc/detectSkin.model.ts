import type { Matrix } from "../core/matrix.model";

/** Options for {@link detectSkin}. */
export interface DetectSkinOptions {
  /** Matrix to write into, reused across calls. */
  out?: Matrix<"u8">;
}
