import type {
  FaceNeuralModuleLike,
  FaceObservation,
  LoadNeuralPoseSourceOptions,
  NeuralPoseSourceOptions,
  PoseSource,
} from "./source.model";

/**
 * Wraps a `@pixelvision/face-neural` detector as a pose source: more
 * robust than HAAR, with landmarks to draw, directional turns ("turn your
 * head to your left") and, with `estimateHeadYaw`, the turn angle for a
 * live gauge. This package doesn't import face-neural or onnxruntime
 * here; pass them in, or use {@link loadNeuralPoseSource}.
 *
 * Frames are passed unmirrored, so the sides are the person's own.
 *
 * @param options - The detector, `headPoseFromFace`, optional `estimateHeadYaw`, and the turn threshold.
 * @returns The pose source.
 *
 * @example
 * import * as ort from "onnxruntime-web";
 * import { createFaceDetector, estimateHeadYaw, headPoseFromFace } from "@pixelvision/face-neural";
 * const detector = await createFaceDetector({ ort, model: modelUrl });
 * element.source = neuralPoseSource({ detector, headPoseFromFace, estimateHeadYaw });
 */
export function neuralPoseSource(options: NeuralPoseSourceOptions): PoseSource {
  const { detector, headPoseFromFace, estimateHeadYaw, threshold = 18 } = options;
  return {
    name: "yunet",
    directional: true,
    turnThreshold: threshold,
    async detect(frame): Promise<FaceObservation> {
      const [face] = await detector.detect(frame, { maxFaces: 1 });
      const pose = headPoseFromFace(face, { threshold, mirrored: false });
      if (!face) return { pose };
      const { rightEye, leftEye, noseTip, mouthRight, mouthLeft } = face.landmarks;
      const observation: FaceObservation = {
        pose,
        box: { x: face.x, y: face.y, width: face.width, height: face.height },
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
    threshold,
  });
}
