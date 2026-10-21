import type { Matrix } from "../core/matrix.model";

/** Options for {@link pyrDown}. */
export interface PyrDownOptions {
  /** Matrix to write into, reused across calls. */
  out?: Matrix<"u8">;
}
