import type { Matrix, PixelType } from "../core/matrix.model";

/** Options for {@link resample}. */
export interface ResampleOptions<T extends PixelType = PixelType> {
  /** Output width. */
  width: number;
  /** Output height. */
  height: number;
  /** Matrix to write into, reused across calls. */
  out?: Matrix<T>;
}
