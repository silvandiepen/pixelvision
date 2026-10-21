import { grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { mean, valueAt } from "../../utils/stats";
import type { GrayscaleDemoOptions } from "./demo.model";

/**
 * Converts the image to gray.
 *
 * @param input - The image and its channel order.
 * @returns The gray image.
 */
export function demo({ image, options }: DemoInput<GrayscaleDemoOptions>): DemoOutput {
  const gray = grayscale(image, { order: options.order });

  return {
    images: [{ label: "Gray", image: gray }],
    values: {
      channels: gray.channels,
      // Inside the red rectangle of the shapes sample: pure red, (255, 0, 0).
      grayOfRed: valueAt(gray, 72, 60),
      meanGray: Math.round(mean(gray)),
    },
  };
}
