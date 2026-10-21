import type { Detection, HaarCascade } from "../detect/haar.model";

/**
 * Which way a face points in the image: at the camera, or turned so the
 * profile cascade matches the frame as is (`"profile"`) or mirrored
 * (`"mirrored-profile"`). Which of the two is the person's left depends on
 * the cascade and on whether the frame is mirrored; the head-turn
 * challenge only needs both to appear. Landmark-based detectors (such as
 * `@pixelvision/face-neural`) report `"turned-left"` / `"turned-right"`
 * from the person's point of view instead.
 */
export type HeadPose =
  "frontal" | "profile" | "mirrored-profile" | "turned-left" | "turned-right" | "none";

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
  /** Minimum merged detections for a frontal face (default 2). */
  minNeighbors?: number;
  /**
   * Minimum merged detections for a profile (default 1). The profile
   * cascade was trained on near-full side views and rarely fires more than
   * once on a moderate turn, so it's accepted on a single detection; hold
   * the pose for a few frames (as the head-turn challenge does) to filter
   * stray hits.
   */
  profileMinNeighbors?: number;
  /** Scale step between window sizes (default 1.1; smaller finds more poses, slower). */
  scaleFactor?: number;
  /**
   * Edge pruning passed to {@link detectHaar} (default `false`). Pruning
   * skips smooth windows, which can include evenly lit faces, and at
   * camera-frame sizes computing the edge map costs more than it saves.
   */
  edgeDensity?: number | false;
}

/** The pose seen in one frame. */
export interface HeadPoseResult {
  pose: HeadPose;
  /** The face's box in image pixels, when one was found. */
  face?: Detection;
}
