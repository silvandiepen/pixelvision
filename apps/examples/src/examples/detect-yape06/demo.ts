import { detectYape06, gaussianBlur, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { shareInside } from "../../utils/points";
import { PHOTO_CARD_CORNERS } from "../../samples/samples";
import type { DetectYape06DemoOptions } from "./demo.model";

/**
 * Finds blob-like keypoints with YAPE06.
 *
 * @param input - The image and the two thresholds.
 * @returns The image with the keypoints.
 */
export function demo({ image, options }: DemoInput<DetectYape06DemoOptions>): DemoOutput {
  const gray = gaussianBlur(grayscale(image), { kernelSize: 5 });
  const points = detectYape06(gray, {
    laplacianThreshold: options.laplacianThreshold,
    minEigenvalueThreshold: options.minEigenvalueThreshold,
  });

  return {
    images: [{ label: `${points.length} keypoints`, image, overlay: { points } }],
    values: {
      pointCount: points.length,
      // On the card (its lettering and edges), not the wood grain.
      onCardShare: shareInside(PHOTO_CARD_CORNERS, points),
      // The border is at least 5 pixels, so the 5-pixel Laplacian stays inside.
      insideBorder: points.every(
        (p) => p.x >= 5 && p.y >= 5 && p.x < gray.width - 5 && p.y < gray.height - 5,
      ),
    },
  };
}
