import type {
  FaceNeuralModuleLike,
  HeadPoseTrackerLike,
  FaceObservation,
  LoadNeuralPoseSourceOptions,
  NeuralFaceLike,
  NeuralPoseSourceOptions,
  PoseSource,
} from "./source.model";

/** Most faces asked of the detector per frame. */
const MAX_FACES = 10;

/**
 * Wraps a `@pixelvision/face-neural` detector as a pose source: more
 * robust than HAAR, with landmarks to draw, directional turns ("turn your
 * head to your left") and, with `estimateHeadYaw`, the turn angle for a
 * live gauge. This package doesn't import face-neural or onnxruntime
 * here; pass them in, or use {@link loadNeuralPoseSource}.
 *
 * Frames are passed unmirrored, so the sides are the person's own. The
 * largest face found is the person's (its pose, box and landmarks are
 * reported); every face is listed in `faces`, so the element can tell
 * when more than one person is in view.
 *
 * With `createHeadPoseTracker`, the source also reports looking up and down,
 * relative to the person's own frontal face, learned at the start of each run.
 *
 * @param options - The detector, `headPoseFromFace`, optional `estimateHeadYaw` and
 *   `createHeadPoseTracker`, and the turn threshold.
 * @returns The pose source.
 * @throws {RangeError} When `threshold` isn't a number of degrees between 0 and 90.
 *
 * @example
 * import * as ort from "onnxruntime-web";
 * import { createFaceDetector, estimateHeadYaw, headPoseFromFace } from "@pixelvision/face-neural";
 * const detector = await createFaceDetector({ ort, model: modelUrl });
 * element.source = neuralPoseSource({ detector, headPoseFromFace, estimateHeadYaw });
 */
export function neuralPoseSource(options: NeuralPoseSourceOptions): PoseSource {
  const {
    detector,
    headPoseFromFace,
    estimateHeadYaw,
    createHeadPoseTracker,
    threshold = 18,
  } = options;
  if (typeof threshold !== "number" || !(threshold > 0 && threshold < 90)) {
    throw new RangeError(
      `neuralPoseSource: threshold must be between 0 and 90 degrees, got ${threshold}`,
    );
  }
  const tracker: HeadPoseTrackerLike | undefined = createHeadPoseTracker?.({ threshold });
  return {
    name: "yunet",
    directional: true,
    vertical: tracker !== undefined,
    turnThreshold: threshold,
    reset: () => tracker?.reset(),
    async detect(frame): Promise<FaceObservation> {
      const found = await detector.detect(frame, { maxFaces: MAX_FACES });
      // The largest face is the person's own; the others only tell that more people are in view.
      const face = found.reduce<NeuralFaceLike | undefined>(
        (largest, f) => (!largest || f.width > largest.width ? f : largest),
        undefined,
      );
      const pose = tracker
        ? tracker.update(face)
        : headPoseFromFace(face, { threshold, mirrored: false });
      if (!face) return { pose };
      const { rightEye, leftEye, noseTip, mouthRight, mouthLeft } = face.landmarks;
      const toBox = ({ x, y, width, height }: NeuralFaceLike) => ({ x, y, width, height });
      const box = toBox(face);
      const observation: FaceObservation = {
        pose,
        box,
        faces: [box, ...found.filter((f) => f !== face).map(toBox)],
        landmarks: [rightEye, leftEye, noseTip, mouthRight, mouthLeft],
        score: face.score,
      };
      if (estimateHeadYaw) observation.yaw = estimateHeadYaw(face);
      return observation;
    },
  };
}

/**
 * Loads `@pixelvision/face-neural` on demand, creates the YuNet detector
 * and returns it as a pose source with yaw. Use it for a "precise
 * detection" option, so neither the module, onnxruntime nor the model is
 * downloaded until someone asks for it.
 *
 * @param options - The onnxruntime module, the model, and optionally the face-neural module.
 * @returns The pose source, once the model has loaded.
 *
 * @example
 * selfie.preciseSource = async () =>
 *   loadNeuralPoseSource({ ort: await import("onnxruntime-web"), model: modelUrl });
 */
export async function loadNeuralPoseSource(
  options: LoadNeuralPoseSourceOptions,
): Promise<PoseSource> {
  const { ort, model, sessionOptions, threshold } = options;
  const faceNeural =
    options.faceNeural ??
    ((await import("@pixelvision/face-neural")) as unknown as FaceNeuralModuleLike);
  const detector = await faceNeural.createFaceDetector({ ort, model, sessionOptions });
  return neuralPoseSource({
    detector,
    headPoseFromFace: faceNeural.headPoseFromFace,
    estimateHeadYaw: faceNeural.estimateHeadYaw,
    createHeadPoseTracker: faceNeural.createHeadPoseTracker,
    threshold,
  });
}
