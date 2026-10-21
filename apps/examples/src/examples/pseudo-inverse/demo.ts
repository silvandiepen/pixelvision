import { matrixFromRows, matrixToRows, multiply, pseudoInverse } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { roundRows } from "../../utils/format";
import { maxDifference } from "../../utils/stats";
import type { PseudoInverseDemoOptions } from "./demo.model";

/**
 * Computes the pseudo-inverse and checks A · A⁺ · A = A.
 *
 * @param input - The matrix rows.
 * @returns A⁺.
 */
export function demo({ options }: OptionsInput<PseudoInverseDemoOptions>): DemoOutput {
  const a = matrixFromRows(options.a);
  const pinv = pseudoInverse(a);
  const back = multiply(multiply(a, pinv), a);
  const rows = roundRows(matrixToRows(pinv), 4);

  return {
    tables: [
      { label: `A⁺, ${pinv.height} x ${pinv.width}`, rows },
      { label: "A · A⁺ · A", rows: roundRows(matrixToRows(back), 9) },
    ],
    values: {
      pinv: rows.map((row) => row.join(",")).join(";"),
      penroseError: maxDifference(back.data, a.data),
    },
  };
}
