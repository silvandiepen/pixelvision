import { erode, grayscale, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countNonZero } from "../../utils/stats";
import type { ErodeDemoOptions } from "./demo.model";

/**
 * Shrinks the dark shapes of the image, as a white-on-black mask.
 *
 * @param input - The image, the neighbourhood radius and the iterations.
 * @returns The mask before and after.
 */
export function demo({ image, options }: DemoInput<ErodeDemoOptions>): DemoOutput {
  const mask = threshold(grayscale(image), { invert: true }); // shapes white
  const thin = erode(mask, { radius: options.radius, iterations: options.iterations });

  // The red rectangle is 96 x 72 pixels; count what is left of it.
  let rectangle = 0;
  for (let y = 24; y < 96; y++)
    for (let x = 24; x < 120; x++) if (thin.data[y * thin.width + x]) rectangle++;

  return {
    images: [
      { label: "Mask", image: mask },
      { label: "Eroded", image: thin },
    ],
    values: {
      rectanglePixels: rectangle,
      // Erosion only removes: nothing is set that wasn't before.
      onlyRemoves: thin.data.every((value, i) => value === 0 || mask.data[i] === 255),
      shrunk: countNonZero(thin) < countNonZero(mask),
    },
  };
}
