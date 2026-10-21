import { identity, invert3x3, matrixFromRows, matrixToRows, multiply } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { roundRows } from "../../utils/format";
import { maxDifference } from "../../utils/stats";
import type { Invert3x3DemoOptions } from "./demo.model";

/**
 * Inverts a 3x3 matrix and checks that M · M⁻¹ is the identity.
 *
 * @param input - The matrix rows.
 * @returns The inverse.
 * @throws {RangeError} When the matrix is singular.
 */
export function demo({ options }: OptionsInput<Invert3x3DemoOptions>): DemoOutput {
  const m = matrixFromRows(options.m);
  const inverse = invert3x3(m);
  const check = multiply(m, inverse);

  return {
    tables: [
      { label: "M⁻¹", rows: roundRows(matrixToRows(inverse), 6) },
      { label: "M · M⁻¹", rows: roundRows(matrixToRows(check), 9) },
    ],
    values: { identityError: maxDifference(check.data, identity(3).data) },
  };
}
