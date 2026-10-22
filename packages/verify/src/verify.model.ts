import type { HeadPose, RGBAImage } from "pixelvision";
import type { SignedChallenge } from "./challenge.model";

/** One frame the browser captured during the challenge. */
export interface EvidenceFrame {
  /** Milliseconds since the first frame, on the browser's clock. */
  time: number;
  /** The frame as a JPEG file. */
  jpeg: Uint8Array;
}

/** What the browser sends back: the challenge it was given, and the frames it took. */
export interface Evidence {
  challenge: SignedChallenge;
  /** In the order they were taken. */
  frames: EvidenceFrame[];
  /** The photo the capture kept, as a JPEG, when sent. */
  photo?: Uint8Array;
}

/** Where a face is, in frame pixels. */
export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** What a pose source sees in one frame. */
export interface PoseReading {
  pose: HeadPose;
  /** The face it describes, when it found one. */
  face?: FaceBox;
}

/**
 * Finds the head pose in a frame. The default runs pixelvision's HAAR
 * cascades; pass one built on `@pixelvision/face-neural` for challenges
 * with left, right, up and down.
 */
export type PoseSource = (frame: RGBAImage) => PoseReading | Promise<PoseReading>;

/** Remembers which one-time codes have been used. */
export interface CodeStore {
  /**
   * Marks a code as used.
   *
   * @param id - The challenge's code.
   * @param expiresAt - When the challenge expires; the code can be forgotten after.
   * @returns `false` when the code was already used.
   */
  use: (id: string, expiresAt: number) => boolean | Promise<boolean>;
}

/** Why a check failed. */
export type VerifyReason =
  /** The challenge wasn't signed with this secret, or was changed. */
  | "bad-signature"
  /** The evidence arrived after the challenge expired. */
  | "expired"
  /** This challenge's code was used before: every challenge can be tried once. */
  | "code-used"
  /** A challenge with directions came in, and no pose source that tells directions was given. */
  | "needs-direction-source"
  /** Fewer frames than the steps need. */
  | "too-few-frames"
  /** More frames than allowed. */
  | "too-many-frames"
  /** A frame is larger than allowed, in bytes or pixels. */
  | "frame-too-large"
  /** A frame isn't a JPEG that can be decoded. */
  | "bad-frame"
  /** The frames don't all have the same size: they don't come from one camera. */
  | "frames-differ"
  /** The frame times don't increase, or span longer than the challenge was valid. */
  | "bad-timing"
  /** Many frames are exact repeats of the one before: a frozen or looped picture. */
  | "frozen-frames"
  /** The face jumps across the frame between frames: spliced footage. */
  | "face-jumps"
  /** Not every step was done, in order, in the frames. */
  | "steps-not-done";

/** Options for {@link verifyEvidence}. */
export interface VerifyOptions {
  /** The secret the challenge was signed with. */
  secret: string;
  /** Where used codes are remembered (see `createMemoryCodeStore`; use a shared store with several servers). */
  codes: CodeStore;
  /** Finds the head pose in a frame (default: pixelvision's HAAR cascades). */
  poseSource?: PoseSource;
  /** Matching frames each step needs (default 2). */
  holdFrames?: number;
  /** Most frames accepted (default 240). */
  maxFrames?: number;
  /** Largest frame, in bytes (default 300 000). */
  maxFrameBytes?: number;
  /** Largest frame side, in pixels (default 1024). */
  maxFrameSide?: number;
  /** Clock, injectable for tests (default `Date.now`). */
  now?: () => number;
}

/** The outcome of {@link verifyEvidence}. */
export interface VerifyResult {
  /** Every check passed. */
  passed: boolean;
  /** Why it didn't; empty when it passed. */
  reasons: VerifyReason[];
  /** The challenge's code. */
  challengeId: string;
  /** Steps done in the frames, in order. */
  stepsDone: number;
  /** Steps the challenge asked for. */
  stepsTotal: number;
  /** Frames looked at. */
  framesChecked: number;
}
