import type { ImageLike } from "pixelvision";
import { decodeYuNet, INPUT_SIZE, suppress, validateYuNetOutputs } from "./decode";
import { FaceNeuralError } from "./errors";
import type {
  CreateFaceDetectorOptions,
  DetectFacesOptions,
  FaceDetector,
  NeuralFace,
} from "./faceDetector.model";
import { letterbox } from "./preprocess";

/** The most faces one `detect` call may return. */
export const MAX_FACES_LIMIT = 100;

/**
 * Fills in and checks detection options: both thresholds must be finite numbers from 0 to 1,
 * and `maxFaces` a whole number from 1 to {@link MAX_FACES_LIMIT}.
 *
 * @param options - The caller's options.
 * @returns The options with defaults applied.
 * @throws {FaceNeuralError} With code `invalid-option`, naming the option that is out of range.
 */
export const resolveDetectOptions = (
  options: DetectFacesOptions = {},
): Required<DetectFacesOptions> => {
  const { scoreThreshold = 0.7, nmsThreshold = 0.3, maxFaces = 10 } = options;
  for (const [name, value] of [
    ["scoreThreshold", scoreThreshold],
    ["nmsThreshold", nmsThreshold],
  ] as const) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
      throw new FaceNeuralError(
        "invalid-option",
        `detect: ${name} must be a number from 0 to 1, got ${value}`,
      );
    }
  }
  if (!Number.isInteger(maxFaces) || maxFaces < 1 || maxFaces > MAX_FACES_LIMIT) {
    throw new FaceNeuralError(
      "invalid-option",
      `detect: maxFaces must be a whole number from 1 to ${MAX_FACES_LIMIT}, got ${maxFaces}`,
    );
  }
  return { scoreThreshold, nmsThreshold, maxFaces };
};

/**
 * Loads YuNet (OpenCV Zoo, MIT) and returns a detector that finds faces
 * with five landmarks: eyes, nose tip and mouth corners. Far more robust
 * than HAAR cascades to pose, lighting and partial occlusion.
 *
 * Bring your own onnxruntime: `onnxruntime-web` in browsers and workers,
 * `onnxruntime-node` in Node, `onnxruntime-react-native` on phones.
 *
 * `detect` validates its input and the model's outputs before decoding and throws a
 * {@link FaceNeuralError} instead of returning garbage: `invalid-image` for a malformed image,
 * `invalid-option` for out-of-range thresholds or `maxFaces`, `invalid-output` for outputs that
 * don't match YuNet.
 *
 * @param options - The onnxruntime module, the model and session options.
 * @returns The detector, once the model has loaded.
 *
 * @example
 * import * as ort from "onnxruntime-web";
 * import modelUrl from "@pixelvision/face-neural/models/yunet.onnx?url";
 * const detector = await createFaceDetector({ ort, model: modelUrl });
 * const [face] = await detector.detect(context.getImageData(0, 0, width, height));
 */
export async function createFaceDetector(
  options: CreateFaceDetectorOptions,
): Promise<FaceDetector> {
  const { ort, model, sessionOptions } = options;
  const session =
    typeof model === "string"
      ? await ort.InferenceSession.create(model, sessionOptions)
      : await ort.InferenceSession.create(
          model instanceof Uint8Array ? model : new Uint8Array(model),
          sessionOptions,
        );
  return {
    async detect(image: ImageLike, detectOptions: DetectFacesOptions = {}): Promise<NeuralFace[]> {
      const { scoreThreshold, nmsThreshold, maxFaces } = resolveDetectOptions(detectOptions);
      const { data, scale } = letterbox(image);
      const outputs = await session.run({
        input: new ort.Tensor("float32", data, [1, 3, INPUT_SIZE, INPUT_SIZE]),
      });
      const faces = suppress(
        decodeYuNet(validateYuNetOutputs(outputs), scoreThreshold),
        nmsThreshold,
        maxFaces,
      );
      const back = (p: { x: number; y: number }) => ({ x: p.x / scale, y: p.y / scale });
      return faces.map((face) => ({
        x: face.x / scale,
        y: face.y / scale,
        width: face.width / scale,
        height: face.height / scale,
        score: face.score,
        landmarks: {
          rightEye: back(face.landmarks.rightEye),
          leftEye: back(face.landmarks.leftEye),
          noseTip: back(face.landmarks.noseTip),
          mouthRight: back(face.landmarks.mouthRight),
          mouthLeft: back(face.landmarks.mouthLeft),
        },
      }));
    },
  };
}
