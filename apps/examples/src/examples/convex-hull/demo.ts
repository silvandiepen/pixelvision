import { contourArea, convexHull } from "pixelvision";
import type { Point } from "pixelvision";
import type { OptionsInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { blankImage } from "../../utils/visualize";
import type { ConvexHullDemoOptions } from "./demo.model";

/**
 * Draws a star and wraps it in its convex hull.
 *
 * @param input - Number of tips, and the inner radius as a share of the outer one.
 * @returns The star and its hull.
 */
export function demo({ options }: OptionsInput<ConvexHullDemoOptions>): DemoOutput {
  const center = { x: 160, y: 124 };
  const star: Point[] = [];
  for (let i = 0; i < options.tips * 2; i++) {
    const radius = i % 2 ? 100 * options.inner : 100;
    const angle = (i * Math.PI) / options.tips - Math.PI / 2;
    star.push({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
  }

  const hull = convexHull(star);
  // Solidity: how much of its hull a shape fills (1 for a convex shape).
  const solidity = Math.abs(contourArea(star)) / Math.abs(contourArea(hull));

  return {
    images: [
      { label: "Star", image: blankImage(320, 240), overlay: { polygons: [star] } },
      {
        label: `Hull, ${hull.length} corners`,
        image: blankImage(320, 240),
        overlay: { polygons: [star, hull], points: hull },
      },
    ],
    tables: [
      { label: "Hull", columns: ["x", "y"], rows: hull.map((p) => [round(p.x, 1), round(p.y, 1)]) },
    ],
    values: {
      corners: hull.length,
      // Positive area: clockwise on screen.
      clockwise: contourArea(hull) > 0,
      startsAtTop: hull[0] === star[0],
      solidity: round(solidity, 3),
    },
  };
}
