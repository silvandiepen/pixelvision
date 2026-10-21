import type { DocumentAspect } from "./demo.model";

const POINTS_PER_MM = 72 / 25.4;

/**
 * The page size for a scanned document's PDF, in points: an A4 page or an
 * ID card at their real sizes, and anything else as wide as A4.
 *
 * @param aspect - The proportions the document was straightened to.
 * @param width - The straightened image's width in pixels.
 * @param height - The straightened image's height in pixels.
 * @returns Page width and height in points.
 */
export function documentPageSize(
  aspect: DocumentAspect,
  width: number,
  height: number,
): { width: number; height: number } {
  const portrait = height >= width;
  if (aspect === "a4") {
    return portrait
      ? { width: 210 * POINTS_PER_MM, height: 297 * POINTS_PER_MM }
      : { width: 297 * POINTS_PER_MM, height: 210 * POINTS_PER_MM };
  }
  if (aspect === "id-card") {
    return portrait
      ? { width: 53.98 * POINTS_PER_MM, height: 85.6 * POINTS_PER_MM }
      : { width: 85.6 * POINTS_PER_MM, height: 53.98 * POINTS_PER_MM };
  }
  return { width: 210 * POINTS_PER_MM, height: (210 * POINTS_PER_MM * height) / width };
}
