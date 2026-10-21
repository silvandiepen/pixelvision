import { identity, matrixToRows } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { IdentityDemoOptions } from "./demo.model";

/**
 * Creates a (scaled) identity matrix.
 *
 * @param input - Size and diagonal value.
 * @returns The matrix.
 */
export function demo({ options }: OptionsInput<IdentityDemoOptions>): DemoOutput {
  const matrix = identity(options.size, options.value);
  const rows = matrixToRows(matrix);

  return {
    tables: [{ label: `${options.size} x ${options.size}`, rows }],
    values: {
      type: matrix.type,
      trace: rows.reduce((sum, row, i) => sum + row[i], 0),
      offDiagonalZero: rows.every((row, i) => row.every((value, j) => i === j || value === 0)),
    },
  };
}
