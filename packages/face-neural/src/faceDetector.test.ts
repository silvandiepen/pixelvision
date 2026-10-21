import { readFileSync } from "node:fs";
import * as ort from "onnxruntime-node";
import { describe, expect, it } from "vitest";
import { createFaceDetector } from "./faceDetector";
import type { OrtLike } from "./faceDetector.model";

const model = readFileSync(new URL("../models/face_detection_yunet_2023mar.onnx", import.meta.url));

describe("createFaceDetector", () => {
  it("runs the real model and finds no face in a blank frame", async () => {
    const detector = await createFaceDetector({ ort, model });
    const blank = { width: 320, height: 240, data: new Uint8ClampedArray(320 * 240 * 4).fill(128) };

    expect(await detector.detect(blank)).toEqual([]);
  });

  it("loads a model from a path and rejects non-numeric outputs", async () => {
    const path = new URL("../models/face_detection_yunet_2023mar.onnx", import.meta.url).pathname;
    await expect(createFaceDetector({ ort, model: path })).resolves.toBeDefined();

    const odd: OrtLike = {
      InferenceSession: {
        create: async () => ({ run: async () => ({ cls_8: { data: ["x"], dims: [1] } }) }),
      },
      Tensor: class {} as unknown as OrtLike["Tensor"],
    };
    const detector = await createFaceDetector({ ort: odd, model: "model.onnx" });
    await expect(detector.detect({ width: 1, height: 1, data: [0, 0, 0, 255] })).rejects.toThrow(
      TypeError,
    );
  });

  it("maps decoded faces back to image pixels", async () => {
    // A stand-in runtime returning one confident face at stride 32, cell 0.
    const outputs: Record<string, { data: Float32Array; dims: number[] }> = {};
    for (const s of [8, 16, 32]) {
      const cells = (640 / s) ** 2;
      outputs[`cls_${s}`] = { data: new Float32Array(cells), dims: [] };
      outputs[`obj_${s}`] = { data: new Float32Array(cells), dims: [] };
      outputs[`bbox_${s}`] = { data: new Float32Array(cells * 4), dims: [] };
      outputs[`kps_${s}`] = { data: new Float32Array(cells * 10), dims: [] };
    }
    outputs.cls_32.data[0] = 1;
    outputs.obj_32.data[0] = 1;
    outputs.bbox_32.data.set([0.5, 0.5, 0, 0]);
    const fake: OrtLike = {
      InferenceSession: { create: async () => ({ run: async () => outputs }) },
      Tensor: class {} as unknown as OrtLike["Tensor"],
    };
    const detector = await createFaceDetector({ ort: fake, model: new ArrayBuffer(0) });

    // Image 1280x960: scale 0.5, so model pixels double.
    const [face] = await detector.detect({
      width: 1280,
      height: 960,
      data: new Uint8ClampedArray(1280 * 960 * 4),
    });

    expect(face).toMatchObject({ x: 0, y: 0, width: 64, height: 64, score: 1 });
    expect(face.landmarks.noseTip).toEqual({ x: 0, y: 0 });
  });
});
