import { identity, matrixFromRows, matrixToRows, multiply, svd } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round, roundRows } from "../../utils/format";
import { maxDifference } from "../../utils/stats";
import type { SvdDemoOptions } from "./demo.model";

/**
 * Decomposes A = U · Σ · Vᵀ and rebuilds A from the parts.
 *
 * @param input - The matrix rows.
 * @returns The singular values, U and V, and the checks.
 */
export function demo({ options }: OptionsInput<SvdDemoOptions>): DemoOutput {
  const a = matrixFromRows(options.a);
  const { values, u, v } = svd(a);

  // Σ is rows x columns with the singular values on its diagonal.
  const sigma = matrixFromRows(
    Array.from({ length: a.height }, (_, i) =>
      Array.from({ length: a.width }, (_, j) => (i === j ? values[i] : 0)),
    ),
  );
  const rebuilt = multiply(multiply(u, sigma), v, { transposeB: true });
  const uOrthonormal = maxDifference(
    multiply(u, u, { transposeA: true }).data,
    identity(u.width).data,
  );

  return {
    tables: [
      { label: "Singular values", rows: [Array.from(values, (s) => round(s, 9))] },
      { label: "U", rows: roundRows(matrixToRows(u), 6) },
      { label: "V", rows: roundRows(matrixToRows(v), 6) },
      { label: "U · Σ · Vᵀ", rows: roundRows(matrixToRows(rebuilt), 9) },
    ],
    values: {
      singularValues: Array.from(values, (s) => round(s, 9)).join(","),
      rebuildError: maxDifference(rebuilt.data, a.data),
      uOrthonormalError: uOrthonormal,
    },
  };
}
