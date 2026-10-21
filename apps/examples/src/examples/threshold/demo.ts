import { grayscale, otsuLevel, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { valueAt } from "../../utils/stats";
import type { ThresholdDemoOptions } from "./demo.model";

/**
 * Turns the gray image into black and white.
 *
 * @param input - The image, the level (0 = automatic, Otsu) and inversion.
 * @returns The binary image.
 */
export function demo({ image, options }: DemoInput<ThresholdDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const level = options.level > 0 ? options.level : otsuLevel(gray);
  const binary = threshold(gray, { level, invert: options.invert });

  return {
    images: [{ label: `Level ${level}${options.invert ? ", inverted" : ""}`, image: binary }],
    values: {
      level,
      // Inside the red rectangle (gray 76) and on the background (about 230).
      redRectangle: valueAt(binary, 72, 60),
      background: valueAt(binary, 300, 10),
      binary: binary.data.every((value) => value === 0 || value === 255),
    },
  };
}
