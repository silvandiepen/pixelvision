import type { Matrix } from "../core/matrix.model";
import type { Point } from "../math/transforms.model";

/** The four corners of a document: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

/** Options for {@link findDocument}. */
export interface FindDocumentOptions {
  /** Work on a copy scaled so its longer side is at most this (default 400). Smaller is faster. */
  maxSize?: number;
  /** Smallest document as a fraction of the image area (default 0.02: an ID card held up to a webcam). */
  minArea?: number;
  /** Largest document as a fraction of the image area (default 0.98). */
  maxArea?: number;
  /** Colour layout when passing colour pixels (default `"rgba"`). */
  order?: "rgba" | "rgb" | "bgra" | "bgr";
  /**
   * When no whole document is found, report a light one that runs off the
   * edge of the image as a {@link CutDocument}, so a camera view can ask the
   * person to move back (default false).
   */
  reportCut?: boolean;
}

/** A document found in an image. */
export interface FoundDocument {
  /** Corners in image pixels: top-left, top-right, bottom-right, bottom-left. */
  corners: Quad;
  /** Area as a fraction of the image. */
  area: number;
  /** Never set on a whole document; see {@link CutDocument}. */
  cut?: false;
}

/** A document that runs off the edge of the image: it can't be straightened. */
export interface CutDocument {
  cut: true;
  /** The visible part's outline in image pixels, including the stretch along the image edge. */
  outline: Point[];
  /** Visible area as a fraction of the image. */
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
