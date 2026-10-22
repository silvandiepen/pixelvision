import type { HeadPose } from "pixelvision";
import type { NeuralFace } from "./faceDetector.model";

/** Where a face's features sit, the measures {@link createHeadPoseTracker} compares. */
export interface FaceGeometry {
  /** Degrees, positive when the nose points to the right of the image (see `estimateHeadYaw`). */
  yaw: number;
  /** Height of the nose tip in the face box, 0 at the top and 1 at the bottom. */
  noseHeight: number;
  /** The face box's height divided by its width. */
  aspect: number;
}

/** Options for {@link createHeadPoseTracker}. */
export interface HeadPoseTrackerOptions {
  /** Turn angle in degrees from which the head counts as turned (default 18). */
  threshold?: number;
  /** Set when the image is mirrored (a selfie preview), so left and right swap (default `false`). */
  mirrored?: boolean;
  /** How far the nose must rise in the face box, from the person's own frontal pose, for `looking-up` (default 0.035). */
  upThreshold?: number;
  /** How much the face box must flatten (height / width), from the frontal pose, for `looking-down` (default 0.1). */
  downThreshold?: number;
  /** Frontal frames that set the starting point before up and down are reported (default 3). */
  baselineFrames?: number;
  /** How quickly the frontal reference follows later frontal frames, 0–1 (default 0.1). */
  adapt?: number;
}

/** Tracks one person's head pose over frames, including looking up and down. */
export interface HeadPoseTracker {
  /** The pose of this frame's face (`"none"` without one). */
  update: (face: NeuralFace | undefined) => HeadPose;
  /** The person's frontal geometry once known. */
  readonly baseline: FaceGeometry | undefined;
  /** Forgets the person (a new person, or a new run). */
  reset: () => void;
}
