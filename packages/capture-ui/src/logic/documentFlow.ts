import { createDocumentTracker } from "pixelvision";
import type {
  AspectPreset,
  DocumentFlow,
  DocumentFlowOptions,
  DocumentFlowState,
  Point,
  Quad,
} from "./documentFlow.model";

/** ID-1 card (bank card, ID card, driving licence): 85.6 × 53.98 mm. */
export const ID_CARD_ASPECT = 85.6 / 53.98;
/** ISO A4 page: 210 × 297 mm. */
export const A4_ASPECT = 210 / 297;

/**
 * Creates the document scanner's live-view flow on pixelvision's
 * `createDocumentTracker`: searching until a document is found, then a
 * hold-still ring that fills while the smoothed outline stays within 5% of
 * the document's diagonal (and drains when it moves), then ready to
 * capture. Stray detections are ignored and a few missed frames keep the
 * outline, so a hand-held document can get there.
 *
 * @param options - Tracker options; see `DocumentTrackerOptions`.
 * @returns The flow.
 * @throws {RangeError} When an option is out of range (from the tracker).
 *
 * @example
 * const flow = createDocumentFlow();
 * const state = flow.update(findDocument(frame)?.corners);
 * if (state.phase === "ready") capture(state.corners);
 */
export function createDocumentFlow(options: DocumentFlowOptions = {}): DocumentFlow {
  const tracker = createDocumentTracker(options);
  return {
    update(corners) {
      const { status, corners: outline, progress } = tracker.update(corners ?? null);
      if (!outline) return { phase: "searching", progress: 0, message: "docSearching" };
      const ready = status === "steady";
      const state: DocumentFlowState = {
        phase: ready ? "ready" : "holding",
        progress,
        message: ready ? "docFound" : "docHoldStill",
        corners: outline,
      };
      return state;
    },
    reset() {
      tracker.reset();
    },
  };
}

/**
 * Average length of two opposite edges.
 *
 * @param a - First edge start.
 * @param b - First edge end.
 * @param c - Second edge start.
 * @param d - Second edge end.
 * @returns The mean length.
 */
const meanEdge = (a: Point, b: Point, c: Point, d: Point): number =>
  (Math.hypot(b.x - a.x, b.y - a.y) + Math.hypot(d.x - c.x, d.y - c.y)) / 2;

/**
 * Picks the output aspect ratio (width / height) for `extractDocument`. A
 * preset keeps its true proportions but follows the document's orientation
 * in the photo: an ID card held upright comes out portrait.
 *
 * @param preset - `"auto"` keeps the proportions seen in the photo.
 * @param corners - Top-left, top-right, bottom-right, bottom-left.
 * @returns The aspect ratio, or undefined for `"auto"`.
 *
 * @example
 * extractDocument(image, corners, { aspectRatio: resolveAspect("id-card", corners) });
 */
export function resolveAspect(preset: AspectPreset, corners: Quad): number | undefined {
  if (preset === "auto") return undefined;
  const [tl, tr, br, bl] = corners;
  const landscape = meanEdge(tl, tr, bl, br) >= meanEdge(tl, bl, tr, br);
  const ratio = preset === "id-card" ? ID_CARD_ASPECT : A4_ASPECT;
  const wide = Math.max(ratio, 1 / ratio);
  return landscape ? wide : 1 / wide;
}

/**
 * Scales corners between two image sizes, e.g. from the small detection
 * frame to the full-resolution capture.
 *
 * @param corners - Corners in the source size.
 * @param scale - Factor to multiply by.
 * @returns The scaled corners.
 */
export function scaleQuad(corners: Quad, scale: number): Quad {
  return corners.map((p) => ({ x: p.x * scale, y: p.y * scale })) as Quad;
}

/**
 * Moves one corner, kept inside the image.
 *
 * @param corners - Current corners.
 * @param index - Corner to move, 0–3.
 * @param to - New position.
 * @param width - Image width.
 * @param height - Image height.
 * @returns New corners; the input is not changed.
 */
export function moveCorner(
  corners: Quad,
  index: number,
  to: Point,
  width: number,
  height: number,
): Quad {
  const next = corners.map((p) => ({ ...p })) as Quad;
  next[index] = {
    x: Math.min(width, Math.max(0, to.x)),
    y: Math.min(height, Math.max(0, to.y)),
  };
  return next;
}

/**
 * A quad inset from the image edges, used when the person adjusts corners
 * without a detection.
 *
 * @param width - Image width.
 * @param height - Image height.
 * @param inset - Margin as a fraction of each side (default 0.1).
 * @returns Top-left, top-right, bottom-right, bottom-left.
 */
export function defaultQuad(width: number, height: number, inset = 0.1): Quad {
  const x0 = width * inset;
  const y0 = height * inset;
  const x1 = width - x0;
  const y1 = height - y0;
  return [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
}

/**
 * Parses an aspect attribute value.
 *
 * @param value - Attribute value.
 * @returns The preset; `"auto"` for anything unknown.
 */
export function parseAspect(value: string | null | undefined): AspectPreset {
  return value === "id-card" || value === "a4" ? value : "auto";
}
