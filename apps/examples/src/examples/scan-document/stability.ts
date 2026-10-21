import type { CornerHistoryEntry, StabilityOptions } from "./demo.model";

/**
 * Decides when to capture in a camera loop: the document must have been
 * found in each of the last `frames` detections, and no corner may have
 * moved more than `tolerance` pixels from one detection to the next.
 *
 * @param history - Detections, oldest first.
 * @param options - How many detections, and how still.
 * @returns `true` when it's time to capture.
 */
export function isStable(
  history: readonly CornerHistoryEntry[],
  { frames = 8, tolerance = 6 }: StabilityOptions = {},
): boolean {
  if (history.length < frames) return false;
  const recent = history.slice(-frames);
  for (let i = 0; i < recent.length; i++) {
    const corners = recent[i];
    if (!corners) return false;
    const before = recent[i - 1];
    if (!before) continue;
    for (let c = 0; c < 4; c++) {
      if (Math.hypot(corners[c].x - before[c].x, corners[c].y - before[c].y) > tolerance) {
        return false;
      }
    }
  }
  return true;
}
