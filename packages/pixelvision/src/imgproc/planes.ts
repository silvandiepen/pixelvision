import { allocate } from "../core/matrix";
import type { Matrix, PixelArrays, PixelType } from "../core/matrix.model";

/**
 * Runs a single-channel operation on every channel of a matrix: each
 * channel is copied out to its own plane, processed, and written back.
 * Single-channel input is processed in place without copies.
 *
 * @param source - Input matrix.
 * @param target - Output matrix, already shaped with the same channel count.
 * @param run - Processes one plane: reads `input`, writes `output`.
 */
export const forEachChannel = <S extends PixelType, T extends PixelType>(
  source: Matrix<S>,
  target: Matrix<T>,
  run: (input: PixelArrays[S], output: PixelArrays[T]) => void,
): void => {
  const { channels } = source;
  if (channels === 1) {
    run(source.data, target.data);
    return;
  }
  const inputPixels = source.width * source.height;
  const outputPixels = target.width * target.height;
  const input = allocate(source.type, inputPixels);
  const output = allocate(target.type, outputPixels);
  for (let c = 0; c < channels; c++) {
    for (let p = 0; p < inputPixels; p++) input[p] = source.data[p * channels + c];
    run(input, output);
    for (let p = 0; p < outputPixels; p++) target.data[p * channels + c] = output[p];
  }
};
