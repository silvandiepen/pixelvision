import type { BoxSmoother, BoxSmootherOptions, SmoothedBox } from "./boxSmoother.model";
import type { Box } from "./geometry.model";

/**
 * The median of some numbers.
 *
 * @param values - At least one number.
 * @returns The median.
 */
export function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * The component-wise median of boxes (centre and size), so one wrong box
 * can't drag the result.
 *
 * @param boxes - At least one box.
 * @returns The median box.
 */
export function medianBox(boxes: readonly Box[]): Box {
  const cx = median(boxes.map((b) => b.x + b.width / 2));
  const cy = median(boxes.map((b) => b.y + b.height / 2));
  const width = median(boxes.map((b) => b.width));
  const height = median(boxes.map((b) => b.height));
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

/**
 * Whether a box is far from a reference box: its centre moved more than
 * `distance` times the reference size, or its size changed by more than
 * that fraction.
 *
 * @param box - The new box.
 * @param reference - The smoothed box.
 * @param distance - Tolerance as a fraction of the reference size.
 * @returns Whether it is an outlier.
 */
export function isOutlierBox(box: Box, reference: Box, distance: number): boolean {
  const size = Math.max(1e-6, Math.max(reference.width, reference.height));
  const dx = box.x + box.width / 2 - (reference.x + reference.width / 2);
  const dy = box.y + box.height / 2 - (reference.y + reference.height / 2);
  const ratio = Math.max(box.width, box.height) / size;
  return Math.hypot(dx, dy) > distance * size || Math.abs(Math.log(ratio)) > Math.log1p(distance);
}

/**
 * Creates a face-box smoother. Guidance ("move closer", "centre your
 * face") is derived from the smoothed box, so a single bad detection
 * neither moves the tracker nor changes what the person is told.
 *
 * @param options - Window, outlier tolerance, persistence and gap bridging.
 * @returns The smoother.
 *
 * @example
 * const smoother = createBoxSmoother();
 * const { box, outlier } = smoother.update(detection.box);
 * const guidance = assessFace(box, guide);
 */
export function createBoxSmoother(options: BoxSmootherOptions = {}): BoxSmoother {
  const { windowFrames = 8, outlierDistance = 0.5, persistFrames = 3, gapFrames = 3 } = options;
  const size = Math.max(1, Math.round(windowFrames));
  let history: Box[] = [];
  let candidates: Box[] = [];
  let missing = 0;

  const result = (outlier: boolean, held = false): SmoothedBox => ({
    box: medianBox(history),
    outlier,
    held,
  });

  return {
    update(box) {
      if (!box) {
        missing++;
        if (history.length && missing <= gapFrames) return result(false, true);
        history = [];
        candidates = [];
        return { outlier: false, held: false };
      }
      missing = 0;
      if (!history.length) {
        history = [box];
        return result(false);
      }
      if (!isOutlierBox(box, medianBox(history), outlierDistance)) {
        candidates = [];
        history = [...history, box].slice(-size);
        return result(false);
      }
      // A jump: believe it only once it repeats in the same place.
      const agrees =
        candidates.length > 0 && !isOutlierBox(box, medianBox(candidates), outlierDistance);
      candidates = agrees ? [...candidates, box] : [box];
      if (candidates.length >= persistFrames) {
        history = candidates;
        candidates = [];
        return result(false);
      }
      return result(true);
    },
    reset() {
      history = [];
      candidates = [];
      missing = 0;
    },
  };
}
