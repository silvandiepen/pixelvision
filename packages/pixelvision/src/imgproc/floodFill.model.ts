import type { Matrix } from "../core/matrix.model";
import type { Rect } from "../shape/shapes.model";

/** A value for every channel, or one value used for all of them. */
export type ChannelValues = number | readonly number[];

/** Options for {@link floodFill}. */
export interface FloodFillOptions {
  /**
   * How far below the reference a neighbour may be and still join, per
   * channel or for all (default 0: only equal values join).
   */
  loDiff?: ChannelValues;
  /** How far above the reference a neighbour may be and still join (default 0). */
  upDiff?: ChannelValues;
  /** 4 joins pixels sharing an edge, 8 also diagonal neighbours (default 4). */
  connectivity?: 4 | 8;
  /**
   * Compare every pixel with the seed instead of with the neighbour it is
   * reached from (default `false`). Without it a smooth gradient can fill
   * far beyond the seed's colour.
   */
  fixedRange?: boolean;
  /** Only mark the region in the mask; leave the image unchanged (default `false`). */
  maskOnly?: boolean;
  /**
   * Single-channel `u8` matrix the size of the image. Non-zero pixels block
   * the fill, and filled pixels are set to `maskValue` in it. A new mask is
   * made when none is given.
   */
  mask?: Matrix<"u8">;
  /** Value written to filled pixels in the mask, 1–255 (default 255). */
  maskValue?: number;
  /** Matrix to write the filled image into (may be the image itself to fill in place). */
  out?: Matrix<"u8">;
}

/** Result of {@link floodFill}. */
export interface FloodFillResult {
  /** The image with the region set to the new value (a copy unless `out` was the image). */
  image: Matrix<"u8">;
  /** The mask, with the region set to `maskValue`. */
  mask: Matrix<"u8">;
  /** Number of pixels filled. */
  area: number;
  /** Bounding box of the filled pixels; all zero when nothing was filled. */
  rect: Rect;
}
