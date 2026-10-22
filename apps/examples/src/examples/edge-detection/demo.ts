import { canny, gaussianBlur, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countNonZero, valueAt } from "../../utils/stats";
import { PHOTO_CARD_CORNERS } from "../../samples/samples";
import type { EdgeDetectionDemoOptions } from "./demo.model";

/**
 * Gray → blur → Canny.
 *
 * @param input - The image, blur kernel size and Canny thresholds.
 * @returns Every stage.
 */
export function demo({ image, options }: DemoInput<EdgeDetectionDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const blurred = gaussianBlur(gray, { kernelSize: options.kernelSize });
  const edges = canny(blurred, { low: options.low, high: options.high });

  // Check the middle of each side of the card in the card photo for an edge.
  const cardSidesFound = PHOTO_CARD_CORNERS.filter((corner, i) => {
    const next = PHOTO_CARD_CORNERS[(i + 1) % 4];
    const cx = Math.round((corner.x + next.x) / 2);
    const cy = Math.round((corner.y + next.y) / 2);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) if (valueAt(edges, cx + dx, cy + dy)) return true;
    }
    return false;
  }).length;

  return {
    images: [
      { label: "1. Gray", image: gray },
      { label: "2. Blurred", image: blurred },
      { label: "3. Edges", image: edges },
    ],
    values: { edgePixels: countNonZero(edges), cardSidesFound },
  };
}
