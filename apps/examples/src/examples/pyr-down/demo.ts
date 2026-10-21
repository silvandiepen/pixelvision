import { grayscale, pyrDown } from "pixelvision";
import type { DemoImage, DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { mean } from "../../utils/stats";
import type { PyrDownDemoOptions } from "./demo.model";

/**
 * Builds an image pyramid: each level is half the size of the one before.
 *
 * @param input - The image and the number of levels.
 * @returns Every level.
 */
export function demo({ image, options }: DemoInput<PyrDownDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const levels = [gray];
  for (let level = 1; level <= options.levels; level++) {
    levels.push(pyrDown(levels[level - 1]));
  }
  const smallest = levels[levels.length - 1];

  return {
    images: levels.map((matrix, level): DemoImage => ({
      label: `Level ${level}: ${matrix.width} x ${matrix.height}`,
      image: matrix,
    })),
    values: {
      width: smallest.width,
      height: smallest.height,
      meanShift: round(Math.abs(mean(smallest) - mean(gray)), 3),
    },
  };
}
