import type { ImageLike } from "pixelvision";
import { decodeYuNet, INPUT_SIZE, suppress } from "./decode";
import type {
  CreateFaceDetectorOptions,
  DetectFacesOptions,
  FaceDetector,
  NeuralFace,
} from "./faceDetector.model";
import { letterbox } from "./preprocess";

/**
 * Loads YuNet (OpenCV Zoo, MIT) and returns a detector that finds faces
 * with five landmarks: eyes, nose tip and mouth corners. Far more robust
 * than HAAR cascades to pose, lighting and partial occlusion.
 *
 * Bring your own onnxruntime: `onnxruntime-web` in browsers and workers,
 * `onnxruntime-node` in Node, `onnxruntime-react-native` on phones.
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
  const session = await ort.InferenceSession.create(model, sessionOptions);
  return {
    async detect(image: ImageLike, detectOptions: DetectFacesOptions = {}): Promise<NeuralFace[]> {
      const { scoreThreshold = 0.7, nmsThreshold = 0.3, maxFaces = 10 } = detectOptions;
      const { data, scale } = letterbox(image);
      const outputs = await session.run({
        input: new ort.Tensor("float32", data, [1, 3, INPUT_SIZE, INPUT_SIZE]),
      });
      const faces = suppress(decodeYuNet(outputs, scoreThreshold), nmsThreshold, maxFaces);
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
