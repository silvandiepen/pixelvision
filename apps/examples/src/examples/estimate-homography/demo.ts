import { estimateHomography, transformPoint } from "pixelvision";
import type { DemoOutput, OptionsInput, Segment } from "../example.model";
import { round } from "../../utils/format";
import { maxDifference } from "../../utils/stats";
import { blankImage } from "../../utils/visualize";
import { seededRandom } from "../../samples/random";
import type { EstimateHomographyDemoOptions } from "./demo.model";

/**
 * Builds point pairs from a known perspective transform, replaces a share of
 * them with random wrong matches, and recovers the transform.
 *
 * @param input - Share of outliers, method and inlier threshold.
 * @returns The pairs (inliers and outliers) and how close the estimate is.
 */
export function demo({ options }: OptionsInput<EstimateHomographyDemoOptions>): DemoOutput {
  const random = seededRandom(42);
  // A perspective transform: rotate, scale, shift, and lean back.
  const truth = [0.8, -0.2, 90, 0.15, 0.75, 30, 0.0006, 0.0004, 1];

  const from = Array.from({ length: 50 }, () => ({ x: random() * 200, y: random() * 200 }));
  const outliers = Math.round(from.length * options.outlierShare);
  const to = from.map((p, i) =>
    i < outliers ? { x: random() * 320, y: random() * 240 } : transformPoint(truth, p),
  );

  const result = estimateHomography(from, to, {
    method: options.method,
    threshold: options.threshold,
    random: seededRandom(7),
  });
  if (!result) throw new Error("No model could be fitted to these points.");

  const lines: Segment[] = from.map((p, i) => ({ from: p, to: to[i] }));
  return {
    images: [
      {
        label: "Pairs: dots are inliers the estimate agrees with",
        image: blankImage(320, 240),
        overlay: { lines, points: to.filter((_, i) => result.inliers[i]) },
      },
    ],
    values: {
      inlierCount: result.inlierCount,
      trueInliers: from.length - outliers,
      modelError: round(maxDifference(result.model, truth), 9),
    },
  };
}
