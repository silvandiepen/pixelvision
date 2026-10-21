/** Element type of a matrix: unsigned 8-bit, signed 32-bit, or 32/64-bit float. */
export type PixelType = "u8" | "i32" | "f32" | "f64";

/** The typed array that backs each pixel type. */
export interface PixelArrays {
  u8: Uint8Array;
  i32: Int32Array;
  f32: Float32Array;
  f64: Float64Array;
}

/**
 * A 2D grid of pixels (or numbers), stored row by row with interleaved
 * channels: the value of channel `c` at `(x, y)` is
 * `data[(y * width + x) * channels + c]`.
 */
export interface Matrix<T extends PixelType = PixelType> {
  /** Element type of `data`. */
  readonly type: T;
  /** Number of columns. */
  width: number;
  /** Number of rows. */
  height: number;
  /** Values per pixel, e.g. 1 for gray, 4 for RGBA. */
  channels: number;
  /** Pixel values; may be longer than `width * height * channels` when a matrix is reused. */
  data: PixelArrays[T];
}

/** Options for {@link createMatrix}. */
export interface CreateMatrixOptions<T extends PixelType = "u8"> {
  /** Element type (default `"u8"`). */
  type?: T;
  /** Values per pixel (default 1). */
  channels?: number;
  /** Existing storage to wrap instead of allocating; must hold at least `width * height * channels` values. */
  data?: PixelArrays[T];
}

/**
 * Anything with pixel data laid out like a browser `ImageData`: RGBA (or
 * another interleaved layout) row by row. `ImageData`, a canvas frame, a
 * decoded PNG and a {@link Matrix} all qualify.
 */
export interface ImageLike {
  width: number;
  height: number;
  data: ArrayLike<number>;
  /** Values per pixel when known (a `Matrix` has it; `ImageData` is always 4). */
  channels?: number;
}

/** Plain RGBA pixel data, structurally compatible with the DOM `ImageData`. */
export interface RGBAImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}
