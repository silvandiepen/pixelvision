import type { ImageLike, Matrix } from "../core/matrix.model";
import { prepareOutput } from "../core/matrix";
import type { ChannelOrder, GrayscaleOptions } from "./grayscale.model";

// ITU-R BT.601 luma weights in 14-bit fixed point: 0.299, 0.587, 0.114.
const RED = 4899;
const GREEN = 9617;
const BLUE = 1868;
const HALF = 1 << 13;

const channelsOf: Record<ChannelOrder, number> = { rgba: 4, rgb: 3, bgra: 4, bgr: 3 };

/**
 * Converts colour pixels to 8-bit gray using the BT.601 luma weights
 * (0.299 R + 0.587 G + 0.114 B), rounded in fixed point.
 *
 * @param image - Colour pixels: an `ImageData`, a 3- or 4-channel matrix, or any {@link ImageLike}.
 * @param options - Channel order and an optional output matrix.
 * @returns A 1-channel `u8` matrix of the same size.
 * @throws {RangeError} When the pixel data is shorter than the size and channel order need.
 *
 * @example
 * const gray = grayscale(context.getImageData(0, 0, width, height));
 */
export function grayscale(image: ImageLike, options: GrayscaleOptions = {}): Matrix<"u8"> {
  const order = options.order ?? (image.channels === 3 ? "rgb" : "rgba");
  const channels = channelsOf[order];
  const { width, height, data: source } = image;
  const pixels = width * height;
  if (source.length < pixels * channels) {
    throw new RangeError(
      `image data holds ${source.length} values, ${pixels * channels} needed for ${order}`,
    );
  }
  const [r, b] = order.startsWith("bgr") ? [BLUE, RED] : [RED, BLUE];
  const out = prepareOutput(options.out, "u8", width, height, 1);
  const target = out.data;
  for (let p = 0, s = 0; p < pixels; p++, s += channels) {
    target[p] = (source[s] * r + source[s + 1] * GREEN + source[s + 2] * b + HALF) >> 14;
  }
  return out;
}
