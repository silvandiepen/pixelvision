import { contourArea, findContours, grayscale, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { contourThrough } from "../../utils/points";
import { SHAPES_TRIANGLE } from "../../samples/samples";

/**
 * Measures the triangle of the shapes sample twice: from its drawn corners,
 * and from the outline traced in the image.
 *
 * @param input - The image.
 * @returns Both areas.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const exact = contourArea(SHAPES_TRIANGLE);

  const contours = findContours(threshold(grayscale(image), { invert: true }), { minPixels: 50 });
  const traced = contourThrough(contours, SHAPES_TRIANGLE, 3);
  const tracedArea = traced ? contourArea(traced) : 0;

  return {
    images: [{ label: "Traced outline", image, overlay: { polygons: traced ? [traced] : [] } }],
    tables: [
      {
        label: "Area (px²)",
        columns: ["From the corners", "From the traced outline"],
        rows: [[exact, round(tracedArea, 1)]],
      },
    ],
    values: { exact, tracedShare: round(tracedArea / exact, 3) },
  };
}
