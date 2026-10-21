import type { Matrix } from "../core/matrix.model";

/** Options for {@link equalizeHistogram}. */
export interface EqualizeHistogramOptions {
  /** Matrix to write into, reused across calls. */
  out?: Matrix<"u8">;
}
