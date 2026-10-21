import type { Matrix } from "../core/matrix.model";
import type { Point } from "../math/transforms.model";

/** The four corners of a document: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

/** Options for {@link findDocument}. */
export interface FindDocumentOptions {
  /** Work on a copy scaled so its longer side is at most this (default 400). Smaller is faster. */
  maxSize?: number;
  /** Smallest document as a fraction of the image area (default 0.1). */
  minArea?: number;
  /** Largest document as a fraction of the image area (default 0.98). */
  maxArea?: number;
  /** Colour layout when passing colour pixels (default `"rgba"`). */
  order?: "rgba" | "rgb" | "bgra" | "bgr";
}

/** A document found in an image. */
export interface FoundDocument {
  /** Corners in image pixels: top-left, top-right, bottom-right, bottom-left. */
  corners: Quad;
  /** Area as a fraction of the image. */
  area: number;
}

/** Options for {@link extractDocument}. */
export interface ExtractDocumentOptions {
  /** Output width; defaults to the longer of the top and bottom edges. */
  width?: number;
  /** Output height; defaults to the longer of the left and right edges (or from `aspectRatio`). */
  height?: number;
  /** Force width / height, e.g. 85.6 / 53.98 for an ID card. */
  aspectRatio?: number;
  /** Matrix to write into. */
  out?: Matrix<"u8">;
}
