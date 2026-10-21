import { matrixFromRows } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { MatrixFromRowsDemoOptions } from "./demo.model";

/**
 * Builds a numeric matrix from rows of numbers.
 *
 * @param input - The rows.
 * @returns The matrix's properties and flat data.
 */
export function demo({ options }: OptionsInput<MatrixFromRowsDemoOptions>): DemoOutput {
  const matrix = matrixFromRows(options.rows);

  return {
    tables: [
      {
        label: "The matrix",
        columns: ["Property", "Value"],
        rows: [
          ["type", matrix.type],
          ["width", matrix.width],
          ["height", matrix.height],
          ["data", Array.from(matrix.data).join(", ")],
        ],
      },
    ],
    values: {
      type: matrix.type,
      width: matrix.width,
      height: matrix.height,
      data: Array.from(matrix.data).join(","),
    },
  };
}
