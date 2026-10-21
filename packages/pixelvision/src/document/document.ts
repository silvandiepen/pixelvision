import { fromImageData } from "../core/image";
import type { ImageLike, Matrix } from "../core/matrix.model";
import { canny } from "../imgproc/canny";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { grayscale } from "../imgproc/grayscale";
import { dilate, erode } from "../imgproc/morphology";
import { resample } from "../imgproc/resample";
import { otsuLevel, threshold } from "../imgproc/threshold";
import { warpPerspective } from "../imgproc/warp";
import { perspectiveTransform } from "../math/transforms";
import type { Point } from "../math/transforms.model";
import { findContours } from "../shape/contours";
import { approxPolygon, arcLength, contourArea, isConvex } from "../shape/polygon";
import type {
  CutDocument,
  ExtractDocumentOptions,
  FindDocumentOptions,
  FoundDocument,
  Quad,
} from "./document.model";

/**
 * Puts four corners in reading order: top-left, top-right, bottom-right,
 * bottom-left (clockwise, starting at the corner nearest the origin).
 *
 * @param points - Four corners in any order.
 * @returns The ordered corners.
 */
export const orderCorners = (points: readonly Point[]): Quad => {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
  const clockwise = [...points].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
  );
  let start = 0;
  clockwise.forEach((p, i) => {
    if (p.x + p.y < clockwise[start].x + clockwise[start].y) start = i;
  });
  return [0, 1, 2, 3].map((k) => clockwise[(start + k) % 4]) as Quad;
};

/**
 * Reduces a contour to a convex quadrilateral, loosening the tolerance
 * step by step so rounded corners (like an ID card's) still give 4 points.
 *
 * @param contour - Closed outline.
 * @returns Four corners, or null when the contour isn't quadrilateral.
 */
export const toQuad = (contour: readonly Point[]): Point[] | null => {
  const perimeter = arcLength(contour);
  const area = Math.abs(contourArea(contour));
  for (const fraction of [0.02, 0.03, 0.04, 0.06, 0.08, 0.1]) {
    const polygon = approxPolygon(contour, fraction * perimeter);
    if (polygon.length < 4) return null;
    if (polygon.length !== 4 || !isConvex(polygon)) continue;
    // The quad must actually be the shape: a circle simplified hard also
    // gives 4 points, but covers only ~64% of the same area.
    return Math.abs(Math.abs(contourArea(polygon)) - area) <= 0.1 * area ? polygon : null;
  }
  return null;
};

/**
 * Whether a quad runs along the image border: the outline of the
 * background region, not a document.
 *
 * @param quad - Corners.
 * @param width - Image width.
 * @param height - Image height.
 * @returns `true` when two or more corners touch the border.
 */
const hugsBorder = (quad: readonly Point[], width: number, height: number): boolean =>
  quad.filter((p) => p.x <= 1 || p.y <= 1 || p.x >= width - 2 || p.y >= height - 2).length >= 2;

/**
 * Converts input to a gray `u8` matrix.
 *
 * @param image - Gray matrix, colour matrix or `ImageData`-like pixels.
 * @param order - Channel order of colour input.
 * @returns The gray matrix.
 */
const toGray = (image: ImageLike | Matrix, order: FindDocumentOptions["order"]): Matrix<"u8"> => {
  if ("type" in image && image.type === "u8" && image.channels === 1) return image as Matrix<"u8">;
  return grayscale(image, { order: order ?? (image.channels === 3 ? "rgb" : "rgba") });
};

/**
 * Finds a document (sheet of paper, ID card, receipt, book page) in a
 * photo or camera frame: the largest convex four-cornered shape that
 * stands out from its surroundings. Looks for its outline both as edges
 * and as a brightness region, so it works on light and dark backgrounds.
 *
 * Pair with {@link extractDocument} to straighten and crop it. In a camera
 * loop, wait until the corners are stable for a few frames before
 * capturing.
 *
 * @param image - Camera frame or photo: `ImageData`, a colour matrix or a gray matrix.
 * @param options - Working size, area limits, channel order, and whether to report a cut-off document.
 * @returns The corners (top-left, top-right, bottom-right, bottom-left) and area, or null when none is
 *   found. With `reportCut`, a document running off the image edge comes back as a {@link CutDocument}
 *   (`cut: true`) when no whole one is found.
 *
 * @example
 * const found = findDocument(context.getImageData(0, 0, width, height));
 * if (found) {
 *   const flat = extractDocument(fromImageData(frame), found.corners, { aspectRatio: 85.6 / 53.98 });
 * }
 */
export function findDocument(
  image: ImageLike | Matrix,
  options: FindDocumentOptions & { reportCut: true },
): FoundDocument | CutDocument | null;
export function findDocument(
  image: ImageLike | Matrix,
  options?: FindDocumentOptions,
): FoundDocument | null;
export function findDocument(
  image: ImageLike | Matrix,
  options: FindDocumentOptions = {},
): FoundDocument | CutDocument | null {
  const { maxSize = 400, minArea = 0.02, maxArea = 0.98 } = options;
  const gray = toGray(image, options.order);
  const { width, height } = gray;
  if (width < 8 || height < 8) return null;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const small =
    scale < 1
      ? resample(gray, {
          width: Math.max(1, Math.round(width * scale)),
          height: Math.max(1, Math.round(height * scale)),
        })
      : gray;
  const blurred = gaussianBlur(small, { kernelSize: 5 });
  const level = otsuLevel(blurred);

  // Two views of the outline: edges (closed up by dilation) and the bright
  // or dark region the document forms.
  const edges = dilate(
    canny(blurred, { low: Math.max(10, level * 0.4), high: Math.max(30, level) }),
  );
  const bright = erode(dilate(threshold(blurred, { level })));
  const dark = erode(dilate(threshold(blurred, { level, invert: true })));
  const imageArea = small.width * small.height;
  const minPixels = Math.max(16, Math.sqrt(minArea * imageArea) * 2);

  let best: { quad: Point[]; area: number } | null = null;
  for (const mask of [edges, bright, dark]) {
    for (const contour of findContours(mask, { minPixels })) {
      const quad = toQuad(contour);
      if (!quad || hugsBorder(quad, small.width, small.height)) continue;
      const area = Math.abs(contourArea(quad)) / imageArea;
      if (area < minArea || area > maxArea) continue;
      if (!best || area > best.area) best = { quad, area };
    }
  }
  if (best) {
    const corners = orderCorners(best.quad.map((p) => ({ x: p.x / scale, y: p.y / scale })));
    return { corners, area: best.area };
  }
  if (!options.reportCut) return null;

  // Nothing whole: look for a light region cut off by the image edge.
  let cut: { outline: Point[]; area: number } | null = null;
  for (const contour of findContours(bright, { minPixels })) {
    const outline = toCutOutline(contour, small.width, small.height);
    if (!outline) continue;
    const area = Math.abs(contourArea(outline)) / imageArea;
    if (area < minArea || area > maxArea) continue;
    if (!cut || area > cut.area) cut = { outline, area };
  }
  if (!cut) return null;
  return {
    cut: true,
    outline: cut.outline.map((p) => ({ x: p.x / scale, y: p.y / scale })),
    area: cut.area,
  };
}

/**
 * Simplifies a contour to the outline of a document cut off by the image
 * edge: 4 to 6 convex corners, at least two of them on the edge, touching at
 * most two sides of the image (a region touching three or four is
 * background, not a document).
 *
 * @param contour - Outer contour of a light region.
 * @param width - Image width.
 * @param height - Image height.
 * @returns The outline, or null when the contour isn't one.
 */
const toCutOutline = (contour: readonly Point[], width: number, height: number): Point[] | null => {
  const perimeter = arcLength(contour);
  const area = Math.abs(contourArea(contour));
  for (const fraction of [0.02, 0.03, 0.04, 0.06]) {
    const polygon = approxPolygon(contour, fraction * perimeter);
    if (polygon.length < 4) return null;
    if (polygon.length > 6 || !isConvex(polygon)) continue;
    if (Math.abs(Math.abs(contourArea(polygon)) - area) > 0.1 * area) return null;
    const sides = new Set<string>();
    let onEdge = 0;
    for (const p of polygon) {
      const touches = [
        p.x <= 1 && "left",
        p.y <= 1 && "top",
        p.x >= width - 2 && "right",
        p.y >= height - 2 && "bottom",
      ].filter((side): side is string => Boolean(side));
      if (touches.length > 0) onEdge++;
      touches.forEach((side) => sides.add(side));
    }
    return onEdge >= 2 && sides.size <= 2 ? polygon : null;
  }
  return null;
};

/**
 * Straightens and crops a document given its four corners: a perspective
 * warp onto an upright rectangle. Works on colour and gray images.
 *
 * The output size defaults to the document's longest edges in the photo;
 * pass `aspectRatio` (e.g. 85.6 / 53.98 for ID cards, 210 / 297 for A4) to
 * get the true proportions regardless of the viewing angle.
 *
 * @param image - The photo, as a `u8` matrix with any channels, or `ImageData`-like RGBA.
 * @param corners - Top-left, top-right, bottom-right, bottom-left, e.g. from {@link findDocument}.
 * @param options - Output size or aspect ratio, optional output matrix.
 * @returns The straightened document, same channels as the input.
 * @throws {RangeError} When the corners are degenerate (three on one line).
 *
 * @example
 * const card = extractDocument(photo, found.corners, { width: 856, aspectRatio: 85.6 / 53.98 });
 */
export function extractDocument(
  image: ImageLike | Matrix<"u8">,
  corners: Quad,
  options: ExtractDocumentOptions = {},
): Matrix<"u8"> {
  const source: Matrix<"u8"> =
    "type" in image && image.type === "u8" ? (image as Matrix<"u8">) : fromImageData(image);
  const [tl, tr, br, bl] = corners;
  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  const measuredWidth = Math.max(distance(tl, tr), distance(bl, br));
  const measuredHeight = Math.max(distance(tl, bl), distance(tr, br));
  const width = Math.max(1, Math.round(options.width ?? measuredWidth));
  const height = Math.max(
    1,
    Math.round(
      options.height ??
        (options.aspectRatio
          ? width / options.aspectRatio
          : measuredHeight * (width / measuredWidth)),
    ),
  );
  const target: Quad = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: width - 1, y: height - 1 },
    { x: 0, y: height - 1 },
  ];
  const toPhoto = perspectiveTransform(target, corners);
  return warpPerspective(source, toPhoto, {
    width,
    height,
    out: options.out,
  });
}
