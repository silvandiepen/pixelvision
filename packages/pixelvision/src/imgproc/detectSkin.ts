import { prepareOutput } from "../core/matrix";
import type { ImageLike, Matrix } from "../core/matrix.model";
import type { DetectSkinOptions } from "./detectSkin.model";

/**
 * Marks pixels whose colour falls in a common RGB skin-tone range
 * (Peer et al.): R > 95, G > 40, B > 20, R is the largest channel, and R
 * stands out from G and from the smaller of G and B by more than 15. A
 * rough, lighting-sensitive filter; use it to find candidate regions.
 *
 * @param image - RGBA pixels, such as `ImageData` or a 4-channel matrix.
 * @param options - Optional output matrix.
 * @returns A single-channel `u8` mask: 255 for skin, 0 otherwise.
 * @throws {RangeError} When the data is shorter than `width * height * 4`.
 *
 * @example
 * const mask = detectSkin(context.getImageData(0, 0, width, height));
 */
export function detectSkin(image: ImageLike, options: DetectSkinOptions = {}): Matrix<"u8"> {
  const { width, height, data } = image;
  const pixels = width * height;
  if (data.length < pixels * 4) {
    throw new RangeError(`image data holds ${data.length} values, ${pixels * 4} needed for RGBA`);
  }
  const out = prepareOutput(options.out, "u8", width, height, 1);
  for (let i = 0, j = 0; i < pixels; i++, j += 4) {
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    const skin =
      r > 95 &&
      g > 40 &&
      b > 20 &&
      r > g &&
      r > b &&
      r - Math.min(g, b) > 15 &&
      Math.abs(r - g) > 15;
    out.data[i] = skin ? 255 : 0;
  }
  return out;
}
