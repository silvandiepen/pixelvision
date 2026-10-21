import { matrixFromRows, matrixToRows, multiply } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { MultiplyDemoOptions } from "./demo.model";

/**
 * Multiplies two matrices, optionally transposing either first.
 *
 * @param input - A, B and the transpose flags.
 * @returns The product.
 * @throws {RangeError} When the inner dimensions don't match.
 */
export function demo({ options }: OptionsInput<MultiplyDemoOptions>): DemoOutput {
  const a = matrixFromRows(options.a);
  const b = matrixFromRows(options.b);
  const product = multiply(a, b, {
    transposeA: options.transposeA,
    transposeB: options.transposeB,
  });
  const rows = matrixToRows(product);

  return {
    tables: [{ label: `Product, ${product.height} x ${product.width}`, rows }],
    values: { rows: rows.map((row) => row.join(",")).join(";") },
  };
}
