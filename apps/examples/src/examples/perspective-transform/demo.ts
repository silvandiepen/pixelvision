import { perspectiveTransform, transformPoint } from "pixelvision";
import type { DemoOutput, OptionsInput, Segment } from "../example.model";
import { round, roundRows, toRows } from "../../utils/format";
import { rowsToPoints } from "../../utils/geometry";
import { blankImage } from "../../utils/visualize";
import type { PerspectiveTransformDemoOptions } from "./demo.model";

/**
 * Computes the homography that maps four points onto four others, and
 * draws a grid from the first quadrilateral mapped onto the second.
 *
 * @param input - The four source and four target points.
 * @returns The 3x3 matrix and how closely it maps the points.
 */
export function demo({ options }: OptionsInput<PerspectiveTransformDemoOptions>): DemoOutput {
  const from = rowsToPoints(options.from);
  const to = rowsToPoints(options.to);
  const transform = perspectiveTransform(from, to);

  const mapped = from.map((point) => transformPoint(transform, point));
  const maxError = Math.max(...mapped.map((p, i) => Math.hypot(p.x - to[i].x, p.y - to[i].y)));

  // Grid lines of the source quadrilateral, mapped through the transform.
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const grid: Segment[] = [];
  for (let t = 0; t <= 1; t += 0.25) {
    const top = { x: lerp(from[0].x, from[1].x, t), y: lerp(from[0].y, from[1].y, t) };
    const bottom = { x: lerp(from[3].x, from[2].x, t), y: lerp(from[3].y, from[2].y, t) };
    const left = { x: lerp(from[0].x, from[3].x, t), y: lerp(from[0].y, from[3].y, t) };
    const right = { x: lerp(from[1].x, from[2].x, t), y: lerp(from[1].y, from[2].y, t) };
    grid.push({ from: transformPoint(transform, top), to: transformPoint(transform, bottom) });
    grid.push({ from: transformPoint(transform, left), to: transformPoint(transform, right) });
  }

  return {
    images: [
      {
        label: "Source quadrilateral, and its grid mapped onto the target",
        image: blankImage(320, 240),
        overlay: { polygons: [from], lines: grid, points: to },
      },
    ],
    tables: [
      { label: "Transform (row by row)", rows: roundRows(toRows(transform, 3), 6) },
      {
        label: "Source points mapped through it",
        columns: ["from", "mapped", "target"],
        rows: from.map((p, i) => [
          `(${p.x}, ${p.y})`,
          `(${round(mapped[i].x, 3)}, ${round(mapped[i].y, 3)})`,
          `(${to[i].x}, ${to[i].y})`,
        ]),
      },
    ],
    values: { maxError, h22: round(transform[8], 6) },
  };
}
