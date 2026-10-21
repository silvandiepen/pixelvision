import type { Point } from "pixelvision";
import type {
  EasedNumber,
  EasedNumberOptions,
  PointsTracker,
  PointsTrackerOptions,
  TrackedPoints,
} from "./smoothing.model";

/**
 * Linear interpolation between two numbers.
 *
 * @param a - Start.
 * @param b - End.
 * @param t - Fraction of the way from `a` to `b`.
 * @returns The interpolated number.
 */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Linear interpolation between two points.
 *
 * @param a - Start.
 * @param b - End.
 * @param t - Fraction of the way from `a` to `b`.
 * @returns The interpolated point.
 */
export const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

/**
 * The fraction of the remaining distance to cover in `dtMs` for exponential
 * smoothing with the given half-life, so the motion looks the same at any
 * frame rate.
 *
 * @param dtMs - Time since the last step.
 * @param halfLifeMs - Time to cover half the distance; 0 or less snaps.
 * @returns A factor between 0 and 1.
 *
 * @example
 * shown = lerp(shown, target, smoothingFactor(16, 80));
 */
export function smoothingFactor(dtMs: number, halfLifeMs: number): number {
  if (halfLifeMs <= 0) return 1;
  if (dtMs <= 0) return 0;
  return 1 - Math.pow(2, -dtMs / halfLifeMs);
}

/**
 * Largest distance between matching points of two lists.
 *
 * @param a - First points.
 * @param b - Second points, same length.
 * @returns The largest distance.
 */
export function maxDistance(a: readonly Point[], b: readonly Point[]): number {
  let max = 0;
  for (let i = 0; i < a.length; i++) {
    max = Math.max(max, Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y));
  }
  return max;
}

/**
 * Size of a set of points: the diagonal of their bounding box.
 *
 * @param points - Points.
 * @returns The diagonal, 0 for no points.
 */
export function spread(points: readonly Point[]): number {
  if (points.length === 0) return 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return Math.hypot(maxX - minX, maxY - minY);
}

/**
 * Creates a tracker that eases drawn points (a face box's corners and
 * landmarks, a document's corners) towards each new detection, and fades
 * them in and out as detections appear and disappear.
 *
 * @param options - Half-life, fade time and snap distance.
 * @returns The tracker.
 *
 * @example
 * const tracker = createPointsTracker();
 * onDetection((corners) => tracker.setTarget(corners));
 * requestAnimationFrame(function frame(now) {
 *   const shown = tracker.step(now);
 *   if (shown) draw(shown.points, shown.opacity);
 *   requestAnimationFrame(frame);
 * });
 */
export function createPointsTracker(options: PointsTrackerOptions = {}): PointsTracker {
  const { halfLifeMs = 70, fadeMs = 220, snapDistance = 1.5, holdMs = 0 } = options;
  let target: Point[] | undefined;
  // How long the target has been missing, while holding the last points.
  let lostFor = 0;
  let shown: Point[] | undefined;
  let opacity = 0;
  let last: number | undefined;
  let moving = false;

  return {
    setTarget(points) {
      if (!points) {
        if (target) lostFor = 0;
        target = undefined;
        return;
      }
      target = points.map((p) => ({ x: p.x, y: p.y }));
      const jump =
        shown && shown.length === target.length
          ? maxDistance(shown, target) > spread(target) * snapDistance
          : true;
      if (!shown || opacity === 0 || jump) shown = target.map((p) => ({ ...p }));
    },
    step(now) {
      const dt = last === undefined ? 0 : now - last;
      last = now;
      if (!shown) return undefined;
      if (!target && lostFor < holdMs) {
        // Freeze in place during a brief gap.
        lostFor += dt;
        moving = false;
        return { points: shown.map((p) => ({ ...p })), opacity };
      }
      const fade = fadeMs <= 0 ? 1 : Math.min(1, dt / fadeMs);
      opacity = target ? Math.min(1, opacity + fade) : Math.max(0, opacity - fade);
      if (target) {
        const k = smoothingFactor(dt, halfLifeMs);
        shown = shown.map((p, i) => lerpPoint(p, target![i], k));
        moving = maxDistance(shown, target) > 0.25;
      } else {
        moving = false;
      }
      if (opacity === 0 && !target) {
        shown = undefined;
        return undefined;
      }
      const result: TrackedPoints = { points: shown.map((p) => ({ ...p })), opacity };
      return result;
    },
    get settled() {
      return !moving && (target ? opacity === 1 : opacity === 0 || lostFor < holdMs);
    },
    reset() {
      target = undefined;
      shown = undefined;
      opacity = 0;
      last = undefined;
      moving = false;
      lostFor = 0;
    },
  };
}

/**
 * Creates a number that eases towards its target, frame-rate independent:
 * a progress ring that fills smoothly although progress arrives a few
 * times a second, and can step back without jumping.
 *
 * @param options - Half-life and starting value.
 * @returns The eased number.
 *
 * @example
 * const ring = createEasedNumber({ halfLifeMs: 150 });
 * onDetection((p) => ring.set(p));
 * onFrame((now) => drawRing(ring.step(now)));
 */
export function createEasedNumber(options: EasedNumberOptions = {}): EasedNumber {
  const { halfLifeMs = 150, initial = 0 } = options;
  const fallHalfLifeMs = options.fallHalfLifeMs ?? halfLifeMs;
  let target = initial;
  let shown = initial;
  let last: number | undefined;
  return {
    set(value) {
      target = value;
    },
    snap(value) {
      target = value;
      shown = value;
    },
    step(now) {
      const dt = last === undefined ? 0 : now - last;
      last = now;
      const halfLife = target < shown ? fallHalfLifeMs : halfLifeMs;
      shown = lerp(shown, target, halfLife <= 0 ? 1 : smoothingFactor(dt, halfLife));
      if (Math.abs(shown - target) < 1e-3) shown = target;
      return shown;
    },
    get target() {
      return target;
    },
  };
}
