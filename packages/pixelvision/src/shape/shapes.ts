import type { Point } from "../math/transforms.model";
import type { Moments, Rect, RotatedRect } from "./shapes.model";

/**
 * The smallest axis-aligned rectangle containing every point, in whole
 * pixels (so a single point has width and height 1), as OpenCV's
 * `boundingRect`.
 *
 * @param points - Points, e.g. a contour.
 * @returns The rectangle; all zeros for no points.
 *
 * @example
 * const box = boundingRect(contour);
 */
export function boundingRect(points: readonly Point[]): Rect {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { x, y } of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const x = Math.floor(minX);
  const y = Math.floor(minY);
  return { x, y, width: Math.floor(maxX) - x + 1, height: Math.floor(maxY) - y + 1 };
}

/**
 * The convex hull: the smallest convex polygon containing every point
 * (Andrew's monotone chain). Collinear points on the hull's edges are left
 * out.
 *
 * @param points - Points, e.g. a contour.
 * @returns Hull vertices in clockwise order (image coordinates, y down), starting at the top-left-most point.
 *
 * @example
 * const hull = convexHull(contour);
 * const solidity = Math.abs(contourArea(contour)) / Math.abs(contourArea(hull));
 */
export function convexHull(points: readonly Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const unique = sorted.filter(
    (p, i) => i === 0 || p.x !== sorted[i - 1].x || p.y !== sorted[i - 1].y,
  );
  if (unique.length < 3) return unique;
  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point[] = [];
  for (const p of unique) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = unique.length - 1; i >= 0; i--) {
    const p = unique[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  // lower + upper is counter-clockwise in y-up terms, which is clockwise on screen.
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  // Start at the top-left-most point for a stable order.
  let start = 0;
  hull.forEach((p, i) => {
    if (p.y < hull[start].y || (p.y === hull[start].y && p.x < hull[start].x)) start = i;
  });
  return [...hull.slice(start), ...hull.slice(0, start)];
}

/**
 * The smallest-area rectangle (any rotation) containing every point, by
 * rotating calipers over the convex hull, as OpenCV's `minAreaRect`.
 *
 * @param points - Points, e.g. a contour.
 * @returns Centre, size, angle in degrees and corners; zero-sized for fewer than 2 distinct points.
 *
 * @example
 * const { angle } = minAreaRect(contour); // how far a card is rotated
 */
export function minAreaRect(points: readonly Point[]): RotatedRect {
  const hull = convexHull(points);
  if (hull.length === 0) {
    const zero = { x: 0, y: 0 };
    return { center: zero, width: 0, height: 0, angle: 0, corners: [zero, zero, zero, zero] };
  }
  if (hull.length === 1) {
    const p = hull[0];
    return { center: { ...p }, width: 0, height: 0, angle: 0, corners: [p, p, p, p] };
  }
  let best: RotatedRect | null = null;
  let bestArea = Infinity;
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const ux = (b.x - a.x) / length;
    const uy = (b.y - a.y) / length;
    let minU = Infinity;
    let maxU = -Infinity;
    let minV = Infinity;
    let maxV = -Infinity;
    for (const p of hull) {
      const u = (p.x - a.x) * ux + (p.y - a.y) * uy;
      const v = -(p.x - a.x) * uy + (p.y - a.y) * ux;
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    }
    const width = maxU - minU;
    const height = maxV - minV;
    const area = width * height;
    if (area < bestArea - 1e-9) {
      bestArea = area;
      const at = (u: number, v: number): Point => ({
        x: a.x + u * ux - v * uy,
        y: a.y + u * uy + v * ux,
      });
      const corners: RotatedRect["corners"] = [
        at(minU, minV),
        at(maxU, minV),
        at(maxU, maxV),
        at(minU, maxV),
      ];
      best = {
        center: at((minU + maxU) / 2, (minV + maxV) / 2),
        width,
        height,
        angle: (Math.atan2(uy, ux) * 180) / Math.PI,
        corners,
      };
    }
  }
  return best!;
}

/**
 * Computes the moments of a polygon (a contour treated as a filled shape,
 * by Green's theorem, as OpenCV's `moments` on a contour): area, centroid
 * (`m10 / m00`, `m01 / m00`), orientation and shape descriptors.
 *
 * @param polygon - Vertices in order.
 * @returns Spatial, central and normalised central moments.
 *
 * @example
 * const m = moments(contour);
 * const centroid = { x: m.m10 / m.m00, y: m.m01 / m.m00 };
 */
export function moments(polygon: readonly Point[]): Moments {
  let a00 = 0;
  let a10 = 0;
  let a01 = 0;
  let a20 = 0;
  let a11 = 0;
  let a02 = 0;
  let a30 = 0;
  let a21 = 0;
  let a12 = 0;
  let a03 = 0;
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const { x: xi, y: yi } = polygon[i];
    const { x: xj, y: yj } = polygon[(i + 1) % n];
    const c = xi * yj - xj * yi;
    a00 += c;
    a10 += c * (xi + xj);
    a01 += c * (yi + yj);
    a20 += c * (xi * xi + xi * xj + xj * xj);
    a02 += c * (yi * yi + yi * yj + yj * yj);
    a11 += c * (xi * (2 * yi + yj) + xj * (yi + 2 * yj));
    a30 += c * (xi + xj) * (xi * xi + xj * xj);
    a03 += c * (yi + yj) * (yi * yi + yj * yj);
    a21 += c * (xi * xi * (3 * yi + yj) + 2 * xi * xj * (yi + yj) + xj * xj * (yi + 3 * yj));
    a12 += c * (yi * yi * (3 * xi + xj) + 2 * yi * yj * (xi + xj) + yj * yj * (xi + 3 * xj));
  }
  // Orientation-independent, as OpenCV: flip the sign for clockwise input.
  const sign = a00 < 0 ? -1 : 1;
  const m00 = (sign * a00) / 2;
  const m10 = (sign * a10) / 6;
  const m01 = (sign * a01) / 6;
  const m20 = (sign * a20) / 12;
  const m11 = (sign * a11) / 24;
  const m02 = (sign * a02) / 12;
  const m30 = (sign * a30) / 20;
  const m21 = (sign * a21) / 60;
  const m12 = (sign * a12) / 60;
  const m03 = (sign * a03) / 20;
  const cx = m00 ? m10 / m00 : 0;
  const cy = m00 ? m01 / m00 : 0;
  const mu20 = m20 - cx * m10;
  const mu11 = m11 - cx * m01;
  const mu02 = m02 - cy * m01;
  const mu30 = m30 - cx * (3 * mu20 + cx * m10);
  const mu21 = m21 - cx * (2 * mu11 + cx * m01) - cy * mu20;
  const mu12 = m12 - cy * (2 * mu11 + cy * m10) - cx * mu02;
  const mu03 = m03 - cy * (3 * mu02 + cy * m01);
  const s2 = m00 ? 1 / (m00 * m00) : 0;
  const s3 = m00 ? s2 / Math.sqrt(Math.abs(m00)) : 0;
  return {
    m00,
    m10,
    m01,
    m20,
    m11,
    m02,
    m30,
    m21,
    m12,
    m03,
    mu20,
    mu11,
    mu02,
    mu30,
    mu21,
    mu12,
    mu03,
    nu20: mu20 * s2,
    nu11: mu11 * s2,
    nu02: mu02 * s2,
    nu30: mu30 * s3,
    nu21: mu21 * s3,
    nu12: mu12 * s3,
    nu03: mu03 * s3,
  };
}

/**
 * The seven Hu moment invariants: shape descriptors that stay the same
 * when the shape is moved, scaled or rotated (the seventh flips sign when
 * mirrored). Compare shapes by comparing these.
 *
 * @param m - Moments from {@link moments}.
 * @returns The seven invariants.
 *
 * @example
 * const [h1] = huMoments(moments(contour));
 */
export function huMoments(m: Moments): [number, number, number, number, number, number, number] {
  const { nu20, nu11, nu02, nu30, nu21, nu12, nu03 } = m;
  const t0 = nu30 + nu12;
  const t1 = nu21 + nu03;
  const q0 = t0 * t0;
  const q1 = t1 * t1;
  const n4 = 4 * nu11;
  const s = nu20 + nu02;
  const d = nu20 - nu02;
  const h1 = s;
  const h2 = d * d + n4 * nu11;
  const h4 = q0 + q1;
  const h6 = d * (q0 - q1) + n4 * t0 * t1;
  const p0 = nu30 - 3 * nu12;
  const p1 = 3 * nu21 - nu03;
  const h3 = p0 * p0 + p1 * p1;
  const h5 = p0 * t0 * (q0 - 3 * q1) + p1 * t1 * (3 * q0 - q1);
  const h7 = p1 * t0 * (q0 - 3 * q1) - p0 * t1 * (3 * q0 - q1);
  return [h1, h2, h3, h4, h5, h6, h7];
}
