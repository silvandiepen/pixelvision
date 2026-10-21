import { matrixFromRows, matrixToRows, transpose } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { TransposeDemoOptions } from "./demo.model";

/**
 * Transposes a matrix.
 *
 * @param input - The matrix rows.
 * @returns The transposed matrix.
 */
export function demo({ options }: OptionsInput<TransposeDemoOptions>): DemoOutput {
  const a = matrixFromRows(options.a);
  const t = transpose(a);
  const rows = matrixToRows(t);

  return {
    tables: [{ label: `Aᵀ, ${t.height} x ${t.width}`, rows }],
    values: {
      width: t.width,
      height: t.height,
      firstRow: rows[0].join(","),
    },
  };
}
