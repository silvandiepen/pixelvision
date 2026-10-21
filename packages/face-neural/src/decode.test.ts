import { describe, expect, it } from "vitest";
import { decodeYuNet, INPUT_SIZE, iou, suppress, validateYuNetOutputs } from "./decode";
import { FaceNeuralError } from "./errors";
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

/** Well-formed outputs for every stride, as onnxruntime returns them. */
const sessionOutputs = () => {
  const result: Record<string, { data: unknown; dims: number[] }> = {};
  for (const s of [8, 16, 32]) {
    const cells = (INPUT_SIZE / s) ** 2;
    for (const [family, width] of [
      ["cls", 1],
      ["obj", 1],
      ["bbox", 4],
      ["kps", 10],
    ] as const) {
      result[`${family}_${s}`] = { data: new Float32Array(cells * width), dims: [1, cells, width] };
    }
  }
  return result;
};

describe("validateYuNetOutputs", () => {
  it("passes well-formed outputs through and leaves extra outputs out", () => {
    const raw: Record<string, { data: unknown; dims: number[] }> = {
      ...sessionOutputs(),
      extra: { data: "ignored", dims: [] },
    };

    const checked = validateYuNetOutputs(raw);

    expect(Object.keys(checked)).toHaveLength(12);
    expect(checked.kps_32.data).toBe(raw.kps_32.data);
  });

  it("rejects a missing output", () => {
    const raw = sessionOutputs();
    delete raw.obj_16;

    expect(() => validateYuNetOutputs(raw)).toThrow(/output obj_16 is missing/);
  });

  it("rejects an output that isn't float32", () => {
    const raw = sessionOutputs();
    raw.bbox_8.data = new Float64Array(6400 * 4);

    expect(() => validateYuNetOutputs(raw)).toThrow(/output bbox_8 isn't float32/);
  });

  it("rejects an output with the wrong shape", () => {
    const flat = sessionOutputs();
    flat.kps_8.dims = [1, 64000];
    const odd = sessionOutputs();
    (odd.cls_8 as { dims: unknown }).dims = undefined;

    expect(() => validateYuNetOutputs(flat)).toThrow(
      /output kps_8 has shape \[1, 64000\], expected \[1, 6400, 10\]/,
    );
    expect(() => validateYuNetOutputs(odd)).toThrow(/output cls_8 has shape \[undefined\]/);
  });

  it("rejects an output whose element count doesn't match its shape", () => {
    const raw = sessionOutputs();
    raw.cls_32.data = new Float32Array(399);

    expect(() => validateYuNetOutputs(raw)).toThrow(/output cls_32 holds 399 values, expected 400/);
  });

  it.each([NaN, Infinity, -Infinity])("rejects an output holding %s", (value) => {
    const raw = sessionOutputs();
    (raw.bbox_16.data as Float32Array)[7] = value;

    expect(() => validateYuNetOutputs(raw)).toThrow(/output bbox_16 holds a non-finite value at 7/);
  });

  it("throws a typed error", () => {
    let caught: unknown;
    try {
      validateYuNetOutputs({});
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(FaceNeuralError);
    expect(caught).toMatchObject({ code: "invalid-output" });
  });
});
