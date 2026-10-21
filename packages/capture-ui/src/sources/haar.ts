import { detectHeadPose, grayscale } from "pixelvision";
import type {
  FaceObservation,
  FrameImage,
  HaarPoseSourceOptions,
  PoseSource,
} from "./source.model";

/**
 * Detects the head pose in one RGBA frame with pixelvision's HAAR
 * cascades, and every face in view. Shared by the main-thread source and
 * the worker.
 *
 * @param frame - RGBA pixels.
 * @param options - Cascades and `detectHeadPose` options.
 * @returns The observation: the chosen face's pose and box, and every face found.
 */
export function detectWithHaar(frame: FrameImage, options: HaarPoseSourceOptions): FaceObservation {
  const { cascades, ...poseOptions } = options;
  const { pose, face, faces } = detectHeadPose(grayscale(frame), cascades, poseOptions);
  if (!face) return { pose };
  const boxes = faces.map(({ x, y, width, height }) => ({ x, y, width, height }));
  return { pose, box: boxes[0], faces: boxes };
}

/**
 * The default pose source: pixelvision's frontal and profile HAAR
 * cascades on the main thread. Works with only `pixelvision` installed.
 * HAAR tells a frontal face from a profile but not which side, so turn
 * instructions say "one side" and "the other side".
 *
 * @param options - Cascades (`frontalFace`, `profileFace`) and `detectHeadPose` options.
 * @returns The pose source.
 *
 * @example
 * import { frontalFace } from "pixelvision/cascades/frontal-face";
 * import { profileFace } from "pixelvision/cascades/profile-face";
 * element.source = haarPoseSource({ cascades: { frontal: frontalFace, profile: profileFace } });
 */
export function haarPoseSource(options: HaarPoseSourceOptions): PoseSource {
  return { detect: (frame) => detectWithHaar(frame, options), directional: false };
}
