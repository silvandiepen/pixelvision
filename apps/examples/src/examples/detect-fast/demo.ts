import { detectFast, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countFound } from "../../utils/points";
import { DESK_CARD_CORNERS } from "../../samples/samples";
import type { DetectFastDemoOptions } from "./demo.model";

/**
 * Finds FAST corners and marks them on the image.
 *
 * @param input - The image and the brightness threshold.
 * @returns The image with the corners.
 */
export function demo({ image, options }: DemoInput<DetectFastDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const corners = detectFast(gray, { threshold: options.threshold });

  return {
    images: [{ label: `${corners.length} corners`, image, overlay: { points: corners } }],
    values: {
      cornerCount: corners.length,
      // The card's four corners in the desk sample, each within 3 pixels.
      cardCornersFound: countFound(DESK_CARD_CORNERS, corners, 3),
      allScored: corners.every((corner) => corner.score > 0),
    },
  };
}
