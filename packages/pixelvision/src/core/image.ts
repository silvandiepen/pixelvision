import type { ImageLike, Matrix, RGBAImage } from "./matrix.model";
import { createMatrix } from "./matrix";

/**
 * Wraps RGBA pixel data (such as a canvas `ImageData`) as a 4-channel `u8`
 * matrix. The pixels are copied, so later changes to the source don't leak
 * in.
 *
 * @param image - RGBA pixels, row by row.
 * @returns A 4-channel `u8` matrix.
 * @throws {RangeError} When `data` is shorter than `width * height * 4`.
 *
 * @example
 * const frame = fromImageData(context.getImageData(0, 0, width, height));
 */
export function fromImageData(image: ImageLike): Matrix<"u8"> {
  const matrix = createMatrix(image.width, image.height, { channels: 4 });
  const length = matrix.data.length;
  if (image.data.length < length) {
    throw new RangeError(`image data holds ${image.data.length} values, ${length} needed`);
  }
  for (let i = 0; i < length; i++) matrix.data[i] = image.data[i];
  return matrix;
}

/**
 * Converts a `u8` matrix to RGBA pixels you can draw with
 * `context.putImageData(new ImageData(result.data, result.width))`. Gray
 * (1 channel) is spread over R, G and B; 3 channels are read as RGB; alpha
 * is opaque unless the matrix has 4 channels.
 *
 * @param matrix - A `u8` matrix with 1, 3 or 4 channels.
 * @returns RGBA pixels.
 * @throws {RangeError} When the matrix has another channel count.
 */
export function toImageData(matrix: Matrix<"u8">): RGBAImage {
  const { width, height, channels, data: source } = matrix;
  if (channels !== 1 && channels !== 3 && channels !== 4) {
    throw new RangeError(`toImageData needs 1, 3 or 4 channels, got ${channels}`);
  }
  const pixels = width * height;
  const data = new Uint8ClampedArray(pixels * 4);
  for (let p = 0, s = 0, d = 0; p < pixels; p++, s += channels, d += 4) {
    if (channels === 1) {
      data[d] = data[d + 1] = data[d + 2] = source[s];
      data[d + 3] = 255;
    } else {
      data[d] = source[s];
      data[d + 1] = source[s + 1];
      data[d + 2] = source[s + 2];
      data[d + 3] = channels === 4 ? source[s + 3] : 255;
    }
  }
  return { width, height, data };
}
