import type { Point } from "pixelvision";
import { maxDistance, spread } from "./smoothing";
import type { StabilityOptions, StabilityState, StabilityTracker } from "./stability.model";

/**
 * Creates a tracker that counts how many detections in a row stayed put:
 * every point moved less than `tolerance` × the reference size (by default
 * the points' own spread) since the previous detection.
 *
 * @param options - Frames to hold and movement tolerance.
 * @returns The tracker.
 *
 * @example
 * const steady = createStabilityTracker({ holdFrames: 10 });
 * const { stable, progress } = steady.update(found?.corners);
 * ring.style.setProperty("--progress", String(progress));
 * if (stable) capture();
 */
export function createStabilityTracker(options: StabilityOptions = {}): StabilityTracker {
  const { holdFrames = 8, tolerance = 0.025 } = options;
  const frames = Math.max(1, Math.round(holdFrames));
  let previous: Point[] | undefined;
  let count = 0;

  const state = (): StabilityState => ({
    stable: count >= frames,
    progress: Math.min(1, count / frames),
    count,
  });

  return {
    update(points, reference) {
      if (!points || points.length === 0) {
        previous = undefined;
        count = 0;
        return state();
      }
      const size = reference ?? spread(points);
      const steady =
        previous !== undefined &&
        previous.length === points.length &&
        maxDistance(previous, points) <= size * tolerance;
      count = steady ? count + 1 : 0;
      previous = points.map((p) => ({ x: p.x, y: p.y }));
      return state();
    },
    reset() {
      previous = undefined;
      count = 0;
    },
  };
}
