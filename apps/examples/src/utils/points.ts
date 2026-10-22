import type { Point, RGBAImage } from "pixelvision";
import { insidePolygon } from "../samples/raster";

/**
 * Finds the distance from a point to the nearest of a list of points.
 *
 * @param point - The point.
 * @param candidates - Points to compare with.
 * @returns The smallest distance, or `Infinity` for an empty list.
 */
export function nearestDistance(point: Point, candidates: readonly Point[]): number {
  let best = Infinity;
  for (const candidate of candidates) {
    best = Math.min(best, Math.hypot(candidate.x - point.x, candidate.y - point.y));
  }
  return best;
}

/**
 * Counts how many targets have at least one point within `radius` of them.
 *
 * @param targets - Points that should be found, e.g. known corners.
 * @param found - Points a detector returned.
 * @param radius - Largest distance that counts as found.
 * @returns The number of targets found.
 */
export function countFound(
  targets: readonly Point[],
  found: readonly Point[],
  radius: number,
): number {
  return targets.filter((target) => nearestDistance(target, found) <= radius).length;
}

/**
 * Keeps the strongest points by score.
 *
 * @param points - Points with a score, e.g. keypoints.
 * @param count - How many to keep.
 * @returns At most `count` points, strongest first.
 */
export function strongest<T extends { score: number }>(points: readonly T[], count: number): T[] {
  return [...points].sort((a, b) => b.score - a.score).slice(0, count);
}

/**
 * Places two RGBA images next to each other, for drawing matches between
 * them. The shorter one is padded with black.
 *
 * @param left - Left image.
 * @param right - Right image.
 * @returns One image, `left.width + right.width` wide.
 */
export function sideBySide(left: RGBAImage, right: RGBAImage): RGBAImage {
  const width = left.width + right.width;
  const height = Math.max(left.height, right.height);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  for (const [image, offset] of [
    [left, 0],
    [right, left.width],
  ] as const) {
    for (let y = 0; y < image.height; y++) {
      const row = image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4);
      data.set(row, (y * width + offset) * 4);
    }
  }
  return { width, height, data };
}

/**
 * Picks the outline that passes close to every one of a shape's corners,
 * e.g. the triangle of the shapes sample among all its contours.
 *
 * @param contours - Outlines, e.g. from `findContours`.
 * @param corners - The shape's corners.
 * @param radius - Largest distance from a corner to the outline.
 * @returns The first matching outline, or `undefined`.
 */
export function contourThrough<T extends readonly Point[]>(
  contours: readonly T[],
  corners: readonly Point[],
  radius: number,
): T | undefined {
  return contours.find((contour) => countFound(corners, contour, radius) === corners.length);
}

/**
 * The share of points inside a polygon, such as a document's outline.
 *
 * @param polygon - Corners in order.
 * @param points - The points.
 * @returns 0–1, or 0 without points.
 */
export function shareInside(polygon: readonly Point[], points: readonly Point[]): number {
  if (points.length === 0) return 0;
  const inside = points.filter((p) => insidePolygon(polygon, p.x, p.y)).length;
  return Math.round((inside / points.length) * 1000) / 1000;
}
