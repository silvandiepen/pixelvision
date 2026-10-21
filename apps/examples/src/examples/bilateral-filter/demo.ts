import { bilateralFilter, grayscale } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { valueAt } from "../../utils/stats";
import type { BilateralFilterDemoOptions } from "./demo.model";

/**
 * Root mean square of the differences between horizontal neighbours in a
 * patch: twice the noise variance, without the slow vertical shading.
 *
 * @param image - Gray image.
 * @param x0 - Patch left.
 * @param y0 - Patch top.
 * @param w - Patch width.
 * @param h - Patch height.
 * @returns The RMS difference.
 */
function neighbourNoise(image: Matrix<"u8">, x0: number, y0: number, w: number, h: number): number {
  let sum = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w - 1; x++)
      sum += (valueAt(image, x + 1, y) - valueAt(image, x, y)) ** 2;
  }
  return Math.sqrt(sum / (h * (w - 1)));
}

/**
 * Smooths the noisy background of the gray shapes while keeping the edges
 * of the shapes.
 *
 * @param input - The image, neighbourhood diameter and the two sigmas.
 * @returns The filtered image, noise before and after, and an edge step.
 */
export function demo({ image, options }: DemoInput<BilateralFilterDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const smooth = bilateralFilter(gray, options);
  // Background patch between the red rectangle and the green circle.
  const patch = [125, 30, 46, 70] as const;

  return {
    images: [
      { label: "Gray", image: gray },
      { label: "Bilateral", image: smooth },
    ],
    values: {
      noiseBefore: round(neighbourNoise(gray, ...patch), 2),
      noiseAfter: round(neighbourNoise(smooth, ...patch), 2),
      // The red rectangle's left edge: background at x 23, red (76) at x 24.
      edgeStep: valueAt(smooth, 23, 60) - valueAt(smooth, 24, 60),
    },
  };
}
