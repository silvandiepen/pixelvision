import type { FaceDetector, HeadPoseTracker, NeuralFace } from "@pixelvision/face-neural";
import type { HeadPose } from "pixelvision";

/** The neural face backend, loaded on demand. */
export interface NeuralBackend {
  detector: FaceDetector;
  /** Head turn in degrees; positive when the nose points to the image's right. */
  estimateHeadYaw: (face: NeuralFace) => number;
  /** The pose from the person's point of view. */
  headPoseFromFace: (face: NeuralFace | undefined, options?: { mirrored?: boolean }) => HeadPose;
  /** A tracker that also reports looking up and down, relative to the person's frontal face. */
  createHeadPoseTracker: () => HeadPoseTracker;
}
