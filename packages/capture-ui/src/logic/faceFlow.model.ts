import type { ChallengePreset, ChallengeStep, HeadPose } from "pixelvision";
import type { FaceGuidance } from "./geometry.model";
import type { LabelKey } from "./labels.model";
import type { QualityIssue } from "./quality.model";

/**
 * Where the selfie flow is. `finishing`: the steps are done, but no frame
 * good enough to capture has been kept yet; the flow waits for one (or
 * the timeout).
 */
export type FacePhase = "searching" | "aligning" | "challenge" | "finishing" | "done" | "failed";

/** Colour state of the face guide. */
export type GuideTone = "idle" | "found" | "aligned" | "hold" | "success" | "error";

/** A direction to turn or tilt, from the person's own point of view, or either side. */
export type TurnHint = "left" | "right" | "up" | "down" | "either";

/** Options for {@link createFaceFlow}. */
export interface FaceFlowOptions {
  /** Matching detections a step (or the alignment) needs (default 3). */
  holdFrames?: number;
  /**
   * Recent detections with a face that are considered (default
   * `holdFrames * 2`): a step completes once `holdFrames` of them match,
   * so one flickering detection slows progress instead of resetting it.
   */
  windowFrames?: number;
  /** Fail after this many ms without finishing (default 45 000; 0 or less disables). */
  timeoutMs?: number;
  /**
   * The challenge after the alignment: a preset (`"head-turn"`, `"head-circle"`, `"motion"`,
   * `"none"`) or a list of steps. `true` is `"head-turn"`, `false` is `"none"`: the flow
   * finishes once the face is aligned (default `"head-turn"`). With a directional source, the
   * head turn's `side` and `other-side` become `firstTurn` and its opposite.
   */
  steps?: boolean | ChallengePreset | readonly ChallengeStep[];
  /** Frames with natural movement the `move` step needs (default `holdFrames * 4`). */
  moveFrames?: number;
  /**
   * The pose source reports `"turned-left"` / `"turned-right"` (landmark
   * detectors), so instructions can name the direction (default `false`).
   */
  directional?: boolean;
  /** With a directional source, the side to ask for first (default `"left"`). */
  firstTurn?: "left" | "right";
  /** A step without progress for this long shows one helper hint, in ms (default 6000). */
  stallMs?: number;
  /**
   * After each accepted step, hold the "accepted" moment (ring full, check
   * mark) for this long before the next instruction, in ms (default 900).
   * Detections during the pause are ignored.
   */
  acceptPauseMs?: number;
  /**
   * How long a positional hint must persist before it shows, in ms
   * (default 700). "Keep your face in the oval" waits at least 1200 ms, so
   * brief detection gaps never show.
   */
  hintDelayMs?: number;
  /** How long a shown hint or guide colour stays at least, in ms (default 1500). */
  hintHoldMs?: number;
  /** Clock, injectable for tests (default `Date.now`). */
  now?: () => number;
}

/** One detection's input to the flow. */
export interface FaceFlowInput {
  pose: HeadPose;
  guidance: FaceGuidance;
  /**
   * Why this frame's face region isn't good enough to keep (from
   * `checkQuality`), or `null` / omitted when it is. A frame with an issue
   * is never `frontal`, and the issue shows as a settled hint.
   */
  quality?: QualityIssue | null;
  /**
   * Faces of a meaningful size in the frame, the main face included (from
   * `selectMainFace`; default 1). With more than one, the frame doesn't
   * count towards any step, isn't `frontal`, the flow doesn't finish, and
   * "Make sure only you are in the frame" shows as a settled hint.
   */
  faceCount?: number;
  /**
   * How much the face region changed since the previous detection, 0–1 (pixelvision's
   * `measureMotion`). Only the `move` step uses it.
   */
  motion?: number;
  /**
   * Whether a good frame has been kept for the capture so far (default
   * `true`). When the steps finish without one, the flow waits in the
   * `finishing` phase until this is true.
   */
  kept?: boolean;
}

/** The flow's state after a detection. */
export interface FaceFlowState {
  phase: FacePhase;
  /** The challenge step, while the challenge runs. */
  step?: ChallengeStep;
  /** Completed challenge steps. */
  stepsDone: number;
  /** Total challenge steps; 0 without a challenge. */
  totalSteps: number;
  /** 0–1: overall progress for the ring around the guide. */
  progress: number;
  /** 0–1: how far the current step (or the alignment) is. */
  hold: number;
  /** The main instruction. Changes only when the step changes. */
  message: LabelKey;
  /**
   * A smaller, secondary line: positional guidance once it has persisted,
   * or one helper hint when the step stalls. Settled, so it doesn't flicker.
   */
  hint?: LabelKey;
  /**
   * A step was just accepted: show the acceptance moment. `stepsDone`
   * already counts it, `step` is the next one, and `message` still says
   * the accepted step until the pause ends.
   */
  accepted: boolean;
  /** The current step hasn't progressed for `stallMs`. */
  stalled: boolean;
  /** Colour state of the guide. Settled, so it doesn't flicker. */
  tone: GuideTone;
  /** Which way to show the turn arrow, during a turn step. */
  turn?: TurnHint;
  /**
   * This frame is a good frontal frame to keep as the capture: one face,
   * facing the camera, aligned and without a quality issue.
   */
  frontal: boolean;
}

/** The selfie flow: alignment, challenge, done. */
export interface FaceFlow {
  /** The challenge's steps, presets resolved and sides made directional. */
  readonly steps: readonly ChallengeStep[];
  /** Advances with one detection. */
  update: (input: FaceFlowInput) => FaceFlowState;
  /** The current state. */
  readonly state: FaceFlowState;
  /** Starts over, restarting the timeout. */
  reset: () => void;
}
