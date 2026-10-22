import { createDocumentTracker } from "pixelvision";
import type { Point, Quad } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { PHOTO_CARD_CORNERS } from "../../samples/samples";
import type { DocumentTrackerDemoOptions } from "./demo.model";

const FRAMES = 30;
/** Frames where the detector finds nothing, as a real camera does now and then. */
const MISSED = new Set([4, 9]);
/** A frame where the detector locks onto something else. */
const STRAY = 6;

/**
 * Plays 30 frames of a hand-held card through `createDocumentTracker`: every
 * detection wobbles, two frames find nothing and one finds the wrong shape.
 * Also shows when the old "8 in a row, each corner within 6 px" rule would
 * have captured.
 *
 * @param input - The card photo and how much the hand wobbles.
 * @returns The smoothed outline, progress per frame and when it was steady.
 */
export function demo({ image, options }: DemoInput<DocumentTrackerDemoOptions>): DemoOutput {
  let seed = 11;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32 - 0.5;
  };
  const card = PHOTO_CARD_CORNERS as unknown as Quad;
  const detections: (Quad | null)[] = Array.from({ length: FRAMES }, (_, frame) => {
    if (MISSED.has(frame)) return null;
    if (frame === STRAY) return card.map((p) => ({ x: p.x * 0.5, y: p.y * 0.6 })) as Quad;
    return card.map((p) => ({
      x: p.x + random() * 2 * options.wobble,
      y: p.y + random() * 2 * options.wobble,
    })) as Quad;
  });

  const tracker = createDocumentTracker();
  const progress: number[] = [];
  let steadyAt = -1;
  detections.forEach((corners, frame) => {
    const state = tracker.update(corners);
    progress.push(state.progress);
    if (steadyAt < 0 && state.status === "steady") steadyAt = frame + 1;
  });
  const outline = tracker.state.corners ?? card;
  const outlineError = Math.max(
    ...outline.map((p, c) => Math.hypot(p.x - card[c].x, p.y - card[c].y)),
  );

  const strictAt = strictRule(detections);
  const last = detections.filter((d): d is Quad => d !== null).at(-1) ?? card;

  return {
    images: [
      {
        label: "Last raw detection (left) and the tracker's outline (right)",
        image,
        overlay: { polygons: [last as Point[]] },
      },
      { label: "Tracker outline", image, overlay: { polygons: [outline as Point[]] } },
    ],
    charts: [{ label: "Held still (0–1) per frame", values: progress }],
    tables: [
      {
        label: "When it captures",
        columns: ["Rule", "Frame"],
        rows: [
          ["createDocumentTracker", steadyAt < 0 ? "never" : steadyAt],
          ["8 in a row, each corner within 6 px", strictAt < 0 ? "never" : strictAt],
        ],
      },
    ],
    values: {
      steadyAt,
      strictAt,
      outlineError: round(outlineError, 2),
    },
  };
}

/**
 * The rule the camera page used before the tracker: 8 detections in a row,
 * no corner moving more than 6 pixels between two of them.
 *
 * @param detections - Per-frame corners.
 * @returns The 1-based frame it would capture on, or -1.
 */
function strictRule(detections: readonly (Quad | null)[]): number {
  let run = 0;
  for (let i = 0; i < detections.length; i++) {
    const now = detections[i];
    const before = detections[i - 1];
    const close =
      now && before && now.every((p, c) => Math.hypot(p.x - before[c].x, p.y - before[c].y) <= 6);
    run = now ? (close ? run + 1 : 1) : 0;
    if (run >= 8) return i + 1;
  }
  return -1;
}
