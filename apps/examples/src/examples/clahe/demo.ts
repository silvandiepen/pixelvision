import { clahe, equalizeHistogram, grayscale } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { histogram, minMax, valueAt } from "../../utils/stats";
import type { ClaheDemoOptions } from "./demo.model";

/**
 * Root mean square of the differences between horizontal neighbours in a
 * patch: how strong the pixel noise is.
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
 * Brings out the dull scene with CLAHE, next to a global equalisation.
 *
 * @param input - The image, clip limit and tiles across and down.
 * @returns Both results, their histograms, and noise and contrast figures.
 */
export function demo({ image, options }: DemoInput<ClaheDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const local = clahe(gray, {
    clipLimit: options.clipLimit,
    tileGridSize: { width: options.tiles, height: options.tiles },
  });
  const global = equalizeHistogram(gray);
  // Plain background in the bottom-left corner.
  const patch = [10, 195, 50, 40] as const;
  const [inputMin, inputMax] = minMax(gray);
  const [outputMin, outputMax] = minMax(local);

  return {
    images: [
      { label: "Gray", image: gray },
      { label: `CLAHE, clip ${options.clipLimit}`, image: local },
      { label: "Global equalisation", image: global },
    ],
    charts: [
      { label: "Histogram before", values: histogram(gray) },
      { label: "Histogram after CLAHE", values: histogram(local) },
    ],
    values: {
      inputRange: inputMax - inputMin,
      outputRange: outputMax - outputMin,
      noiseGain: round(neighbourNoise(local, ...patch) / neighbourNoise(gray, ...patch), 2),
      globalNoiseGain: round(neighbourNoise(global, ...patch) / neighbourNoise(gray, ...patch), 2),
    },
  };
}
