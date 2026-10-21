import type { Point } from "pixelvision";

/** Options for {@link createPointsTracker}. */
export interface PointsTrackerOptions {
  /** Time for the shown points to cover half the way to the target, in ms (default 70). */
  halfLifeMs?: number;
  /** Time to fade in or out when the target appears or disappears, in ms (default 220). */
  fadeMs?: number;
  /**
   * Snap instead of gliding when the target jumps further than this, as a
   * fraction of the points' spread (default 1.5): a different face or
   * document, not the same one moving.
   */
  snapDistance?: number;
  /**
   * Keep showing the last points, frozen, for this long after the target
   * disappears before fading out, in ms (default 0). Bridges brief
   * detection gaps instead of blinking.
   */
  holdMs?: number;
}

/** What to draw this animation frame. */
export interface TrackedPoints {
  points: Point[];
  /** 0 (hidden) to 1 (fully shown). */
  opacity: number;
}

/**
 * Glides drawn points towards the latest detection between detections, so
 * an overlay updated a few times a second animates smoothly at the display
 * rate.
 */
export interface PointsTracker {
  /** Sets the newest detection, or undefined when nothing was found. */
  setTarget: (points: readonly Point[] | undefined) => void;
  /** Advances to `now` (ms) and returns what to draw, or undefined when fully hidden. */
  step: (now: number) => TrackedPoints | undefined;
  /** Whether the points are still moving or fading. */
  readonly settled: boolean;
  /** Forgets everything. */
  reset: () => void;
}

/** Options for {@link createEasedNumber}. */
export interface EasedNumberOptions {
  /** Time to cover half the way to the target, in ms (default 150; 0 snaps). */
  halfLifeMs?: number;
  /**
   * Half-life while going down, in ms (default `halfLifeMs`): a longer one
   * makes a progress ring drain slowly instead of jumping back.
   */
  fallHalfLifeMs?: number;
  /** The starting value (default 0). */
  initial?: number;
}

/** A number that eases towards its target at the display rate (a progress ring). */
export interface EasedNumber {
  /** Sets where to go. */
  set: (target: number) => void;
  /** Jumps straight to a value. */
  snap: (value: number) => void;
  /** Advances to `now` (ms) and returns the shown value. */
  step: (now: number) => number;
  /** The target. */
  readonly target: number;
}
