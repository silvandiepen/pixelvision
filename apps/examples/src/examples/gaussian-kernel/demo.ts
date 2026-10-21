import { gaussianKernel } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round } from "../../utils/format";
import type { GaussianKernelDemoOptions } from "./demo.model";

/**
 * Computes a 1D Gaussian kernel.
 *
 * @param input - Size, sigma (0 = derived from the size) and integer mode.
 * @returns The weights as a chart and a table.
 */
export function demo({ options }: OptionsInput<GaussianKernelDemoOptions>): DemoOutput {
  const weights = options.integer
    ? gaussianKernel(options.size, { sigma: options.sigma, integer: true })
    : gaussianKernel(options.size, { sigma: options.sigma });
  const values = Array.from(weights, (weight) => round(weight, 5));

  return {
    charts: [{ label: "Weights", values }],
    tables: [{ label: "Weights", columns: values.map((_, i) => `${i}`), rows: [values] }],
    values: {
      length: weights.length,
      sum: round(
        values.reduce((total, weight) => total + weight, 0),
        4,
      ),
      centre: values[Math.floor(values.length / 2)],
      symmetric: values.every((weight, i) => weight === values[values.length - 1 - i]),
    },
  };
}
