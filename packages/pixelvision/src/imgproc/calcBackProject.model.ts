import type { Matrix } from "../core/matrix.model";

/** Options for {@link calcBackProject}. */
export interface CalcBackProjectOptions {
  /** Image channel to look up, e.g. 0 for the hue of an HSV image (default 0). */
  channel?: number;
  /** Values the histogram covers, `[low, high)`, as passed to {@link calcHist} (default `[0, 256]`). */
  range?: readonly [number, number];
  /** Factor applied to each histogram value before it's stored as a byte (default 1). */
  scale?: number;
  /** Matrix to write into. */
  out?: Matrix<"u8">;
}
