import type { HaarCascade, Detection } from "../detect/haar.model";

/**
 * Which way a face points in the image: at the camera, or turned so the
 * profile cascade matches the frame as is (`"profile"`) or mirrored
 * (`"mirrored-profile"`). Which of the two is the person's left depends on
 * the cascade and on whether the frame is mirrored; the head-turn
 * challenge only needs both to appear.
 */
export type HeadPose = "frontal" | "profile" | "mirrored-profile" | "none";

/** Cascades for {@link detectHeadPose}. */
export interface HeadPoseCascades {
  /** From `pixelvision/cascades/frontal-face`. */
  frontal: HaarCascade;
  /** From `pixelvision/cascades/profile-face`. */
  profile: HaarCascade;
}

/** Options for {@link detectHeadPose}. */
export interface HeadPoseOptions {
  /** Work on a copy scaled so its longer side is at most this (default 320). */
  maxSize?: number;
  /** Smallest face as a fraction of the shorter image side (default 0.2). */
  minFaceSize?: number;
  /** Minimum merged detections per face (default 2). */
  minNeighbors?: number;
}

/** The pose seen in one frame. */
export interface HeadPoseResult {
  pose: HeadPose;
  /** The face's box in image pixels, when one was found. */
  face?: Detection;
}
