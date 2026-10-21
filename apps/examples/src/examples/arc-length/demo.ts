import { arcLength, findContours, grayscale, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { contourThrough } from "../../utils/points";
import { SHAPES_TRIANGLE } from "../../samples/samples";

/**
 * Measures the triangle's perimeter from its corners and from its traced
 * outline, and the length of the open path along two of its sides.
 *
 * @param input - The image.
 * @returns The lengths.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const exact = arcLength(SHAPES_TRIANGLE);
  const open = arcLength(SHAPES_TRIANGLE, false); // without the closing edge

  const contours = findContours(threshold(grayscale(image), { invert: true }), { minPixels: 50 });
  const traced = contourThrough(contours, SHAPES_TRIANGLE, 3);
  const tracedLength = traced ? arcLength(traced) : 0;

  return {
    images: [{ label: "Traced outline", image, overlay: { polygons: traced ? [traced] : [] } }],
    tables: [
      {
        label: "Length (px)",
        columns: ["Closed, corners", "Open, corners", "Closed, traced"],
        rows: [[round(exact, 2), round(open, 2), round(tracedLength, 1)]],
      },
    ],
    values: {
      exact: round(exact, 2),
      open: round(open, 2),
      tracedShare: round(tracedLength / exact, 3),
    },
  };
}
