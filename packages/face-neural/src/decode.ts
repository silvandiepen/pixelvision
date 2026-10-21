import type { NeuralFace } from "./faceDetector.model";

/** The model's fixed input size. */
export const INPUT_SIZE = 640;
const STRIDES = [8, 16, 32] as const;

/** Raw model outputs by name (`cls_8`, `obj_8`, `bbox_8`, `kps_8`, …). */
export type YuNetOutputs = Record<string, { data: ArrayLike<number> }>;

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
