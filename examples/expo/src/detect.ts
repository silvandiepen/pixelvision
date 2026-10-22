import { canny, findDocument, gaussianBlur, grayscale } from "pixelvision";
import type { ImageLike, Quad } from "pixelvision";
import type { DetectResult } from "./detect.model";

/**
 * Finds the edges and the document in a photo: grayscale, blur and Canny
 * for the edge map, and `findDocument` for the corners.
 *
 * @param image - The photo's RGBA pixels.
 * @returns The edge map, and the document's corners or null.
 */
export function detect(image: ImageLike): DetectResult {
  const gray = grayscale(image);
  const edges = canny(gaussianBlur(gray, { kernelSize: 5 }), { low: 40, high: 100 });
  const found = findDocument(image);
  return { edges, corners: found?.corners ?? null };
}

/**
 * Counts the edge pixels in an edge map.
 *
 * @param edges - What {@link detect} returned as `edges`.
 * @returns How many pixels are on an edge.
 */
export function countEdges(edges: DetectResult["edges"]): number {
  let count = 0;
  for (let i = 0; i < edges.data.length; i++) if (edges.data[i]) count++;
  return count;
}

/**
 * Writes corners as `"x,y x,y x,y x,y"`, rounded to whole pixels.
 *
 * @param corners - The corners.
 * @returns The text.
 */
export function formatCorners(corners: Quad): string {
  return corners.map((corner) => `${Math.round(corner.x)},${Math.round(corner.y)}`).join(" ");
}
