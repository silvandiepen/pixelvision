import { FaceNeuralError } from "./errors";
import type { NeuralFace, OrtTensorLike } from "./faceDetector.model";

/** The model's fixed input size. */
export const INPUT_SIZE = 640;
const STRIDES = [8, 16, 32] as const;

/** Each output family and the values it holds per grid cell. */
const OUTPUT_WIDTHS = [
  ["cls", 1],
  ["obj", 1],
  ["bbox", 4],
  ["kps", 10],
] as const;

/** Raw model outputs by name (`cls_8`, `obj_8`, `bbox_8`, `kps_8`, …). */
export type YuNetOutputs = Record<string, { data: ArrayLike<number> }>;

/**
 * Throws the error for a model output that can't be decoded.
 *
 * @param message - What is wrong with which output.
 * @throws {FaceNeuralError} Always, with code `invalid-output`.
 */
function fail(message: string): never {
  throw new FaceNeuralError(
    "invalid-output",
    `createFaceDetector: ${message}; is this the YuNet model?`,
  );
}

/**
 * Checks raw session outputs before they are decoded. Every output the decoder reads must be
 * present, hold float32 data, have the shape `[1, cells, width]` for its stride (`cells` is
 * `(640 / stride)²`, `width` is 1 for `cls` and `obj`, 4 for `bbox` and 10 for `kps`), hold
 * exactly that many values, and contain only finite numbers. Anything else means a different,
 * damaged or replaced model, and decoding it would produce garbage geometry.
 *
 * @param outputs - Raw session outputs by name.
 * @returns The outputs the decoder reads.
 * @throws {FaceNeuralError} With code `invalid-output`, naming the first output that fails.
 */
export const validateYuNetOutputs = (outputs: Record<string, OrtTensorLike>): YuNetOutputs => {
  const result: YuNetOutputs = {};
  for (const stride of STRIDES) {
    const cells = (INPUT_SIZE / stride) ** 2;
    for (const [family, width] of OUTPUT_WIDTHS) {
      const name = `${family}_${stride}`;
      const tensor = outputs[name];
      if (!tensor) fail(`output ${name} is missing`);
      const { data, dims } = tensor;
      if (!(data instanceof Float32Array)) fail(`output ${name} isn't float32`);
      const shape = Array.isArray(dims) ? dims.join(", ") : String(dims);
      if (shape !== `1, ${cells}, ${width}`) {
        fail(`output ${name} has shape [${shape}], expected [1, ${cells}, ${width}]`);
      }
      const values = data as Float32Array;
      if (values.length !== cells * width) {
        fail(`output ${name} holds ${values.length} values, expected ${cells * width}`);
      }
      for (let i = 0; i < values.length; i++) {
        if (!Number.isFinite(values[i])) fail(`output ${name} holds a non-finite value at ${i}`);
      }
      result[name] = { data: values };
    }
  }
  return result;
};

/**
 * Turns YuNet's raw outputs into faces in model-input pixels (OpenCV's
 * `FaceDetectorYN` decoding): per stride and grid cell, score is
 * `sqrt(cls · obj)`, the box is a centre offset plus log size, and the five
 * landmarks are offsets from the cell.
 *
 * @param outputs - Model outputs.
 * @param scoreThreshold - Minimum score.
 * @returns Candidate faces, unsorted.
 */
export const decodeYuNet = (outputs: YuNetOutputs, scoreThreshold: number): NeuralFace[] => {
  const faces: NeuralFace[] = [];
  const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
  for (const stride of STRIDES) {
    const cols = INPUT_SIZE / stride;
    const cls = outputs[`cls_${stride}`].data;
    const obj = outputs[`obj_${stride}`].data;
    const bbox = outputs[`bbox_${stride}`].data;
    const kps = outputs[`kps_${stride}`].data;
    for (let index = 0; index < cls.length; index++) {
      const score = Math.sqrt(clamp(cls[index]) * clamp(obj[index]));
      if (score < scoreThreshold) continue;
      const row = Math.floor(index / cols);
      const col = index % cols;
      const cx = (col + bbox[index * 4]) * stride;
      const cy = (row + bbox[index * 4 + 1]) * stride;
      const width = Math.exp(bbox[index * 4 + 2]) * stride;
      const height = Math.exp(bbox[index * 4 + 3]) * stride;
      const point = (n: number) => ({
        x: (kps[index * 10 + n * 2] + col) * stride,
        y: (kps[index * 10 + n * 2 + 1] + row) * stride,
      });
      faces.push({
        x: cx - width / 2,
        y: cy - height / 2,
        width,
        height,
        score,
        landmarks: {
          rightEye: point(0),
          leftEye: point(1),
          noseTip: point(2),
          mouthRight: point(3),
          mouthLeft: point(4),
        },
      });
    }
  }
  return faces;
};

/**
 * Overlap of two boxes: intersection over union.
 *
 * @param a - First box.
 * @param b - Second box.
 * @returns 0 (disjoint) to 1 (identical).
 */
export const iou = (a: NeuralFace, b: NeuralFace): number => {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.width * a.height + b.width * b.height - intersection;
  return union > 0 ? intersection / union : 0;
};

/**
 * Keeps the best face of every overlapping group (non-maximum suppression).
 *
 * @param faces - Candidates.
 * @param threshold - IoU above which the weaker face is dropped.
 * @param maxFaces - Maximum to keep.
 * @returns Kept faces, best first.
 */
export const suppress = (
  faces: NeuralFace[],
  threshold: number,
  maxFaces: number,
): NeuralFace[] => {
  const sorted = [...faces].sort((a, b) => b.score - a.score);
  const kept: NeuralFace[] = [];
  for (const face of sorted) {
    if (kept.length >= maxFaces) break;
    if (kept.every((k) => iou(k, face) <= threshold)) kept.push(face);
  }
  return kept;
};
