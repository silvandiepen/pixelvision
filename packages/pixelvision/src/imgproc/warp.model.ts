import type { Matrix, PixelType } from "../core/matrix.model";

/** A 3x3 transform as 9 numbers, row by row, or a matrix holding them. */
export type Transform = ArrayLike<number> | Matrix<"f32"> | Matrix<"f64">;

/** Options for {@link warpPerspective} and {@link warpAffine}. */
export interface WarpOptions<T extends PixelType = PixelType> {
  /** Output width (default: input width). */
  width?: number;
  /** Output height (default: input height). */
  height?: number;
  /** Value for output pixels that map outside the input (default 0). */
  fill?: number;
  /** Matrix to write into, reused across calls. */
  out?: Matrix<T>;
}
