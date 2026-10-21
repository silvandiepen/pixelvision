import type { Point } from "../math/transforms.model";
import { median } from "../math/median";
import type { Quad } from "./document.model";
import type {
  DocumentTracker,
  DocumentTrackerOptions,
  DocumentTrackerState,
} from "./documentTracker.model";

/**
 * Turns per-frame {@link findDocument} results from a camera into a calm
 * outline and a "held still" signal. Corners are the median of the last few
 * detections, a detection that jumps away is ignored until it repeats, a few
 * missed frames keep the outline, and steadiness is measured against the
 * document's own size, so a hand-held page can reach it.
 *
 * @param options - Timing and tolerance; see {@link DocumentTrackerOptions}.
 * @returns A tracker to feed each frame's corners.
 * @throws {RangeError} When a count isn't a positive integer or a fraction isn't positive.
 *
 * @example
 * const tracker = createDocumentTracker();
 * const { corners, progress, status } = tracker.update(findDocument(frame)?.corners ?? null);
 * if (status === "steady") capture(corners);
 */
export function createDocumentTracker(options: DocumentTrackerOptions = {}): DocumentTracker {
  const {
    holdFrames = 8,
    windowFrames = 5,
    maxMisses = 4,
    tolerance = 0.05,
    jump = 0.12,
    confirmFrames = 3,
  } = options;
  for (const [name, value] of Object.entries({
    holdFrames,
    windowFrames,
    maxMisses,
    confirmFrames,
  })) {
    if (!Number.isInteger(value) || value < 1) {
      throw new RangeError(
        `createDocumentTracker: ${name} must be a positive integer, got ${value}`,
      );
    }
  }
  for (const [name, value] of Object.entries({ tolerance, jump })) {
    if (!(value > 0)) {
      throw new RangeError(`createDocumentTracker: ${name} must be positive, got ${value}`);
    }
  }

  let recent: Quad[] = [];
  let pending: Quad[] = [];
  let misses = 0;
  let steady = 0;
  let state: DocumentTrackerState = { status: "searching", corners: null, progress: 0 };

  /** Clears everything back to searching. */
  const reset = () => {
    recent = [];
    pending = [];
    misses = 0;
    steady = 0;
    state = { status: "searching", corners: null, progress: 0 };
  };

  /**
   * Publishes the outline and progress for the current counters.
   *
   * @param corners - The outline to show, or null.
   * @returns The new state.
   */
  const publish = (corners: Quad | null): DocumentTrackerState => {
    const progress = Math.min(1, steady / holdFrames);
    state = {
      status: !corners ? "searching" : progress >= 1 ? "steady" : "tracking",
      corners,
      progress,
    };
    return state;
  };

  /**
   * Starts tracking at a new place, as if the document had just appeared.
   *
   * @param quads - Detections at the new place.
   * @returns The new state.
   */
  const restart = (quads: Quad[]): DocumentTrackerState => {
    recent = quads.slice(-windowFrames);
    pending = [];
    steady = 0;
    return publish(medianQuad(recent));
  };

  const update = (corners: Quad | null): DocumentTrackerState => {
    if (!corners) {
      misses++;
      if (misses > maxMisses) {
        reset();
        return state;
      }
      // Keep the outline; progress pauses instead of resetting.
      return publish(state.corners);
    }
    misses = 0;
    const outline = state.corners;
    if (!outline) return restart([corners]);

    const size = diagonal(outline);
    if (maxCornerDistance(corners, outline) > jump * size) {
      const last = pending[pending.length - 1];
      pending =
        last && maxCornerDistance(corners, last) <= jump * size ? [...pending, corners] : [corners];
      return pending.length >= confirmFrames ? restart(pending) : publish(outline);
    }
    pending = [];
    recent = [...recent, corners].slice(-windowFrames);
    const smoothed = medianQuad(recent);
    // Each detection is judged against the outline it joins (the median would
    // hide the first frames of a move). Steadiness drains twice as fast as it
    // fills: a real move undoes it quickly, one shaky frame only costs a little.
    steady =
      maxCornerDistance(corners, outline) <= tolerance * size
        ? Math.min(holdFrames, steady + 1)
        : Math.max(0, steady - 2);
    return publish(smoothed);
  };

  return {
    update,
    reset,
    get state() {
      return state;
    },
  };
}

/**
 * Per-corner median of several outlines.
 *
 * @param quads - Outlines with corners in the same order.
 * @returns The median outline.
 */
function medianQuad(quads: readonly Quad[]): Quad {
  return [0, 1, 2, 3].map((c): Point => ({
    x: median(quads.map((q) => q[c].x)),
    y: median(quads.map((q) => q[c].y)),
  })) as Quad;
}

/**
 * Largest distance between matching corners of two outlines.
 *
 * @param a - First outline.
 * @param b - Second outline.
 * @returns The distance in pixels.
 */
function maxCornerDistance(a: Quad, b: Quad): number {
  let max = 0;
  for (let c = 0; c < 4; c++) max = Math.max(max, Math.hypot(a[c].x - b[c].x, a[c].y - b[c].y));
  return max;
}

/**
 * Length of the outline's longer diagonal, the scale for its tolerances.
 *
 * @param q - Outline, corners in order.
 * @returns The diagonal in pixels (at least 1).
 */
function diagonal(q: Quad): number {
  return Math.max(
    1,
    Math.hypot(q[2].x - q[0].x, q[2].y - q[0].y),
    Math.hypot(q[3].x - q[1].x, q[3].y - q[1].y),
  );
}
