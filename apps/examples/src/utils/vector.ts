import type { PathSegment, Point, VectorPath } from "pixelvision";

/**
 * Flattens path segments to polygons, one per subpath, sampling each cubic
 * curve at 16 points.
 *
 * @param segments - The segments, `M` … `Z` per subpath.
 * @returns The polygons.
 */
export function flattenSegments(segments: readonly PathSegment[]): Point[][] {
  const polygons: Point[][] = [];
  let current: Point = { x: 0, y: 0 };
  for (const segment of segments) {
    if (segment.type === "M") {
      polygons.push([segment.points[0]]);
    } else if (segment.type === "C") {
      const [c1, c2, end] = segment.points;
      for (let s = 1; s <= 16; s++) {
        const t = s / 16;
        const mt = 1 - t;
        const w = [mt * mt * mt, 3 * t * mt * mt, 3 * t * t * mt, t * t * t];
        polygons[polygons.length - 1].push({
          x: w[0] * current.x + w[1] * c1.x + w[2] * c2.x + w[3] * end.x,
          y: w[0] * current.y + w[1] * c1.y + w[2] * c2.y + w[3] * end.y,
        });
      }
    } else if (segment.type === "L") {
      polygons[polygons.length - 1].push(segment.points[0]);
    }
    if (segment.type !== "Z") current = segment.points[segment.points.length - 1];
  }
  return polygons;
}

/**
 * Fills vector paths into a mask the way a browser fills them (non-zero
 * rule), sampling at pixel centres.
 *
 * @param paths - The paths.
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @returns One value per pixel: 1 inside a path, 0 outside.
 */
export function rasterizePaths(
  paths: readonly VectorPath[],
  width: number,
  height: number,
): Uint8Array {
  const mask = new Uint8Array(width * height);
  for (const path of paths) {
    const polygons = flattenSegments(path.segments);
    for (let y = 0; y < height; y++) {
      const centre = y + 0.5;
      const crossings: { x: number; winding: number }[] = [];
      for (const polygon of polygons) {
        polygon.forEach((a, i) => {
          const b = polygon[(i + 1) % polygon.length];
          if (a.y <= centre === b.y <= centre) return;
          const x = a.x + ((centre - a.y) / (b.y - a.y)) * (b.x - a.x);
          crossings.push({ x, winding: b.y > a.y ? 1 : -1 });
        });
      }
      crossings.sort((p, q) => p.x - q.x);
      let winding = 0;
      for (let k = 0; k + 1 < crossings.length; k++) {
        winding += crossings[k].winding;
        if (winding === 0) continue;
        const from = Math.max(0, Math.ceil(crossings[k].x - 0.5));
        const to = Math.min(width, Math.ceil(crossings[k + 1].x - 0.5));
        mask.fill(1, y * width + from, y * width + Math.max(from, to));
      }
    }
  }
  return mask;
}

/**
 * Intersection over union of two masks.
 *
 * @param a - One mask (non-zero is set).
 * @param b - The other.
 * @returns 0–1, 1 when they're the same; 1 when both are empty.
 */
export function maskIou(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let both = 0;
  let either = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) both++;
    if (a[i] || b[i]) either++;
  }
  return either === 0 ? 1 : both / either;
}
