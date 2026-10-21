import { affineTransform, transformPoint } from "pixelvision";
import type { DemoOutput, OptionsInput, Segment } from "../example.model";
import { roundRows, toRows } from "../../utils/format";
import { rowsToPoints } from "../../utils/geometry";
import { blankImage } from "../../utils/visualize";
import type { AffineTransformDemoOptions } from "./demo.model";

/**
 * Computes the affine transform that maps three points onto three others,
 * and draws the source triangle's grid mapped onto the target.
 *
 * @param input - The three source and three target points.
 * @returns The 3x3 matrix and how closely it maps the points.
 */
export function demo({ options }: OptionsInput<AffineTransformDemoOptions>): DemoOutput {
  const from = rowsToPoints(options.from);
  const to = rowsToPoints(options.to);
  const transform = affineTransform(from, to);

  const mapped = from.map((point) => transformPoint(transform, point));
  const maxError = Math.max(...mapped.map((p, i) => Math.hypot(p.x - to[i].x, p.y - to[i].y)));

  // Lines parallel to the triangle's two sides from its first corner, mapped.
  const grid: Segment[] = [];
  const along = (a: number, b: number) => ({
    x: from[0].x + (from[1].x - from[0].x) * a + (from[2].x - from[0].x) * b,
    y: from[0].y + (from[1].y - from[0].y) * a + (from[2].y - from[0].y) * b,
  });
  for (let t = 0; t <= 1; t += 0.25) {
    grid.push({
      from: transformPoint(transform, along(t, 0)),
      to: transformPoint(transform, along(t, 1)),
    });
    grid.push({
      from: transformPoint(transform, along(0, t)),
      to: transformPoint(transform, along(1, t)),
    });
  }

  return {
    images: [
      {
        label: "Source triangle, and its grid mapped onto the target",
        image: blankImage(320, 240),
        overlay: { polygons: [from], lines: grid, points: to },
      },
    ],
    tables: [{ label: "Transform (row by row)", rows: roundRows(toRows(transform, 3), 6) }],
    values: {
      maxError,
      lastRow: Array.from(transform.subarray(6)).join(","),
    },
  };
}
