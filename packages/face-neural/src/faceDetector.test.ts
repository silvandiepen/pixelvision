import { readFileSync } from "node:fs";
import * as ort from "onnxruntime-node";
import { describe, expect, it } from "vitest";
import { FaceNeuralError } from "./errors";
import { createFaceDetector, MAX_FACES_LIMIT, resolveDetectOptions } from "./faceDetector";
import type { OrtLike, OrtTensorLike } from "./faceDetector.model";

/**
 * A stand-in runtime whose session returns the given outputs.
 *
 * @param outputs - What `run` resolves with.
 * @returns The runtime.
 */
const fakeOrt = (outputs: Record<string, OrtTensorLike>): OrtLike => ({
  InferenceSession: { create: async () => ({ run: async () => outputs }) },
  Tensor: class {} as unknown as OrtLike["Tensor"],
});

/**
 * Empty, well-formed YuNet outputs.
 *
 * @returns Outputs by name, with the real model's shapes.
 */
const emptyOutputs = (): Record<string, { data: Float32Array; dims: number[] }> => {
  const outputs: Record<string, { data: Float32Array; dims: number[] }> = {};
  for (const s of [8, 16, 32]) {
    const cells = (640 / s) ** 2;
    outputs[`cls_${s}`] = { data: new Float32Array(cells), dims: [1, cells, 1] };
    outputs[`obj_${s}`] = { data: new Float32Array(cells), dims: [1, cells, 1] };
    outputs[`bbox_${s}`] = { data: new Float32Array(cells * 4), dims: [1, cells, 4] };
    outputs[`kps_${s}`] = { data: new Float32Array(cells * 10), dims: [1, cells, 10] };
  }
  return outputs;
};

const pixel = { width: 1, height: 1, data: [0, 0, 0, 255] };

const model = readFileSync(new URL("../models/face_detection_yunet_2023mar.onnx", import.meta.url));

// One thread for the real model, so it doesn't take every core from the test
// suites running beside it.
const sessionOptions = { intraOpNumThreads: 1, interOpNumThreads: 1 };

describe("createFaceDetector", () => {
  it("runs the real model and finds no face in a blank frame", async () => {
    const detector = await createFaceDetector({ ort, model, sessionOptions });
    const blank = { width: 320, height: 240, data: new Uint8ClampedArray(320 * 240 * 4).fill(128) };

    expect(await detector.detect(blank)).toEqual([]);
  });

  it("loads a model from a path and rejects non-numeric outputs", async () => {
    const path = new URL("../models/face_detection_yunet_2023mar.onnx", import.meta.url).pathname;
    await expect(createFaceDetector({ ort, model: path, sessionOptions })).resolves.toBeDefined();

    const outputs = emptyOutputs();
    (outputs.cls_8 as { data: unknown }).data = ["x"];
    const detector = await createFaceDetector({ ort: fakeOrt(outputs), model: "model.onnx" });
    await expect(detector.detect(pixel)).rejects.toThrow(FaceNeuralError);
  });

  it("refuses malformed outputs before decoding them", async () => {
    const missing = emptyOutputs();
    delete (missing as Record<string, unknown>).kps_32;
    const reshaped = emptyOutputs();
    reshaped.bbox_8.dims = [1, 3200, 8];
    const poisoned = emptyOutputs();
    poisoned.cls_8.data[0] = NaN;

    for (const [outputs, message] of [
      [missing, /kps_32 is missing/],
      [reshaped, /bbox_8 has shape/],
      [poisoned, /cls_8 holds a non-finite value/],
    ] as const) {
      const detector = await createFaceDetector({ ort: fakeOrt(outputs), model: "model.onnx" });
      await expect(detector.detect(pixel)).rejects.toThrow(message);
      await expect(detector.detect(pixel)).rejects.toMatchObject({ code: "invalid-output" });
    }
  });

  it("refuses a malformed image and out-of-range options before running the model", async () => {
    let runs = 0;
    const ort: OrtLike = {
      InferenceSession: {
        create: async () => ({
          run: async () => {
            runs++;
            return emptyOutputs();
          },
        }),
      },
      Tensor: class {} as unknown as OrtLike["Tensor"],
    };
    const detector = await createFaceDetector({ ort, model: "model.onnx" });

    await expect(detector.detect({ width: 2, height: 2, data: [0] })).rejects.toMatchObject({
      code: "invalid-image",
    });
    await expect(detector.detect(pixel, { maxFaces: 0 })).rejects.toMatchObject({
      code: "invalid-option",
    });
    await expect(detector.detect(pixel, { scoreThreshold: NaN })).rejects.toThrow(/scoreThreshold/);
    expect(runs).toBe(0);
    await expect(detector.detect(pixel)).resolves.toEqual([]);
    expect(runs).toBe(1);
  });

  it("maps decoded faces back to image pixels", async () => {
    // A stand-in runtime returning one confident face at stride 32, cell 0.
    const outputs = emptyOutputs();
    outputs.cls_32.data[0] = 1;
    outputs.obj_32.data[0] = 1;
    outputs.bbox_32.data.set([0.5, 0.5, 0, 0]);
    const detector = await createFaceDetector({ ort: fakeOrt(outputs), model: new ArrayBuffer(0) });

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

describe("resolveDetectOptions", () => {
  it("fills in the defaults and keeps valid values", () => {
    expect(resolveDetectOptions()).toEqual({
      scoreThreshold: 0.7,
      nmsThreshold: 0.3,
      maxFaces: 10,
    });
    expect(resolveDetectOptions({ scoreThreshold: 0, nmsThreshold: 1, maxFaces: 100 })).toEqual({
      scoreThreshold: 0,
      nmsThreshold: 1,
      maxFaces: MAX_FACES_LIMIT,
    });
  });

  it.each([-0.1, 1.1, NaN, Infinity, "0.5" as unknown as number])(
    "rejects a threshold of %s",
    (value) => {
      expect(() => resolveDetectOptions({ scoreThreshold: value })).toThrow(/scoreThreshold/);
      expect(() => resolveDetectOptions({ nmsThreshold: value })).toThrow(/nmsThreshold/);
    },
  );

  it.each([0, -1, 1.5, 101, NaN, Infinity])("rejects maxFaces of %s", (maxFaces) => {
    expect(() => resolveDetectOptions({ maxFaces })).toThrow(/maxFaces must be a whole number/);
  });
});
