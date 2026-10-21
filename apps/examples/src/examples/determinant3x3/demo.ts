import { determinant3x3, matrixFromRows } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round } from "../../utils/format";
import type { Determinant3x3DemoOptions } from "./demo.model";

/**
 * Computes the determinant of a 3x3 matrix.
 *
 * @param input - The matrix rows.
 * @returns The determinant.
 */
export function demo({ options }: OptionsInput<Determinant3x3DemoOptions>): DemoOutput {
  const determinant = determinant3x3(matrixFromRows(options.m));

  return {
    tables: [{ label: "Determinant", rows: [[round(determinant, 9)]] }],
    values: { determinant: round(determinant, 9) },
  };
}
