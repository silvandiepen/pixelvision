import type { Matrix } from "../core/matrix.model";

/** Channel layout of colour input. */
export type ChannelOrder = "rgba" | "rgb" | "bgra" | "bgr";

/** Options for {@link grayscale}. */
export interface GrayscaleOptions {
  /**
   * Channel layout of the input. Defaults to `"rgba"`, or `"rgb"` for a
   * 3-channel matrix.
   */
  order?: ChannelOrder;
  /** Matrix to write into, reused across calls to avoid allocations. */
  out?: Matrix<"u8">;
}
