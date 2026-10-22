import { readFileSync } from "node:fs";
import { decode } from "jpeg-js";
import * as ort from "onnxruntime-node";
import { describe, expect, it } from "vitest";
import { createFaceDetector } from "./faceDetector";
import type { NeuralFace } from "./faceDetector.model";
import { createHeadPoseTracker, measureFaceGeometry } from "./headPoseTracker";

/** A face 100 wide and `height` tall, its nose at `noseHeight` of the box and `turn` px right of centre. */
const face = (noseHeight = 0.63, height = 140, turn = 0): NeuralFace => ({
  x: 0,
  y: 0,
  width: 100,
  height,
  score: 1,
  landmarks: {
    rightEye: { x: 30, y: 0.42 * height },
    leftEye: { x: 70, y: 0.42 * height },
    noseTip: { x: 50 + turn, y: noseHeight * height },
    mouthRight: { x: 36, y: 0.74 * height },
    mouthLeft: { x: 64, y: 0.74 * height },
  },
});

describe("measureFaceGeometry", () => {
  it("measures the nose height and the box's proportions", () => {
    expect(measureFaceGeometry(face(0.6, 150))).toMatchObject({ noseHeight: 0.6, aspect: 1.5 });
  });

  it("gives 0 for an empty box", () => {
    expect(measureFaceGeometry({ ...face(), width: 0, height: 0 })).toMatchObject({
      noseHeight: 0,
      aspect: 0,
    });
  });
});

describe("createHeadPoseTracker", () => {
  it("reports up and down only once it knows the frontal face", () => {
    // Before the baseline, a tilt can't be told from a face's shape.
    expect(createHeadPoseTracker().update(face(0.55))).toBe("frontal");

    const tracker = createHeadPoseTracker({ baselineFrames: 2 });
    tracker.update(face());
    tracker.update(face());
    expect(tracker.baseline).toMatchObject({ noseHeight: 0.63, aspect: 1.4 });
    expect(tracker.update(face(0.58))).toBe("looking-up");
    expect(tracker.update(face(0.63, 124))).toBe("looking-down");
    expect(tracker.update(face())).toBe("frontal");
  });

  it("reports turns from the person's point of view, mirrored or not", () => {
    expect(createHeadPoseTracker().update(face(0.63, 140, 15))).toBe("turned-left");
    expect(createHeadPoseTracker().update(face(0.63, 140, -15))).toBe("turned-right");
    expect(createHeadPoseTracker({ mirrored: true }).update(face(0.63, 140, 15))).toBe(
      "turned-right",
    );
  });

  it("doesn't learn from tilted or half-turned frames", () => {
    const tracker = createHeadPoseTracker({ baselineFrames: 1 });
    tracker.update(face());
    const before = tracker.baseline;
    tracker.update(face(0.55));
    // A turn of 14°: under the turn threshold, but not near enough to frontal to learn from.
    tracker.update(face(0.63, 140, 6));
    expect(tracker.baseline).toEqual(before);
    tracker.update(face(0.64));
    expect(tracker.baseline!.noseHeight).toBeCloseTo(0.631, 6);
  });

  it("reports none without a face, and forgets the person on reset", () => {
    const tracker = createHeadPoseTracker({ baselineFrames: 1 });
    expect(tracker.update(undefined)).toBe("none");
    tracker.update(face());
    tracker.reset();
    expect(tracker.baseline).toBeUndefined();
  });
});

describe("createHeadPoseTracker on photos", () => {
  // One AI-generated, fictional person in each pose; see MODELS.md.
  const photo = (name: string) => {
    const { width, height, data } = decode(
      readFileSync(new URL(`../fixtures/faces/${name}.jpg`, import.meta.url)),
      { useTArray: true, formatAsRGBA: true },
    );
    return { width, height, data };
  };
  const model = readFileSync(
    new URL("../models/face_detection_yunet_2023mar.onnx", import.meta.url),
  );
  const sessionOptions = { intraOpNumThreads: 1, interOpNumThreads: 1 };

  it.each([
    ["turn-left-25", "turned-left"],
    ["turn-left-45", "turned-left"],
    ["turn-right-25", "turned-right"],
    ["turn-right-45", "turned-right"],
    ["pitch-up-15", "looking-up"],
    ["pitch-up-30", "looking-up"],
    ["pitch-down-15", "looking-down"],
    ["pitch-down-30", "looking-down"],
    ["front-2", "frontal"],
  ])("%s is %s", async (name, expected) => {
    const detector = await createFaceDetector({ ort, model, sessionOptions });
    const tracker = createHeadPoseTracker({ baselineFrames: 2 });
    for (const frontal of ["face-front", "front-2"]) {
      tracker.update((await detector.detect(photo(frontal)))[0]);
    }
    expect(tracker.update((await detector.detect(photo(name)))[0])).toBe(expected);
  });
});
