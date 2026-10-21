/** Single-channel pixels, e.g. a pixelvision `Matrix<"u8">` from `grayscale`. */
export interface GrayPixels {
  width: number;
  height: number;
  data: ArrayLike<number>;
}
