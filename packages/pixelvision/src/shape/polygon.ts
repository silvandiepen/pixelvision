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
 * Simplifies a closed outline to a polygon whose edges stay within
 * `epsilon` pixels of it: Douglas–Peucker as OpenCV's `approxPolyDP`
 * computes it, with identical vertices for the same outline. The loop is
 * first split between two far-apart points (found by hopping three times to
 * the point farthest away, from the first), each part is split at the point
 * farthest from its chord until every point is within `epsilon`, and
 * vertices on nearly straight runs are dropped at the end. Use `epsilon`
 * around 2% of {@link arcLength} to turn the contour of a sheet of paper
 * into its 4 corners.
 *
 * @param contour - Closed outline, e.g. from {@link findContours}.
 * @param epsilon - Maximum distance between the outline and the polygon.
 * @returns The polygon's vertices, in the contour's order.
 *
 * @example
 * const corners = approxPolygon(contour, 0.02 * arcLength(contour));
 */
export function approxPolygon(contour: readonly Point[], epsilon: number): Point[] {
  const count = contour.length;
  if (count === 0) return [];
  const eps = epsilon * epsilon;
  const out: Point[] = [];
  const stack: [number, number][] = [];

  // 1. Two approximately farthest points: hop three times to the point
  // farthest from the current one, starting at the first.
  let start = 0;
  let farthest = 0;
  let closeTogether = false;
  for (let iteration = 0; iteration < 3; iteration++) {
    start = (start + farthest) % count;
    const origin = contour[start];
    let maxDistance = 0;
    farthest = 0;
    for (let j = 1; j < count; j++) {
      const p = contour[(start + j) % count];
      const distance = (p.x - origin.x) ** 2 + (p.y - origin.y) ** 2;
      if (distance > maxDistance) {
        maxDistance = distance;
        farthest = j;
      }
    }
    closeTogether = maxDistance <= eps;
  }
  if (closeTogether) {
    out.push(contour[start]);
  } else {
    const end = (start + farthest) % count;
    stack.push([end, start], [start, end]);
  }

  // 2. Split each part at the point farthest from its chord.
  while (stack.length) {
    const [from, to] = stack.pop()!;
    const a = contour[from];
    const b = contour[to];
    let pos = (from + 1) % count;
    let withinEps = true;
    let split = from;
    if (pos !== to) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      let maxDistance = 0;
      for (; pos !== to; pos = (pos + 1) % count) {
        const p = contour[pos];
        // Distance to the chord's line, times its length. A chord never has
        // length 0: its ends are far apart or split off it, off its line.
        const distance = Math.abs((p.y - a.y) * dx - (p.x - a.x) * dy);
        if (distance > maxDistance) {
          maxDistance = distance;
          split = pos;
        }
      }
      withinEps = maxDistance * maxDistance <= eps * (dx * dx + dy * dy);
    }
    if (withinEps) out.push(a);
    else stack.push([split, to], [from, split]);
  }

  // 3. Drop vertices on nearly straight runs (not along an axis). Like
  // OpenCV this reads and rewrites the vertex list in place, wrapping round.
  const n = out.length;
  let kept = n;
  let pos = n - 1;
  const next = () => {
    const vertex = out[pos];
    pos = pos + 1 >= n ? 0 : pos + 1;
    return vertex;
  };
  let a = next();
  let write = pos;
  let p = next();
  for (let i = 0; i < n && kept > 2; i++) {
    const b = next();
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx);
    const forward = (p.x - a.x) * (b.x - p.x) + (p.y - a.y) * (b.y - p.y);
    if (
      distance * distance <= 0.5 * eps * (dx * dx + dy * dy) &&
      dx !== 0 &&
      dy !== 0 &&
      forward >= 0
    ) {
      kept--;
      out[write] = a = b;
      write = write + 1 >= n ? 0 : write + 1;
      p = next();
      i++;
      continue;
    }
    out[write] = a = p;
    write = write + 1 >= n ? 0 : write + 1;
    p = b;
  }
  return out.slice(0, kept);
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
