import { detectFast, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { shareInside } from "../../utils/points";
import { PHOTO_CARD_CORNERS } from "../../samples/samples";
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
      // On the card (its lettering and edges), not the wood grain.
      onCardShare: shareInside(PHOTO_CARD_CORNERS, corners),
      allScored: corners.every((corner) => corner.score > 0),
    },
  };
}
