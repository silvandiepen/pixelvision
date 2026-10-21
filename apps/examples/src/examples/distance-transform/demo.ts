import { distanceTransform, grayscale, minMaxLoc, threshold } from "pixelvision";
import type { DistanceMetric } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { normalizeToGray } from "../../utils/visualize";
import { valueAt } from "../../utils/stats";
import type { DistanceTransformDemoOptions } from "./demo.model";

/**
 * Measures how far every shape pixel is from the background.
 *
 * @param input - The image and the metric ("l2-5", "l2-3", "l1" or "c").
 * @returns The mask, the distances, and the deepest point.
 */
export function demo({ image, options }: DemoInput<DistanceTransformDemoOptions>): DemoOutput {
  const shapes = threshold(grayscale(image), { invert: true }); // shapes white, background 0
  const [metric, mask] = options.metric.split("-");
  const distance = distanceTransform(shapes, {
    metric: metric as DistanceMetric,
    maskSize: mask === "3" ? 3 : 5,
  });
  const { max, maxLoc } = minMaxLoc(distance);

  return {
    images: [
      { label: "Shapes", image: shapes },
      {
        label: "Distance to the background",
        image: normalizeToGray(distance.data, distance.width, distance.height),
        overlay: { points: [maxLoc] },
      },
    ],
    values: {
      circleCentre: round(valueAt(distance, 220, 70), 3),
      rectangleCentre: round(valueAt(distance, 72, 60), 3),
      deepest: round(max, 3),
      deepestFromCircleCentre: round(Math.hypot(maxLoc.x - 220, maxLoc.y - 70), 2),
    },
  };
}
