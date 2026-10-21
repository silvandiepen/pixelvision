import { cloneMatrix, grayscale, medianBlur } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { seededRandom } from "../../samples/random";
import type { MedianBlurDemoOptions } from "./demo.model";

/**
 * Sprinkles black and white specks on the gray image and removes them.
 *
 * @param input - The image and the window size.
 * @returns The noisy and the cleaned image.
 */
export function demo({ image, options }: DemoInput<MedianBlurDemoOptions>): DemoOutput {
  const clean = grayscale(image);
  // Salt and pepper: 5 % of pixels turned black or white.
  const noisy = cloneMatrix(clean);
  const random = seededRandom(3);
  for (let i = 0; i < noisy.data.length; i++) {
    if (random() < 0.05) noisy.data[i] = random() < 0.5 ? 0 : 255;
  }

  const filtered = medianBlur(noisy, options.size);

  // A pixel still "wrong" if it's more than 40 levels from the clean image.
  const wrong = (m: Matrix<"u8">) =>
    m.data.filter((v, i) => Math.abs(v - clean.data[i]) > 40).length;
  const at = (m: Matrix<"u8">, x: number, y: number) => m.data[y * m.width + x];

  return {
    images: [
      { label: "With specks", image: noisy },
      { label: `Median ${options.size} x ${options.size}`, image: filtered },
    ],
    values: {
      wrongBefore: round(wrong(noisy) / noisy.data.length, 4),
      wrongAfter: round(wrong(filtered) / noisy.data.length, 4),
      // The red rectangle's left edge (column 24) stays a sharp step.
      edgeStep: Math.abs(at(filtered, 23, 60) - at(filtered, 24, 60)),
    },
  };
}
