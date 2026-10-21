import { buildPyramid, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { BuildPyramidDemoOptions } from "./demo.model";

/**
 * Builds an image pyramid from the gray image.
 *
 * @param input - The image and the number of levels.
 * @returns Every level, largest first.
 */
export function demo({ image, options }: DemoInput<BuildPyramidDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const pyramid = buildPyramid(gray, options.levels);

  return {
    images: pyramid.map((level, i) => ({
      label: `Level ${i}: ${level.width} x ${level.height}`,
      image: level,
    })),
    values: {
      levels: pyramid.length,
      sizes: pyramid.map((level) => `${level.width}x${level.height}`).join(","),
      levelZeroIsInput: pyramid[0] === gray,
    },
  };
}
