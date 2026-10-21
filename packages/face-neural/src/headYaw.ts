import type { HeadPose } from "pixelvision";
import type { NeuralFace } from "./faceDetector.model";
import type { HeadPoseFromFaceOptions } from "./headYaw.model";

/**
 * How far the nose tip sits in front of the eyes, relative to the distance
 * between the eyes; typical adult faces are around 0.6.
 */
const NOSE_DEPTH = 0.6;

/**
 * Estimates how far the head is turned left or right (yaw) from its
 * landmarks: the nose tip sits in front of the eyes, so turning shifts it
 * sideways relative to the eyes while the eyes appear closer together.
 *
 * @param face - A face with landmarks.
 * @returns Degrees; positive when the nose points to the right of the image.
 *
 * @example
 * const yaw = estimateHeadYaw(face); // ~0 facing the camera, ~±30 on a clear turn
 */
export function estimateHeadYaw(face: NeuralFace): number {
  const { rightEye, leftEye, noseTip } = face.landmarks;
  const eyeDistance = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y);
  if (eyeDistance === 0) return 0;
  const offset = noseTip.x - (rightEye.x + leftEye.x) / 2;
  return (Math.atan(offset / (eyeDistance * NOSE_DEPTH)) * 180) / Math.PI;
}

/**
 * Turns a face's landmarks into a head pose for the head-turn challenge:
 * `"frontal"`, or `"turned-left"` / `"turned-right"` from the person's own
 * point of view once the turn passes `threshold` degrees.
 *
 * @param face - A face with landmarks, or undefined when none was found.
 * @param options - Turn threshold, and whether the image is mirrored.
 * @returns The pose.
 *
 * @example
 * const pose = headPoseFromFace((await detector.detect(frame))[0]);
 * challenge.update(pose);
 */
export function headPoseFromFace(
  face: NeuralFace | undefined,
  options: HeadPoseFromFaceOptions = {},
): HeadPose {
  if (!face) return "none";
  const { threshold = 18, mirrored = false } = options;
  const yaw = estimateHeadYaw(face) * (mirrored ? -1 : 1);
  if (Math.abs(yaw) < threshold) return "frontal";
  // In an unmirrored camera image the person's left is on the image's right.
  return yaw > 0 ? "turned-left" : "turned-right";
}
