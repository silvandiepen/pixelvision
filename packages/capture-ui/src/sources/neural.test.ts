import { describe, expect, it, vi } from "vitest";
import { loadNeuralPoseSource, neuralPoseSource } from "./neural";
import type { NeuralFaceLike } from "./source.model";

const face: NeuralFaceLike = {
  x: 10,
  y: 20,
  width: 30,
  height: 40,
  score: 0.9,
  landmarks: {
    rightEye: { x: 1, y: 1 },
    leftEye: { x: 2, y: 1 },
    noseTip: { x: 1.5, y: 2 },
    mouthRight: { x: 1, y: 3 },
    mouthLeft: { x: 2, y: 3 },
  },
};
const frame = { width: 2, height: 2, data: new Uint8ClampedArray(16) };

describe("neuralPoseSource", () => {
  it.each([0, -5, 90, NaN, Infinity, "18" as unknown as number])(
    "rejects a turn threshold of %s",
    (threshold) => {
      const detector = { detect: vi.fn(async () => []) };
      expect(() =>
        neuralPoseSource({ detector, headPoseFromFace: () => "frontal", threshold }),
      ).toThrow(RangeError);
    },
  );

  it("maps the first face to an observation", async () => {
    const detector = { detect: vi.fn(async () => [face]) };
    const headPoseFromFace = vi.fn(() => "turned-left" as const);
    const source = neuralPoseSource({ detector, headPoseFromFace, threshold: 12 });
    expect(source).toMatchObject({ directional: true, name: "yunet", turnThreshold: 12 });
    await expect(source.detect(frame)).resolves.toEqual({
      pose: "turned-left",
      box: { x: 10, y: 20, width: 30, height: 40 },
      landmarks: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1.5, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
      ],
      score: 0.9,
    });
    expect(detector.detect).toHaveBeenCalledWith(frame, { maxFaces: 1 });
    expect(headPoseFromFace).toHaveBeenCalledWith(face, { threshold: 12, mirrored: false });
  });

  it("reports no face", async () => {
    const source = neuralPoseSource({
      detector: { detect: async () => [] },
      headPoseFromFace: (f) => (f ? "frontal" : "none"),
    });
    await expect(source.detect(frame)).resolves.toEqual({ pose: "none" });
  });
});

describe("yaw", () => {
  it("reports yaw when estimateHeadYaw is given", async () => {
    const source = neuralPoseSource({
      detector: { detect: async () => [face] },
      headPoseFromFace: () => "frontal",
      estimateHeadYaw: () => 7,
    });
    expect(source.turnThreshold).toBe(18);
    await expect(source.detect(frame)).resolves.toMatchObject({ pose: "frontal", yaw: 7 });
  });
});

describe("loadNeuralPoseSource", () => {
  it("creates the detector from the given module", async () => {
    const createFaceDetector = vi.fn(async () => ({ detect: async () => [face] }));
    const ort = { name: "ort" };
    const source = await loadNeuralPoseSource({
      ort,
      model: "/yunet.onnx",
      sessionOptions: { executionProviders: ["wasm"] },
      threshold: 20,
      faceNeural: {
        createFaceDetector,
        headPoseFromFace: () => "turned-right",
        estimateHeadYaw: () => -25,
      },
    });
    expect(createFaceDetector).toHaveBeenCalledWith({
      ort,
      model: "/yunet.onnx",
      sessionOptions: { executionProviders: ["wasm"] },
    });
    expect(source.turnThreshold).toBe(20);
    await expect(source.detect(frame)).resolves.toMatchObject({ pose: "turned-right", yaw: -25 });
  });

  it("imports @pixelvision/face-neural when no module is given", async () => {
    vi.doMock("@pixelvision/face-neural", () => ({
      createFaceDetector: async () => ({ detect: async () => [] }),
      headPoseFromFace: () => "none",
      estimateHeadYaw: () => 0,
    }));
    const source = await loadNeuralPoseSource({ ort: {}, model: new Uint8Array(1) });
    await expect(source.detect(frame)).resolves.toEqual({ pose: "none" });
    vi.doUnmock("@pixelvision/face-neural");
  });
});
