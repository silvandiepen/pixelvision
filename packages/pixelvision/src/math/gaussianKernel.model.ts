/** Options for {@link gaussianKernel}. */
export interface GaussianKernelOptions {
  /**
   * Standard deviation. When 0 or less it is derived from the size, as
   * OpenCV does: `0.3 * ((size - 1) / 2 - 1) + 0.8`; odd sizes up to 7
   * then use exact binomial weights.
   */
  sigma?: number;
  /**
   * Returns fixed-point integer weights summing to about 256 instead of
   * floats summing to 1. 8-bit blurs use these.
   */
  integer?: boolean;
}
