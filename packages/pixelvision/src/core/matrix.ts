import type { CreateMatrixOptions, Matrix, PixelArrays, PixelType } from "./matrix.model";

const constructors: { [T in PixelType]: new (length: number) => PixelArrays[T] } = {
  u8: Uint8Array,
  i32: Int32Array,
  f32: Float32Array,
  f64: Float64Array,
};

/**
 * Checks that a size is a non-negative whole number.
 *
 * @param name - Name used in the error message.
 * @param value - The value to check.
 * @throws {RangeError} When the value is negative, fractional or not finite.
 */
const assertSize = (name: string, value: number): void => {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${value}`);
  }
};

/**
 * Allocates the typed array for a pixel type.
 *
 * @param type - Element type.
 * @param length - Number of elements.
 * @returns A zero-filled typed array.
 */
export const allocate = <T extends PixelType>(type: T, length: number): PixelArrays[T] =>
  new constructors[type](length);

/**
 * Creates a matrix, zero-filled unless `data` is given.
 *
 * @param width - Number of columns.
 * @param height - Number of rows.
 * @param options - Element type, channel count and optional storage to wrap.
 * @returns The new matrix.
 * @throws {RangeError} When a size is invalid or `data` is too short.
 *
 * @example
 * const gray = createMatrix(640, 480);
 * const gradients = createMatrix(640, 480, { type: "i32", channels: 2 });
 */
export function createMatrix<T extends PixelType = "u8">(
  width: number,
  height: number,
  options: CreateMatrixOptions<T> = {},
): Matrix<T> {
  const type = (options.type ?? "u8") as T;
  const channels = options.channels ?? 1;
  assertSize("width", width);
  assertSize("height", height);
  assertSize("channels", channels);
  const length = width * height * channels;
  if (options.data && options.data.length < length) {
    throw new RangeError(`data holds ${options.data.length} values, ${length} needed`);
  }
  return { type, width, height, channels, data: options.data ?? allocate(type, length) };
}

/**
 * Copies a matrix into new storage.
 *
 * @param source - The matrix to copy.
 * @returns A matrix with the same shape and values.
 */
export function cloneMatrix<T extends PixelType>(source: Matrix<T>): Matrix<T> {
  const length = source.width * source.height * source.channels;
  return { ...source, data: source.data.slice(0, length) as PixelArrays[T] };
}

/**
 * Returns a matrix of the requested shape, reusing `out` when given. `out`
 * keeps its storage when it is large enough and is reallocated otherwise,
 * so a matrix can be reused frame after frame without new allocations.
 *
 * @param out - Matrix to reuse, if any.
 * @param type - Element type the caller writes.
 * @param width - Number of columns.
 * @param height - Number of rows.
 * @param channels - Values per pixel.
 * @returns `out` reshaped, or a new matrix.
 * @throws {TypeError} When `out` has a different element type.
 */
export function prepareOutput<T extends PixelType>(
  out: Matrix<T> | undefined,
  type: T,
  width: number,
  height: number,
  channels: number,
): Matrix<T> {
  if (!out) return createMatrix(width, height, { type, channels });
  if (out.type !== type) {
    throw new TypeError(`out must be a ${type} matrix, got ${out.type}`);
  }
  const length = width * height * channels;
  if (out.data.length < length) out.data = allocate(type, length);
  out.width = width;
  out.height = height;
  out.channels = channels;
  return out;
}
