import type { Point } from "../math/transforms.model";

/**
 * Computes the area enclosed by a polygon (shoelace formula).
 *
 * @param polygon - Vertices in order; the last connects back to the first.
 * @returns The area, positive for clockwise order in image coordinates (y down).
 *
 * @example
 * contourArea([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }]); // 12
 */
export function contourArea(polygon: readonly Point[]): number {
  let twice = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    twice += polygon[j].x * polygon[i].y - polygon[i].x * polygon[j].y;
  }
  return twice / 2;
}

/**
 * Computes the length of a polygon's outline.
 *
 * @param polygon - Vertices in order.
 * @param closed - Include the edge from the last vertex back to the first (default `true`).
 * @returns The length in pixels.
 *
 * @example
 * arcLength([{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 4 }]); // 3 + 4 + 5 = 12
 */
export function arcLength(polygon: readonly Point[], closed = true): number {
  let length = 0;
  const edges = closed ? polygon.length : polygon.length - 1;
  for (let i = 0; i < edges; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    length += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return length;
}

/**
 * Distance from a point to the segment `a`–`b`.
 *
 * @param p - The point.
 * @param a - Segment start.
 * @param b - Segment end.
 * @returns The distance.
 */
const segmentDistance = (p: Point, a: Point, b: Point): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

/**
 * Douglas–Peucker on an open chain.
 *
 * @param points - Chain.
 * @param epsilon - Tolerance.
 * @returns Kept points (first and last included).
 */
const simplifyChain = (points: readonly Point[], epsilon: number): Point[] => {
  if (points.length <= 2) return [...points];
  const first = points[0];
  const last = points[points.length - 1];
  let index = 0;
  let max = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const d = segmentDistance(points[i], first, last);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max <= epsilon) return [first, last];
  const left = simplifyChain(points.slice(0, index + 1), epsilon);
  const right = simplifyChain(points.slice(index), epsilon);
  return [...left.slice(0, -1), ...right];
};

/**
 * Simplifies a closed outline to a polygon whose edges stay within
 * `epsilon` pixels of it (Douglas–Peucker, as OpenCV's `approxPolyDP`).
 * Use `epsilon` around 2% of {@link arcLength} to turn the contour of a
 * sheet of paper into its 4 corners.
 *
 * @param contour - Closed outline, e.g. from {@link findContours}.
 * @param epsilon - Maximum distance between the outline and the polygon.
 * @returns The polygon's vertices, in the contour's order.
 *
 * @example
 * const corners = approxPolygon(contour, 0.02 * arcLength(contour));
 */
export function approxPolygon(contour: readonly Point[], epsilon: number): Point[] {
  if (contour.length <= 2) return [...contour];
  // Split the loop at the point farthest from the first, then simplify both halves.
  let far = 0;
  let max = -1;
  for (let i = 1; i < contour.length; i++) {
    const d = Math.hypot(contour[i].x - contour[0].x, contour[i].y - contour[0].y);
    if (d > max) {
      max = d;
      far = i;
    }
  }
  const first = simplifyChain(contour.slice(0, far + 1), epsilon);
  const second = simplifyChain([...contour.slice(far), contour[0]], epsilon);
  return [...first.slice(0, -1), ...second.slice(0, -1)];
}

/**
 * Whether a polygon is convex (all turns in the same direction).
 *
 * @param polygon - Vertices in order, at least 3.
 * @returns `true` for a convex polygon.
 *
 * @example
 * isConvex(corners); // false for a bow-tie
 */
export function isConvex(polygon: readonly Point[]): boolean {
  const n = polygon.length;
  if (n < 3) return false;
  let sign = 0;
  for (let i = 0; i < n; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % n];
    const c = polygon[(i + 2) % n];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (cross === 0) continue;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return sign !== 0;
}
