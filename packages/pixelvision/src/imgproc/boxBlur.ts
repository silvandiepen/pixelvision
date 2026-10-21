import { assertInteger, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { BoxBlurOptions, BoxSumOptions } from "./boxBlur.model";
import { forEachChannel } from "./planes";

/**
 * Sums a square window around every pixel of one plane in two sliding
 * passes (rows, then columns). Borders repeat the edge pixel.
 *
 * @param source - Input plane.
 * @param width - Plane width.
 * @param height - Plane height.
 * @param radius - Window radius.
 * @param write - Stores the window sum for pixel index `i`.
 */
const slidingSum = (
  source: ArrayLike<number>,
  width: number,
  height: number,
  radius: number,
  write: (i: number, sum: number) => void,
): void => {
  const rows = new Int32Array(width * height);
  const clampX = (x: number) => (x < 0 ? 0 : x >= width ? width - 1 : x);
  const clampY = (y: number) => (y < 0 ? 0 : y >= height ? height - 1 : y);

  for (let y = 0, row = 0; y < height; y++, row += width) {
    let sum = 0;
    for (let k = -radius; k <= radius; k++) sum += source[row + clampX(k)];
    for (let x = 0; x < width; x++) {
      rows[row + x] = sum;
      sum += source[row + clampX(x + radius + 1)] - source[row + clampX(x - radius)];
    }
  }
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let k = -radius; k <= radius; k++) sum += rows[clampY(k) * width + x];
    for (let y = 0; y < height; y++) {
      write(y * width + x, sum);
      sum += rows[clampY(y + radius + 1) * width + x] - rows[clampY(y - radius) * width + x];
    }
  }
};

/**
 * Validates the input of the box filters.
 *
 * @param fn - Name of the calling function.
 * @param image - Input matrix.
 * @param radius - Window radius.
 */
const check = (fn: string, image: Matrix, radius: number): void => {
  assertType(fn, image, "u8");
  assertInteger(fn, "radius", radius, 0);
};

/**
 * Averages every pixel with its neighbours in a `2 * radius + 1` square:
 * a fast blur whose cost doesn't grow with the radius. Each channel is
 * blurred separately; borders repeat the edge pixel; averages are rounded
 * down.
 *
 * @param image - 8-bit matrix, any number of channels.
 * @param options - Window radius and an optional output matrix.
 * @returns A blurred `u8` matrix of the same size and channels.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the radius is negative or fractional.
 *
 * @example
 * const blurred = boxBlur(gray, { radius: 2 }); // 5x5 average
 */
export function boxBlur(image: Matrix<"u8">, options: BoxBlurOptions): Matrix<"u8"> {
  const { radius } = options;
  check("boxBlur", image, radius);
  const { width, height, channels } = image;
  const out = prepareOutput(options.out, "u8", width, height, channels);
  const windowSize = (radius << 1) + 1;
  const scale = 1 / (windowSize * windowSize);
  forEachChannel(image, out, (input, output) =>
    slidingSum(input, width, height, radius, (i, sum) => {
      output[i] = sum * scale;
    }),
  );
  return out;
}

/**
 * Sums every pixel with its neighbours in a `2 * radius + 1` square,
 * without dividing: {@link boxBlur} before averaging. Useful for local
 * counts and means you scale yourself.
 *
 * @param image - 8-bit matrix, any number of channels.
 * @param options - Window radius and an optional output matrix.
 * @returns An `i32` matrix of window sums, same size and channels.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the radius is negative or fractional.
 *
 * @example
 * const sums = boxSum(mask, { radius: 1 }); // 3x3 sums
 */
export function boxSum(image: Matrix<"u8">, options: BoxSumOptions): Matrix<"i32"> {
  const { radius } = options;
  check("boxSum", image, radius);
  const { width, height, channels } = image;
  const out = prepareOutput(options.out, "i32", width, height, channels);
  forEachChannel(image, out, (input, output) =>
    slidingSum(input, width, height, radius, (i, sum) => {
      output[i] = sum;
    }),
  );
  return out;
}
