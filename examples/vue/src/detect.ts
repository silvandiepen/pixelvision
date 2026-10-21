import { canny, findDocument, gaussianBlur, grayscale } from "pixelvision";
import type { DetectResult } from "./detect.model";

/**
 * Finds the edges and the document in a photo: grayscale, blur and Canny
 * for the edge map, and `findDocument` for the corners.
 *
 * @param image - The photo's RGBA pixels.
 * @returns The edge map, and the document's corners or null.
 */
export function detect(image: ImageData): DetectResult {
  const gray = grayscale(image);
  const edges = canny(gaussianBlur(gray, { kernelSize: 5 }), { low: 40, high: 100 });
  const found = findDocument(image);
  return { edges, corners: found?.corners ?? null };
}
