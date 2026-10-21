import { choleskySolve, matrixFromRows, multiply } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round } from "../../utils/format";
import { maxDifference } from "../../utils/stats";
import type { CholeskySolveDemoOptions } from "./demo.model";

/**
 * Solves A · x = b and checks the residual.
 *
 * @param input - A (rows) and b (one value per row).
 * @returns The solution.
 */
export function demo({ options }: OptionsInput<CholeskySolveDemoOptions>): DemoOutput {
  const a = matrixFromRows(options.a);
  const b = options.b.map(([value]) => value);
  const x = choleskySolve(a, b);

  const ax = multiply(a, matrixFromRows(Array.from(x, (value) => [value])));
  const residual = maxDifference(ax.data, b);

  return {
    tables: [
      {
        label: "Solution",
        columns: ["", "x", "A · x", "b"],
        rows: Array.from(x, (value, i) => [i, round(value, 9), round(ax.data[i], 9), b[i]]),
      },
    ],
    values: {
      x: Array.from(x, (value) => round(value, 9)).join(","),
      residual,
    },
  };
}
