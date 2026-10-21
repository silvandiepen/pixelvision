import { boxBlur, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { countSharpSteps, mean, valueAt } from "../../utils/stats";
import type { BoxBlurDemoOptions } from "./demo.model";

/**
 * Averages every pixel with its neighbours in a square window.
 *
 * @param input - The image and the window radius.
 * @returns The blurred image.
 */
export function demo({ image, options }: DemoInput<BoxBlurDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const blurred = boxBlur(gray, { radius: options.radius });

  return {
    images: [
      { label: "Gray", image: gray },
      { label: `Box blur, ${2 * options.radius + 1} x ${2 * options.radius + 1}`, image: blurred },
    ],
    values: {
      sharpRatio: round(countSharpSteps(blurred, 60) / countSharpSteps(gray, 60), 3),
      meanShift: round(Math.abs(mean(blurred) - mean(gray)), 3),
      // The middle of the red rectangle is flat, so its average is unchanged.
      flatAreaValue: valueAt(blurred, 72, 60),
    },
  };
}
