import { gaussianBlur, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { countSharpSteps, mean } from "../../utils/stats";
import type { GaussianBlurDemoOptions } from "./demo.model";

/**
 * Blurs the gray image with a Gaussian kernel.
 *
 * @param input - The image, kernel size and sigma (0 = derived from the size).
 * @returns The blurred image.
 */
export function demo({ image, options }: DemoInput<GaussianBlurDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const blurred = gaussianBlur(gray, {
    kernelSize: options.kernelSize,
    sigma: options.sigma > 0 ? options.sigma : undefined,
  });

  // Sharp steps: neighbouring pixels more than 60 apart.
  const sharpBefore = countSharpSteps(gray, 60);
  const sharpAfter = countSharpSteps(blurred, 60);

  return {
    images: [
      { label: "Gray", image: gray },
      { label: "Blurred", image: blurred },
    ],
    values: {
      sharpBefore,
      sharpAfter,
      sharpRatio: round(sharpAfter / sharpBefore, 3),
      meanShift: round(Math.abs(mean(blurred) - mean(gray)), 3),
    },
  };
}
