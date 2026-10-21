import { findContours, grayscale, minAreaRect, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";

/**
 * Fits the tightest rotated rectangle round every dark shape.
 *
 * @param input - The image.
 * @returns The rectangles over the image, and their sizes and angles.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const mask = threshold(grayscale(image), { invert: true }); // dark shapes become white
  const contours = findContours(mask, { minPixels: 50 });
  const boxes = contours.map((contour) => minAreaRect(contour));

  // The dark square was drawn round (252, 172), turned 20°.
  const square = boxes.find((b) => Math.hypot(b.center.x - 252, b.center.y - 172) < 3);
  // A rectangle turned 20° is the same as one turned 110°: compare the angle modulo 90°.
  const squareAngle = square ? ((square.angle % 90) + 90) % 90 : 0;

  return {
    images: [{ label: "Rotated boxes", image, overlay: { polygons: boxes.map((b) => b.corners) } }],
    tables: [
      {
        label: "Boxes",
        columns: ["#", "centre", "width", "height", "angle (°)"],
        rows: boxes.map((b, i) => [
          i,
          `(${round(b.center.x, 1)}, ${round(b.center.y, 1)})`,
          round(b.width, 1),
          round(b.height, 1),
          round(b.angle, 1),
        ]),
      },
    ],
    values: {
      squareAngle: round(squareAngle, 2),
      squareSide: round(square?.width ?? 0, 2),
      rectangleAngle: round(Math.abs(boxes[0]?.angle ?? -1), 2),
    },
  };
}
