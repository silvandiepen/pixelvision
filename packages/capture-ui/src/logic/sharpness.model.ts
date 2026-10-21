/** Single-channel pixels, e.g. a pixelvision `Matrix<"u8">` from `grayscale`. */
export interface GrayPixels {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

/** Options for {@link robustSharpness}. */
export interface RobustSharpnessOptions {
  /**
   * How much of the noise-like part of the Laplacian's variance to remove,
   * 0–1 or a little more (default 1). 0 gives the plain Laplacian variance.
   */
  noiseWeight?: number;
}
