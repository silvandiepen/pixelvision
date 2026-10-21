import { isConvex } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { rowsToPoints } from "../../utils/geometry";
import { blankImage } from "../../utils/visualize";
import type { IsConvexDemoOptions } from "./demo.model";

/**
 * Tests whether a polygon is convex, and again without its last corner.
 *
 * @param input - The polygon's corners, one `[x, y]` per row.
 * @returns The polygon drawn, and both answers.
 */
export function demo({ options }: OptionsInput<IsConvexDemoOptions>): DemoOutput {
  const polygon = rowsToPoints(options.polygon);
  const withoutLast = polygon.slice(0, -1);

  return {
    images: [
      {
        label: isConvex(polygon) ? "Convex" : "Not convex",
        image: blankImage(320, 240),
        overlay: { polygons: [polygon], points: polygon },
      },
    ],
    values: {
      convex: isConvex(polygon),
      convexWithoutLast: withoutLast.length >= 3 && isConvex(withoutLast),
    },
  };
}
