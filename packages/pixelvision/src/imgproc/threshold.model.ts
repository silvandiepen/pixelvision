import type { Matrix } from "../core/matrix.model";

/** Options for {@link threshold}. */
export interface ThresholdOptions {
  /** Pixels above this become `max`, others 0. Defaults to Otsu's automatic level. */
  level?: number;
  /** Value for pixels above the level (default 255). */
  max?: number;
  /** Swap the output: pixels above the level become 0 (default `false`). */
  invert?: boolean;
  /** Matrix to write into, reused across calls. */
  out?: Matrix<"u8">;
}
