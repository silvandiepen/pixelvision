import { boundingRect, findContours, grayscale, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { rectPolygon } from "../../utils/geometry";

/**
 * Outlines every dark shape and puts an upright box round each.
 *
 * @param input - The image.
 * @returns The boxes over the image, and a table of them.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const mask = threshold(grayscale(image), { invert: true }); // dark shapes become white
  const contours = findContours(mask, { minPixels: 50 });
  const boxes = contours.map((contour) => boundingRect(contour));

  // The rotated square is the shape whose box contains its drawn centre (252, 172).
  const square = boxes.find(
    (b) => b.x < 252 && b.x + b.width > 252 && b.y < 172 && b.y + b.height > 172,
  );

  return {
    images: [
      { label: `${boxes.length} boxes`, image, overlay: { polygons: boxes.map(rectPolygon) } },
    ],
    tables: [
      {
        label: "Boxes",
        columns: ["#", "x", "y", "width", "height"],
        rows: boxes.map((b, i) => [i, b.x, b.y, b.width, b.height]),
      },
    ],
    values: {
      count: boxes.length,
      rectangle: boxes[0] ? `${boxes[0].x},${boxes[0].y},${boxes[0].width},${boxes[0].height}` : "",
      squareWidth: square?.width ?? 0,
    },
  };
}
