import { findContours, grayscale, moments, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { contourThrough } from "../../utils/points";
import { SHAPES_TRIANGLE } from "../../samples/samples";

/**
 * Measures the triangle of the shapes sample from its moments: area,
 * centroid and orientation, from its drawn corners and from its traced
 * outline.
 *
 * @param input - The image.
 * @returns The moments and what follows from them.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const contours = findContours(threshold(grayscale(image), { invert: true }), { minPixels: 50 });
  const traced = contourThrough(contours, SHAPES_TRIANGLE, 3) ?? [];

  const exact = moments(SHAPES_TRIANGLE);
  const measured = moments(traced);
  const centroid = (m: typeof exact) => ({ x: m.m10 / m.m00, y: m.m01 / m.m00 });
  // The main axis: 0° for a shape that's widest horizontally.
  const orientation = (m: typeof exact) =>
    (0.5 * Math.atan2(2 * m.mu11, m.mu20 - m.mu02) * 180) / Math.PI;

  const row = (label: string, m: typeof exact) => [
    label,
    round(m.m00, 1),
    `(${round(centroid(m).x, 2)}, ${round(centroid(m).y, 2)})`,
    round(orientation(m), 2),
    round(m.nu20, 5),
    round(m.nu02, 5),
  ];

  return {
    images: [
      {
        label: "Traced outline and centroid",
        image,
        overlay: { polygons: [traced], points: [centroid(measured)] },
      },
    ],
    tables: [
      {
        label: "Moments",
        columns: ["From", "area (m00)", "centroid", "orientation (°)", "nu20", "nu02"],
        rows: [row("Drawn corners", exact), row("Traced outline", measured)],
      },
    ],
    values: {
      area: exact.m00,
      centroidX: round(centroid(exact).x, 2),
      centroidY: round(centroid(exact).y, 2),
      orientation: round(orientation(exact), 2),
      tracedOffset: round(
        Math.hypot(centroid(measured).x - 110, centroid(measured).y - centroid(exact).y),
        2,
      ),
    },
  };
}
