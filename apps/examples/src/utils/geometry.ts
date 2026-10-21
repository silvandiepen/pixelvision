import type { Point } from "pixelvision";
import type { NormalLine } from "./geometry.model";

/**
 * Computes the normal form of the line through two points, as `houghLines`
 * reports lines.
 *
 * @param a - First point.
 * @param b - Second point, different from `a`.
 * @returns `rho` and `theta` with `theta` in `[0, π)`.
 */
export function lineThrough(a: Point, b: Point): NormalLine {
  let theta = Math.atan2(b.x - a.x, -(b.y - a.y));
  if (theta < 0) theta += Math.PI;
  if (theta >= Math.PI) theta -= Math.PI;
  return { rho: a.x * Math.cos(theta) + a.y * Math.sin(theta), theta };
}

/**
 * Tells whether two lines in normal form are the same within tolerances,
 * treating `(ρ, θ)` and `(-ρ, θ ± π)` as the same line.
 *
 * @param a - First line.
 * @param b - Second line.
 * @param rhoTolerance - Largest distance difference in pixels.
 * @param thetaTolerance - Largest angle difference in radians.
 * @returns `true` when they match.
 */
export function sameLine(
  a: NormalLine,
  b: NormalLine,
  rhoTolerance: number,
  thetaTolerance: number,
): boolean {
  const direct = Math.abs(a.theta - b.theta);
  if (direct <= thetaTolerance && Math.abs(a.rho - b.rho) <= rhoTolerance) return true;
  const wrapped = Math.PI - direct;
  return wrapped <= thetaTolerance && Math.abs(a.rho + b.rho) <= rhoTolerance;
}

/**
 * Lays out four corners of a `width x height` rectangle in the order the
 * perspective examples use: top-left, top-right, bottom-right, bottom-left.
 *
 * @param width - Rectangle width.
 * @param height - Rectangle height.
 * @returns The corners.
 */
export function rectangleCorners(width: number, height: number): Point[] {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
}

/**
 * Converts the rows of a points control (`[x, y]` per row) to points.
 *
 * @param rows - Rows of two numbers.
 * @returns The points.
 */
export function rowsToPoints(rows: readonly (readonly number[])[]): Point[] {
  return rows.map(([x, y]) => ({ x, y }));
}
