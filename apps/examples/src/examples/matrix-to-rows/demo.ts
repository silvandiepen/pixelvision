import { createMatrix, matrixFromRows, matrixToRows } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { MatrixToRowsDemoOptions } from "./demo.model";

/**
 * Reads a matrix back as rows of numbers.
 *
 * @param input - Size of the matrix to create.
 * @returns The rows.
 */
export function demo({ options }: OptionsInput<MatrixToRowsDemoOptions>): DemoOutput {
  const matrix = createMatrix(options.width, options.height, { type: "f32" });
  matrix.data.forEach((_, i) => (matrix.data[i] = i)); // 0, 1, 2, … row by row

  const rows = matrixToRows(matrix);
  const back = matrixFromRows(rows);

  return {
    tables: [{ label: `${rows.length} rows`, rows }],
    values: {
      rowCount: rows.length,
      lastRow: rows[rows.length - 1].join(","),
      roundTrip: back.data.every((value, i) => value === matrix.data[i]),
    },
  };
}
