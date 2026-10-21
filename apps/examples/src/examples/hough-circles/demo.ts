import { gaussianBlur, grayscale, houghCircles } from "pixelvision";
import type { Point } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import type { HoughCirclesDemoOptions } from "./demo.model";

/**
 * Points on a circle, for drawing it as a polygon.
 *
 * @param x - Centre column.
 * @param y - Centre row.
 * @param radius - Radius.
 * @returns 48 points around the circle.
 */
function outline(x: number, y: number, radius: number): Point[] {
  return Array.from({ length: 48 }, (_, i) => ({
    x: x + radius * Math.cos((i * Math.PI) / 24),
    y: y + radius * Math.sin((i * Math.PI) / 24),
  }));
}

/**
 * Finds circles in the blurred gray image.
 *
 * @param input - The image, accumulator resolution, vote threshold and radius range.
 * @returns The image with the circles drawn over it, and the circles.
 */
export function demo({ image, options }: DemoInput<HoughCirclesDemoOptions>): DemoOutput {
  const gray = gaussianBlur(grayscale(image), { kernelSize: 5 });
  const circles = houghCircles(gray, {
    dp: options.dp,
    minDist: 40,
    cannyThreshold: 100,
    accumulatorThreshold: options.accumulatorThreshold,
    minRadius: options.minRadius,
    maxRadius: options.maxRadius,
  });

  // The green circle was drawn around (220, 70) with radius 44, measured
  // from pixel corners; pixel x spans x to x + 1, so in pixel coordinates
  // its centre is (219.5, 69.5).
  const strongest = circles[0];
  return {
    images: [
      {
        label: "Circles found",
        image: gray,
        overlay: {
          polygons: circles.map(({ x, y, radius }) => outline(x, y, radius)),
          points: circles.map(({ x, y }) => ({ x, y })),
        },
      },
    ],
    tables: [
      {
        label: "Circles, strongest first",
        columns: ["centre", "radius (px)", "votes"],
        rows: circles.map(({ x, y, radius, votes }) => [`${x}, ${y}`, round(radius, 2), votes]),
      },
    ],
    values: {
      circleCount: circles.length,
      centreError: strongest ? round(Math.hypot(strongest.x - 219.5, strongest.y - 69.5), 3) : -1,
      radius: strongest ? round(strongest.radius, 2) : 0,
    },
  };
}
