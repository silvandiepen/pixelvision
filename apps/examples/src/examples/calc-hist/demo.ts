import { calcHist, createMatrix, fromImageData } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { CalcHistDemoOptions } from "./demo.model";

/**
 * Counts the red, green and blue values of the swatches, over the whole
 * image and over the top row only.
 *
 * @param input - The image and the number of bins.
 * @returns A chart per channel and a few counts.
 */
export function demo({ image, options }: DemoInput<CalcHistDemoOptions>): DemoOutput {
  const rgba = fromImageData(image);
  const { bins } = options;
  const all = calcHist(rgba, { bins });
  // Only the top row of swatches (the skin tones).
  const mask = createMatrix(image.width, image.height);
  mask.data.fill(255, 0, image.width * 80);
  const top = calcHist(rgba, { bins, mask });
  const row = (c: number, h = all) => Array.from(h.data.subarray(c * bins, (c + 1) * bins));
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

  return {
    charts: [
      { label: "Red", values: row(0) },
      { label: "Green", values: row(1) },
      { label: "Blue", values: row(2) },
      { label: "Red, top row only", values: row(0, top) },
    ],
    values: {
      redTotal: sum(row(0)),
      redTopBin: row(0)[bins - 1],
      blueSecondBin: row(2)[1],
      topRowRedTotal: sum(row(0, top)),
    },
  };
}
