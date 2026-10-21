import jsfeat from "jsfeat";
import type { JsfeatMatrix } from "jsfeat";
import { createMatrix, grayscale } from "pixelvision";
import type { Matrix, PixelType } from "pixelvision";
import type { Fixture } from "./fixtures.model";

const jsfeatTypes: Record<PixelType, number> = {
  u8: jsfeat.U8_t,
  i32: jsfeat.S32_t,
  f32: jsfeat.F32_t,
  f64: jsfeat.F64_t,
};

/**
 * Copies a pixelvision matrix into a new jsfeat matrix.
 *
 * @param matrix - Source matrix.
 * @returns A jsfeat `matrix_t` with the same type, shape and values.
 */
export const toJsfeat = (matrix: Matrix): JsfeatMatrix => {
  const result = new jsfeat.matrix_t(
    matrix.width,
    matrix.height,
    jsfeatTypes[matrix.type] | matrix.channels,
  );
  const length = matrix.width * matrix.height * matrix.channels;
  for (let i = 0; i < length; i++) result.data[i] = matrix.data[i];
  return result;
};

/**
 * Creates an empty jsfeat matrix.
 *
 * @param width - Columns.
 * @param height - Rows.
 * @param type - Element type.
 * @param channels - Values per pixel.
 * @returns The jsfeat matrix.
 */
export const jsfeatMatrix = (
  width: number,
  height: number,
  type: PixelType,
  channels = 1,
): JsfeatMatrix => new jsfeat.matrix_t(width, height, jsfeatTypes[type] | channels);

/**
 * Converts a fixture to a gray `u8` matrix.
 *
 * @param fixture - RGBA fixture.
 * @returns Its grayscale.
 */
export const gray = (fixture: Fixture): Matrix<"u8"> => grayscale(fixture);

/**
 * Converts a gray matrix to another element type, keeping the values.
 *
 * @param matrix - Gray `u8` matrix.
 * @param type - Target type.
 * @returns A matrix of `type` with the same values.
 */
export const asType = <T extends PixelType>(matrix: Matrix<"u8">, type: T): Matrix<T> => {
  const result = createMatrix(matrix.width, matrix.height, { type, channels: matrix.channels });
  for (let i = 0; i < matrix.data.length; i++) result.data[i] = matrix.data[i];
  return result;
};
