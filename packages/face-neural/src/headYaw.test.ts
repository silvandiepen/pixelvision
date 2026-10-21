import { describe, expect, it } from "vitest";
import type { NeuralFace } from "./faceDetector.model";
import { estimateHeadYaw, headPoseFromFace } from "./headYaw";

/** A face whose nose sits `offset` pixels right of the eyes' midpoint. */
const withNose = (offset: number, eyeDistance = 60): NeuralFace => ({
  x: 0,
  y: 0,
  width: 120,
  height: 120,
  score: 1,
  landmarks: {
    rightEye: { x: 30, y: 40 },
    leftEye: { x: 30 + eyeDistance, y: 40 },
    noseTip: { x: 30 + eyeDistance / 2 + offset, y: 70 },
    mouthRight: { x: 40, y: 90 },
    mouthLeft: { x: 80, y: 90 },
  },
});

describe("estimateHeadYaw", () => {
  it("is 0 facing the camera and grows with the nose offset", () => {
    expect(estimateHeadYaw(withNose(0))).toBe(0);
    // offset / (0.6 · eye distance) = 1 → 45°.
    expect(estimateHeadYaw(withNose(36))).toBeCloseTo(45, 6);
    expect(estimateHeadYaw(withNose(-36))).toBeCloseTo(-45, 6);
  });

  it("returns 0 when the eyes coincide", () => {
    expect(estimateHeadYaw(withNose(5, 0))).toBe(0);
  });
});

describe("headPoseFromFace", () => {
  it("reports frontal, left and right from the person's point of view", () => {
    expect(headPoseFromFace(withNose(3))).toBe("frontal");
    expect(headPoseFromFace(withNose(20))).toBe("turned-left");
    expect(headPoseFromFace(withNose(-20))).toBe("turned-right");
  });

  it("swaps sides for mirrored images and honours the threshold", () => {
    expect(headPoseFromFace(withNose(20), { mirrored: true })).toBe("turned-right");
    expect(headPoseFromFace(withNose(20), { threshold: 60 })).toBe("frontal");
  });

  it("reports none without a face", () => {
    expect(headPoseFromFace(undefined)).toBe("none");
  });
});
