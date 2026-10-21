import { prepareOutput } from "../core/matrix";
import type { ImageLike, Matrix } from "../core/matrix.model";

const SHIFT = 12;
const HALF = 1 << (SHIFT - 1);
// OpenCV's integer division tables for 8-bit RGB → HSV.
const SDIV = Int32Array.from({ length: 256 }, (_, i) => (i ? Math.round((255 << SHIFT) / i) : 0));
const HDIV = Int32Array.from({ length: 256 }, (_, i) =>
  i ? Math.round((180 << SHIFT) / (6 * i)) : 0,
);

/**
 * Converts colour pixels to HSV the way OpenCV does for 8-bit images
 * (`COLOR_RGB2HSV`): hue 0–179 (degrees / 2), saturation and value 0–255.
 * Use it with {@link inRange} to select colours regardless of brightness.
 *
 * @param image - RGBA pixels (`ImageData`), or a 3- or 4-channel `u8` matrix in RGB order.
 * @param out - Optional output matrix.
 * @returns A 3-channel `u8` matrix of H, S, V.
 * @throws {RangeError} When the data is shorter than its size needs.
 *
 * @example
 * const hsv = rgbToHsv(context.getImageData(0, 0, width, height));
 */
export function rgbToHsv(image: ImageLike, out?: Matrix<"u8">): Matrix<"u8"> {
  const { width, height, data } = image;
  const channels = image.channels ?? 4;
  const pixels = width * height;
  if (data.length < pixels * channels) {
    throw new RangeError(
      `rgbToHsv: image data holds ${data.length} values, ${pixels * channels} needed`,
    );
  }
  const result = prepareOutput(out, "u8", width, height, 3);
  for (let p = 0, i = 0, o = 0; p < pixels; p++, i += channels, o += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const s = (diff * SDIV[v] + HALF) >> SHIFT;
    let h = v === r ? g - b : v === g ? b - r + 2 * diff : r - g + 4 * diff;
    h = (h * HDIV[diff] + HALF) >> SHIFT;
    if (h < 0) h += 180;
    result.data[o] = h;
    result.data[o + 1] = s;
    result.data[o + 2] = v;
  }
  return result;
}
