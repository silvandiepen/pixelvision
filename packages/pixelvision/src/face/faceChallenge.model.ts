import type { HeadPose } from "./headPose.model";

/**
 * Something the person must do. Directions are from the person's own point
 * of view.
 *
 * - `frontal`: look at the camera.
 * - `left`, `right`, `up`, `down`: turn or tilt the head that way. These
 *   need a pose source that reports direction, such as
 *   `@pixelvision/face-neural`.
 * - `side`: turn to either side; works with `detectHeadPose` (HAAR), which
 *   can't tell left from right.
 * - `other-side`: turn to the side opposite the last `side` step.
 * - `move`: keep the face in view while it moves naturally; needs a motion
 *   measure for each frame. It rejects a frozen or repeated picture, not a
 *   photo held up and moved by hand.
 */
export type ChallengeStep =
  "frontal" | "left" | "right" | "up" | "down" | "side" | "other-side" | "move";

/** Ready-made challenges. */
export type ChallengePreset = "none" | "motion" | "head-turn" | "head-circle";

/** One frame's input: a pose, or a pose with how much the face moved. */
export interface FaceObservation {
  pose: HeadPose;
  /**
   * How much the face region changed since the previous frame, 0–1 (mean
   * absolute difference of its gray pixels / 255). Only the `move` step
   * uses it.
   */
  motion?: number;
}

/** Options for {@link createFaceChallenge}. */
export interface FaceChallengeOptions {
  /** The steps, in order, or a preset name (default `"head-turn"`). */
  steps?: readonly ChallengeStep[] | ChallengePreset;
  /** Matching frames a step needs before it counts (default 3). */
  holdFrames?: number;
  /**
   * How many recent frames with a face are considered (default
   * `holdFrames * 2`). A step completes once `holdFrames` of them match,
   * so one stray detection slows progress instead of resetting it. Frames
   * without a face are neutral.
   */
  windowFrames?: number;
  /** Frames with natural movement the `move` step needs (default `holdFrames * 4`). */
  moveFrames?: number;
  /**
   * Smallest `motion` that counts as natural movement (default 0.004,
   * about 1 gray level on average). A frozen or repeated frame stays below it.
   */
  minMotion?: number;
  /** Give up after this many milliseconds (default 30 000; `Infinity` disables). */
  timeoutMs?: number;
  /** Clock, injectable for tests (default `Date.now`). */
  now?: () => number;
}

/** The challenge's state after a frame. */
export interface FaceChallengeState {
  /** The current step, or `"done"` / `"failed"`. */
  step: ChallengeStep | "done" | "failed";
  /** Index of the current step; equals `total` once done. */
  index: number;
  /** Completed steps. */
  progress: number;
  /** Number of steps. */
  total: number;
  /** How far the current step is, 0–1. */
  holdProgress: number;
  /** The pose that completed the last `side` step, which `other-side` must mirror. */
  side?: Exclude<HeadPose, "frontal" | "none" | "looking-up" | "looking-down">;
}

/** A running challenge: feed it every frame. */
export interface FaceChallenge {
  /** Advances with this frame and returns the new state. */
  update: (observation: HeadPose | FaceObservation) => FaceChallengeState;
  /** The current state. */
  readonly state: FaceChallengeState;
  /** The steps, presets resolved. */
  readonly steps: readonly ChallengeStep[];
  /** Starts over. */
  reset: () => void;
}
