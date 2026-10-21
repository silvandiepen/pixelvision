import { assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { PyrDownOptions } from "./pyrDown.model";
import { forEachChannel } from "./planes";

/**
 * Halves one plane by averaging 2x2 blocks (rounded to nearest), starting
 * at an offset. Blocks past `width - 2 * offsetX` columns or
 * `height - 2 * offsetY` rows are left untouched.
 *
 * @param source - Input plane.
 * @param target - Output plane, `(width >> 1) x (height >> 1)`.
 * @param width - Input width.
 * @param height - Input height.
 * @param offsetX - First input column, in pixels.
 * @param offsetY - First input row, in pixels.
 */
export const pyrDownPlane = (
  source: ArrayLike<number>,
  target: { [index: number]: number },
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0,
): void => {
  const halfWidth = width >> 1;
  const columns = halfWidth - (offsetX << 1);
  const rows = (height >> 1) - (offsetY << 1);
  for (
    let y = 0, s = offsetX + offsetY * width, d = 0;
    y < rows;
    y++, s += width << 1, d += halfWidth
  ) {
    for (let x = 0, sl = s; x < columns; x++, sl += 2) {
      target[d + x] =
        (source[sl] + source[sl + 1] + source[sl + width] + source[sl + width + 1] + 2) >> 2;
    }
  }
};

/**
 * Halves the width and height by averaging each 2x2 block: one level of
 * an image pyramid. An odd last row or column is dropped.
 *
 * @param image - 8-bit matrix, any number of channels.
 * @param options - Optional output matrix.
 * @returns A `u8` matrix of `floor(width / 2) x floor(height / 2)`.
 * @throws {TypeError} When the image isn't `u8`.
 *
 * @example
 * const half = pyrDown(gray);
 * const quarter = pyrDown(half);
 */
export function pyrDown(image: Matrix<"u8">, options: PyrDownOptions = {}): Matrix<"u8"> {
  assertType("pyrDown", image, "u8");
  const { width, height, channels } = image;
  const out = prepareOutput(options.out, "u8", width >> 1, height >> 1, channels);
  forEachChannel(image, out, (input, output) => pyrDownPlane(input, output, width, height));
  return out;
}
