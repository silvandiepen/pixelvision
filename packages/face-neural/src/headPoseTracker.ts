import type { HeadPose } from "pixelvision";
import type { NeuralFace } from "./faceDetector.model";
import { estimateHeadYaw } from "./headYaw";
import type {
  FaceGeometry,
  HeadPoseTracker,
  HeadPoseTrackerOptions,
} from "./headPoseTracker.model";

/**
 * Measures where a face's features sit.
 *
 * @param face - A face with landmarks.
 * @returns Its yaw, the nose's height in the box and the box's proportions.
 */
export function measureFaceGeometry(face: NeuralFace): FaceGeometry {
  return {
    yaw: estimateHeadYaw(face),
    noseHeight: face.height > 0 ? (face.landmarks.noseTip.y - face.y) / face.height : 0,
    aspect: face.width > 0 ? face.height / face.width : 0,
  };
}

/**
 * Tracks a person's head pose from frame to frame, including looking up
 * and down, which five landmarks can't tell reliably on their own: faces
 * differ too much. It first learns the person's frontal geometry from a few
 * frames facing the camera, then reports a tilt relative to it. Looking up
 * raises the nose in the face box; looking down flattens the box, as the
 * top of the head comes into view and the chin goes out of it.
 *
 * The thresholds were set on one AI-generated person at about 15° and 30°
 * of tilt (see MODELS.md). Up is clear at 15°; down needs a clearer nod.
 * Check them on your own users before you rely on them.
 *
 * @param options - Turn and tilt thresholds, mirroring, baseline frames.
 * @returns The tracker.
 *
 * @example
 * const tracker = createHeadPoseTracker();
 * onFrame(async (frame) => {
 *   const [face] = await detector.detect(frame);
 *   challenge.update(tracker.update(face));
 * });
 */
export function createHeadPoseTracker(options: HeadPoseTrackerOptions = {}): HeadPoseTracker {
  const {
    threshold = 18,
    mirrored = false,
    upThreshold = 0.035,
    downThreshold = 0.1,
    baselineFrames = 3,
    adapt = 0.1,
  } = options;
  let baseline: FaceGeometry | undefined;
  let seed: FaceGeometry[] = [];

  /** Moves the frontal reference a little towards a new frontal frame. */
  const learn = (geometry: FaceGeometry): void => {
    if (!baseline) {
      seed.push(geometry);
      if (seed.length < baselineFrames) return;
      const mean = (key: keyof FaceGeometry) =>
        seed.reduce((sum, g) => sum + g[key], 0) / seed.length;
      baseline = { yaw: mean("yaw"), noseHeight: mean("noseHeight"), aspect: mean("aspect") };
      seed = [];
      return;
    }
    baseline = {
      yaw: baseline.yaw + (geometry.yaw - baseline.yaw) * adapt,
      noseHeight: baseline.noseHeight + (geometry.noseHeight - baseline.noseHeight) * adapt,
      aspect: baseline.aspect + (geometry.aspect - baseline.aspect) * adapt,
    };
  };

  return {
    update(face) {
      if (!face) return "none";
      const geometry = measureFaceGeometry(face);
      const yaw = geometry.yaw * (mirrored ? -1 : 1);
      // In an unmirrored camera image the person's left is on the image's right.
      if (Math.abs(yaw) >= threshold) return yaw > 0 ? "turned-left" : "turned-right";
      let pose: HeadPose = "frontal";
      if (baseline) {
        const rise = baseline.noseHeight - geometry.noseHeight;
        const flatten = baseline.aspect - geometry.aspect;
        if (rise >= upThreshold) pose = "looking-up";
        else if (flatten >= downThreshold) pose = "looking-down";
      }
      // Only frames well inside the turn threshold teach the reference, so a held tilt or a
      // half turn doesn't become "frontal". People rarely face a camera dead straight: allow ~10°.
      if (pose === "frontal" && Math.abs(yaw) < threshold * 0.6) learn(geometry);
      return pose;
    },
    get baseline() {
      return baseline;
    },
    reset() {
      baseline = undefined;
      seed = [];
    },
  };
}
