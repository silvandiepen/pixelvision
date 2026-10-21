import { detectYape, gaussianBlur, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countFound } from "../../utils/points";
import { DESK_CARD_CORNERS } from "../../samples/samples";
import type { DetectYapeDemoOptions } from "./demo.model";

/**
 * Finds keypoints with YAPE.
 *
 * @param input - The image, the circle radius and the similarity tolerance.
 * @returns The image with the keypoints.
 */
export function demo({ image, options }: DemoInput<DetectYapeDemoOptions>): DemoOutput {
  const gray = gaussianBlur(grayscale(image), { kernelSize: 5 });
  const points = detectYape(gray, { radius: options.radius, tau: options.tau });

  return {
    images: [{ label: `${points.length} keypoints`, image, overlay: { points } }],
    values: {
      pointCount: points.length,
      // The card's corners in the desk sample, each within 4 pixels.
      cardCornersFound: countFound(DESK_CARD_CORNERS, points, 4),
    },
  };
}
