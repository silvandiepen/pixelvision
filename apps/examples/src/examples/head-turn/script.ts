import type { HeadPose } from "pixelvision";

/**
 * A scripted run of the challenge, one pose per frame: look at the camera,
 * a stray frame without a face, turn one way, turn the other way, look
 * back. Each pose is held for `holdFrames` frames.
 *
 * @param holdFrames - Frames each pose is held.
 * @returns The poses, frame by frame.
 */
export function scriptedPoses(holdFrames: number): HeadPose[] {
  const hold = (pose: HeadPose) => Array.from({ length: holdFrames }, () => pose);
  return [
    ...hold("frontal"),
    "none",
    ...hold("profile"),
    ...hold("mirrored-profile"),
    ...hold("frontal"),
  ];
}
