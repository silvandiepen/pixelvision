import { createMatrix } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { CreateMatrixDemoOptions } from "./demo.model";

/**
 * Creates a matrix, then paints a checkerboard into an 8-bit matrix of the
 * same shape to show how pixels and channels are laid out in `data`.
 *
 * @param input - The control values.
 * @returns The new matrix's properties and the checkerboard.
 */
export function demo({ options }: OptionsInput<CreateMatrixDemoOptions>): DemoOutput {
  const { width, height, type, channels } = options;
  const matrix = createMatrix(width, height, { type, channels });

  // Value of channel c at (x, y): data[(y * width + x) * channels + c]
  const preview = createMatrix(width, height, { channels });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < channels; c++) {
        const on = (x + y) % 2 === 0;
        preview.data[(y * width + x) * channels + c] = on ? 255 - c * 80 : 40;
      }
    }
  }

  return {
    images: [{ label: "Checkerboard written into data", image: preview }],
    tables: [
      {
        label: "The new matrix",
        columns: ["Property", "Value"],
        rows: [
          ["type", matrix.type],
          ["width", matrix.width],
          ["height", matrix.height],
          ["channels", matrix.channels],
          ["data", matrix.data.constructor.name],
          ["data.length", matrix.data.length],
        ],
      },
    ],
    values: {
      type: matrix.type,
      length: matrix.data.length,
      bytesPerValue: matrix.data.BYTES_PER_ELEMENT,
      allZero: matrix.data.every((value) => value === 0),
    },
  };
}
