import { boxSum, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { valueAt } from "../../utils/stats";
import { normalizeToGray } from "../../utils/visualize";
import type { BoxSumDemoOptions } from "./demo.model";

/**
 * Sums every pixel's neighbourhood without dividing.
 *
 * @param input - The image and the window radius.
 * @returns The window sums, scaled to gray for display.
 */
export function demo({ image, options }: DemoInput<BoxSumDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const sums = boxSum(gray, { radius: options.radius });
  const side = 2 * options.radius + 1;

  return {
    images: [
      {
        label: "Window sums (scaled to 0–255)",
        image: normalizeToGray(sums.data, sums.width, sums.height),
      },
    ],
    tables: [
      {
        label: "Inside the red rectangle (gray value 76)",
        columns: ["Window", "Sum", "Expected"],
        rows: [[`${side} x ${side}`, valueAt(sums, 72, 60), side * side * 76]],
      },
    ],
    values: {
      type: sums.type,
      sumInRed: valueAt(sums, 72, 60),
      expectedSumInRed: side * side * 76,
    },
  };
}
