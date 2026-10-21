import { canny, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countNonZero, valueAt } from "../../utils/stats";
import type { CannyDemoOptions } from "./demo.model";

/**
 * Finds edges in the gray image.
 *
 * @param input - The image and the hysteresis thresholds.
 * @returns The edge map: white on edges.
 */
export function demo({ image, options }: DemoInput<CannyDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const edges = canny(gray, { low: options.low, high: options.high });

  // Is the left side of the red rectangle (x = 24, rows 24–95) found?
  let leftSideRows = 0;
  for (let y = 30; y < 90; y++) {
    if (valueAt(edges, 23, y) || valueAt(edges, 24, y) || valueAt(edges, 25, y)) leftSideRows++;
  }

  return {
    images: [{ label: "Edges", image: edges }],
    values: {
      edgePixels: countNonZero(edges),
      leftSideRows,
      onlyBlackAndWhite: edges.data.every((value) => value === 0 || value === 255),
    },
  };
}
