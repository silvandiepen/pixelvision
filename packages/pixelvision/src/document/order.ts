import type { Point } from "../math/transforms.model";
import type { Quad } from "./document.model";

/**
 * Puts four corners in reading order: top-left, top-right, bottom-right,
 * bottom-left (clockwise, starting at the corner nearest the origin).
 *
 * @param points - Four corners in any order.
 * @returns The ordered corners.
 */
export const orderCorners = (points: readonly Point[]): Quad => {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
  const clockwise = [...points].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
  );
  let start = 0;
  clockwise.forEach((p, i) => {
    if (p.x + p.y < clockwise[start].x + clockwise[start].y) start = i;
  });
  return [0, 1, 2, 3].map((k) => clockwise[(start + k) % 4]) as Quad;
};
