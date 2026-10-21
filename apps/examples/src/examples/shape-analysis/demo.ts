import {
  boundingRect,
  contourArea,
  convexHull,
  findContours,
  grayscale,
  minAreaRect,
  moments,
  threshold,
} from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { rectPolygon } from "../../utils/geometry";

/**
 * Finds every dark shape and measures it: upright box, rotated box,
 * convex hull, centre, area and solidity.
 *
 * @param input - The image.
 * @returns The measurements drawn over the image, and as a table.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const mask = threshold(grayscale(image), { invert: true }); // dark shapes become white
  const contours = findContours(mask, { minPixels: 50 });

  const shapes = contours.map((contour) => {
    const m = moments(contour);
    const hull = convexHull(contour);
    return {
      box: boundingRect(contour),
      rotated: minAreaRect(contour),
      hull,
      centre: { x: m.m10 / m.m00, y: m.m01 / m.m00 },
      area: m.m00,
      // How much of its hull the shape fills: 1 for convex shapes.
      solidity: m.m00 / Math.abs(contourArea(hull)),
    };
  });

  const square = shapes.find((s) => Math.hypot(s.centre.x - 252, s.centre.y - 172) < 3);
  return {
    images: [
      {
        label: "Upright boxes and centres",
        image,
        overlay: {
          polygons: shapes.map((s) => rectPolygon(s.box)),
          points: shapes.map((s) => s.centre),
        },
      },
      {
        label: "Rotated boxes and hulls",
        image,
        overlay: { polygons: shapes.flatMap((s) => [s.rotated.corners, s.hull]) },
      },
    ],
    tables: [
      {
        label: "Shapes",
        columns: ["#", "centre", "area", "box", "rotated", "solidity"],
        rows: shapes.map((s, i) => [
          i,
          `(${round(s.centre.x, 1)}, ${round(s.centre.y, 1)})`,
          round(s.area, 0),
          `${s.box.width} x ${s.box.height}`,
          `${round(s.rotated.width, 1)} x ${round(s.rotated.height, 1)} at ${round(s.rotated.angle, 1)}°`,
          round(s.solidity, 3),
        ]),
      },
    ],
    values: {
      count: shapes.length,
      squareAngle: round((((square?.rotated.angle ?? 0) % 90) + 90) % 90, 1),
      leastSolid: round(Math.min(...shapes.map((s) => s.solidity)), 3),
      rectangleCentre: shapes[0] ? `${shapes[0].centre.x},${shapes[0].centre.y}` : "",
    },
  };
}
