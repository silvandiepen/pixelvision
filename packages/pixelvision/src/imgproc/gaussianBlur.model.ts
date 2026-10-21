import type { Matrix, PixelType } from "../core/matrix.model";

/** Options for {@link gaussianBlur}. */
export interface GaussianBlurOptions<T extends PixelType = PixelType> {
  /**
   * Kernel width in pixels; must be odd so the kernel is centred. Defaults
   * to `2 * ceil(3 * sigma) + 1` (3 when no sigma is given), which covers
   * 99.7% of the Gaussian.
   */
  kernelSize?: number;
  /** Standard deviation. Defaults to a value derived from `kernelSize`. */
  sigma?: number;
  /** Matrix to write into, reused across calls. Must have the input's element type. */
  out?: Matrix<T>;
}
