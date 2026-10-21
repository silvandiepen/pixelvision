import { inRange, rgbToHsv } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countNonZero, valueAt } from "../../utils/stats";
import type { InRangeDemoOptions } from "./demo.model";

/**
 * Picks the pixels whose hue lies in a range, at any brightness.
 *
 * @param input - The image, the hue range (0–179) and the least saturation.
 * @returns The mask of matching pixels.
 */
export function demo({ image, options }: DemoInput<InRangeDemoOptions>): DemoOutput {
  const hsv = rgbToHsv(image);
  const mask = inRange(
    hsv,
    [options.hueFrom, options.minSaturation, 40],
    [options.hueTo, 255, 255],
  );

  return {
    images: [{ label: `Hue ${options.hueFrom}–${options.hueTo}`, image: mask }],
    values: {
      selected: countNonZero(mask),
      circleCentre: valueAt(mask, 220, 70),
      redRectangle: valueAt(mask, 60, 60),
      background: valueAt(mask, 300, 10),
    },
  };
}
