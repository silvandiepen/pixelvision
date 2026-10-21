import { describe, expect, it } from "vitest";
import { decodeYuNet, INPUT_SIZE, iou, suppress } from "./decode";
import type { NeuralFace } from "./faceDetector.model";

/** Empty outputs for all strides, with one cell filled in. */
const outputs = (
  stride: number,
  cell: number,
  values: { cls: number; obj: number; bbox: number[]; kps: number[] },
) => {
  const result: Record<string, { data: Float32Array }> = {};
  for (const s of [8, 16, 32]) {
    const cells = (INPUT_SIZE / s) ** 2;
    result[`cls_${s}`] = { data: new Float32Array(cells) };
    result[`obj_${s}`] = { data: new Float32Array(cells) };
    result[`bbox_${s}`] = { data: new Float32Array(cells * 4) };
    result[`kps_${s}`] = { data: new Float32Array(cells * 10) };
  }
  result[`cls_${stride}`].data[cell] = values.cls;
  result[`obj_${stride}`].data[cell] = values.obj;
  result[`bbox_${stride}`].data.set(values.bbox, cell * 4);
  result[`kps_${stride}`].data.set(values.kps, cell * 10);
  return result;
};

const face = (x: number, y: number, size: number, score: number): NeuralFace => ({
  x,
  y,
  width: size,
  height: size,
  score,
  landmarks: {
    rightEye: { x: 0, y: 0 },
    leftEye: { x: 0, y: 0 },
    noseTip: { x: 0, y: 0 },
    mouthRight: { x: 0, y: 0 },
    mouthLeft: { x: 0, y: 0 },
  },
});

describe("decodeYuNet", () => {
  it("decodes the box and landmarks of a cell", () => {
    // Stride 16, row 3, column 5 (40 cells per row).
    const raw = outputs(16, 3 * 40 + 5, {
      cls: 0.81,
      obj: 1,
      bbox: [0.5, 0.25, Math.log(4), Math.log(5)],
      kps: [0, 0, 1, 0, 0.5, 0.5, 0, 1, 1, 1],
    });

    const [found] = decodeYuNet(raw, 0.5);

    expect(found.score).toBeCloseTo(0.9, 6);
    // Centre (5.5 * 16, 3.25 * 16) = (88, 52), size 64 x 80.
    // (Outputs are float32, so compare approximately.)
    expect(found.x).toBeCloseTo(56, 4);
    expect(found.y).toBeCloseTo(12, 4);
    expect(found.width).toBeCloseTo(64, 4);
    expect(found.height).toBeCloseTo(80, 4);
    expect(found.landmarks.rightEye).toEqual({ x: 80, y: 48 });
    expect(found.landmarks.noseTip).toEqual({ x: 88, y: 56 });
    expect(found.landmarks.mouthLeft).toEqual({ x: 96, y: 64 });
  });

  it("drops cells below the threshold and clamps scores to 0-1", () => {
    expect(
      decodeYuNet(outputs(8, 0, { cls: 0.2, obj: 0.2, bbox: [0, 0, 0, 0], kps: [] }), 0.5),
    ).toEqual([]);
    const [clamped] = decodeYuNet(
      outputs(32, 0, { cls: 2, obj: -1, bbox: [0, 0, 0, 0], kps: [] }),
      0,
    );
    expect(clamped.score).toBe(0);
  });
});

describe("iou and suppress", () => {
  it("measures overlap", () => {
    expect(iou(face(0, 0, 10, 1), face(0, 0, 10, 1))).toBe(1);
    expect(iou(face(0, 0, 10, 1), face(20, 20, 10, 1))).toBe(0);
    expect(iou(face(0, 0, 10, 1), face(5, 0, 10, 1))).toBeCloseTo(1 / 3, 6);
    expect(iou(face(0, 0, 0, 1), face(0, 0, 0, 1))).toBe(0);
  });

  it("keeps the best of overlapping faces and limits the count", () => {
    const kept = suppress(
      [face(0, 0, 10, 0.5), face(1, 1, 10, 0.9), face(50, 50, 10, 0.7)],
      0.3,
      10,
    );

    expect(kept.map((f) => f.score)).toEqual([0.9, 0.7]);
    expect(suppress([face(0, 0, 10, 0.5), face(50, 50, 10, 0.7)], 0.3, 1)).toHaveLength(1);
  });
});
