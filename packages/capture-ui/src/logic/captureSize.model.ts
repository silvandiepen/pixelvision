/** A capture size after bounding it to a pixel budget. */
export interface FittedSize {
  /** Width in pixels, at least 1. */
  width: number;
  /** Height in pixels, at least 1. */
  height: number;
  /** Output pixels per source pixel: 1, or less when the source was scaled down. */
  scale: number;
}
