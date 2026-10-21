import { prepareOutput } from "../core/matrix";
import type { Matrix, PixelType } from "../core/matrix.model";

/**
 * Mirrors an image horizontally (left–right) or vertically (top–bottom).
 *
 * @param image - Any matrix.
 * @param direction - `"horizontal"` (default) or `"vertical"`.
 * @param out - Optional output matrix of the same type.
 * @returns The mirrored matrix.
 *
 * @example
 * const selfieView = flip(frame); // mirror like a front camera preview
 */
export function flip<T extends PixelType>(
  image: Matrix<T>,
  direction: "horizontal" | "vertical" = "horizontal",
  out?: Matrix<T>,
): Matrix<T> {
  const { width: w, height: h, channels: ch, type, data } = image;
  const result = prepareOutput(out, type, w, h, ch);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = direction === "horizontal" ? w - 1 - x : x;
      const sy = direction === "vertical" ? h - 1 - y : y;
      for (let c = 0; c < ch; c++) result.data[(y * w + x) * ch + c] = data[(sy * w + sx) * ch + c];
    }
  }
  return result;
}
