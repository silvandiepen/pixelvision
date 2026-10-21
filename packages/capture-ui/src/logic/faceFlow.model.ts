import type { HeadPose, HeadTurnStep } from "pixelvision";
import type { FaceGuidance } from "./geometry.model";
import type { LabelKey } from "./labels.model";

/** Where the selfie flow is. */
export type FacePhase = "searching" | "aligning" | "challenge" | "done" | "failed";

/** Colour state of the face guide. */
export type GuideTone = "idle" | "found" | "aligned" | "hold" | "success" | "error";

/** A turn direction from the person's own point of view, or either side. */
export type TurnHint = "left" | "right" | "either";

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
  /** Run the head-turn challenge; when off, the flow finishes once the face is aligned (default `true`). */
  steps?: boolean;
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
}

/** The flow's state after a detection. */
export interface FaceFlowState {
  phase: FacePhase;
  /** The challenge step, while the challenge runs. */
  step?: HeadTurnStep;
  /** Completed challenge steps, 0–4. */
  stepsDone: number;
  /** Total challenge steps: 4, or 0 when steps are off. */
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
  /** This frame is a good frontal frame to keep as the capture. */
  frontal: boolean;
}

/** The selfie flow: alignment, head-turn challenge, done. */
export interface FaceFlow {
  /** Advances with one detection. */
  update: (input: FaceFlowInput) => FaceFlowState;
  /** The current state. */
  readonly state: FaceFlowState;
  /** Starts over, restarting the timeout. */
  reset: () => void;
}
