import { eigenSymmetric, matrixFromRows, matrixToRows, multiply } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round, roundRows } from "../../utils/format";
import type { EigenSymmetricDemoOptions } from "./demo.model";

/**
 * Computes eigenvalues and eigenvectors and checks A · v = λ · v.
 *
 * @param input - The symmetric matrix rows.
 * @returns The eigenvalues and eigenvectors.
 */
export function demo({ options }: OptionsInput<EigenSymmetricDemoOptions>): DemoOutput {
  const a = matrixFromRows(options.a);
  const { values, vectors } = eigenSymmetric(a);
  const rows = matrixToRows(vectors); // one eigenvector per row

  let residual = 0;
  rows.forEach((vector, k) => {
    const av = multiply(a, matrixFromRows(vector.map((value) => [value])));
    vector.forEach((value, i) => {
      residual = Math.max(residual, Math.abs(av.data[i] - values[k] * value));
    });
  });

  return {
    tables: [
      { label: "Eigenvalues", rows: [Array.from(values, (value) => round(value, 9))] },
      { label: "Eigenvectors (rows)", rows: roundRows(rows, 6) },
    ],
    values: {
      eigenvalues: Array.from(values, (value) => round(value, 9)).join(","),
      residual,
    },
  };
}
