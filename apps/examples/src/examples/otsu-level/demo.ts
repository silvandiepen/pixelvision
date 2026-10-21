import { grayscale, otsuLevel } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { histogram } from "../../utils/stats";

/**
 * Finds the level that best splits the image into dark and bright.
 *
 * @param input - The image.
 * @returns The histogram with the level marked, and the level.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const gray = grayscale(image);
  const level = otsuLevel(gray);
  const counts = histogram(gray);

  // Mean gray of each class, for the check below.
  const meanOf = (from: number, to: number) => {
    let sum = 0;
    let count = 0;
    for (let v = from; v <= to; v++) {
      sum += v * counts[v];
      count += counts[v];
    }
    return count ? Math.round(sum / count) : -1;
  };

  return {
    charts: [
      {
        label: `Histogram; level ${level}`,
        values: counts.map((count, v) => (v === level ? Math.max(...counts) : count)),
      },
    ],
    values: { level, darkMean: meanOf(0, level), brightMean: meanOf(level + 1, 255) },
  };
}
