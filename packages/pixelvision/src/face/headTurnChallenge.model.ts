import type { HeadPose } from "./headPose.model";

/** A step the person must complete. */
export type HeadTurnStep =
  "face-camera" | "turn-one-side" | "turn-other-side" | "face-camera-again";

/** Options for {@link createHeadTurnChallenge}. */
export interface HeadTurnChallengeOptions {
  /** Consecutive frames a pose must hold to count (default 3). */
  holdFrames?: number;
  /** Give up after this many milliseconds (default 30 000). */
  timeoutMs?: number;
  /** Clock, injectable for tests (default `Date.now`). */
  now?: () => number;
}

/** The challenge's state after a frame. */
export interface HeadTurnState {
  /** Current step, or `"done"` / `"failed"`. */
  step: HeadTurnStep | "done" | "failed";
  /** Instruction to show the person. */
  instruction: string;
  /** Completed steps, 0–4. */
  progress: number;
  /** The first side shown, once known. */
  firstSide?: Exclude<HeadPose, "frontal" | "none">;
}

/** A running challenge: feed it the pose of every frame. */
export interface HeadTurnChallenge {
  /** Advances with this frame's pose and returns the new state. */
  update: (pose: HeadPose) => HeadTurnState;
  /** The current state. */
  readonly state: HeadTurnState;
  /** Starts over. */
  reset: () => void;
}
