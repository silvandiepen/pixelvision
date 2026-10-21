import { median } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { MedianDemoOptions } from "./demo.model";

/**
 * Computes the median of a list of numbers.
 *
 * @param input - The numbers (one row).
 * @returns The median and the sorted list.
 */
export function demo({ options }: OptionsInput<MedianDemoOptions>): DemoOutput {
  const values = options.values[0];
  const before = values.join(",");
  const result = median(values);

  return {
    tables: [
      { label: "Sorted", rows: [[...values].sort((a, b) => a - b)] },
      { label: "Median", rows: [[result]] },
    ],
    values: { median: result, inputUnchanged: values.join(",") === before },
  };
}
