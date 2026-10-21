import { approxPolygon, arcLength, findContours, grayscale, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { nearestDistance } from "../../utils/points";
import { SHAPES_TRIANGLE } from "../../samples/samples";
import type { ApproxPolygonDemoOptions } from "./demo.model";

/**
 * Simplifies every traced outline to a polygon.
 *
 * @param input - The image and the tolerance as a share of each outline's length.
 * @returns The polygons drawn over the image.
 */
export function demo({ image, options }: DemoInput<ApproxPolygonDemoOptions>): DemoOutput {
  const contours = findContours(threshold(grayscale(image), { invert: true }), { minPixels: 50 });
  const polygons = contours.map((contour) =>
    approxPolygon(contour, options.tolerance * arcLength(contour)),
  );

  // The polygon of the triangle: the one with a corner near the apex.
  const triangle =
    polygons.find((polygon) => nearestDistance(SHAPES_TRIANGLE[1], polygon) < 5) ?? [];
  const cornerError = Math.max(
    ...SHAPES_TRIANGLE.map((corner) => nearestDistance(corner, triangle)),
  );

  return {
    images: [
      { label: "Simplified outlines", image, overlay: { polygons, points: polygons.flat() } },
    ],
    tables: [
      {
        label: "Corners per shape",
        columns: ["outline points", "polygon corners"],
        rows: contours.map((contour, i) => [contour.length, polygons[i].length]),
      },
    ],
    values: {
      corners: polygons.map((polygon) => polygon.length).join(","),
      triangleCornerError: round(cornerError, 2),
    },
  };
}
