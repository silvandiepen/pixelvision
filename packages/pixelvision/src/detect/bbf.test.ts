import { describe, expect, it } from "vitest";
import { bbfFace } from "../cascades/bbf-face";
import { createMatrix } from "../core/matrix";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { noiseImage } from "../test-images";
import { bbfDetectRaw, bbfPyramid, detectBbf } from "./bbf";
import type { BbfCascade } from "./bbf.model";

const firstStages = (stages: number): BbfCascade => ({
  ...bbfFace,
  stage_classifier: bbfFace.stage_classifier.slice(0, stages),
});
const texture = gaussianBlur(noiseImage(160, 120, 6), { kernelSize: 3 });

describe("bbfPyramid", () => {
  it("builds resampled levels, halvings and offset variants", () => {
    const pyramid = bbfPyramid(texture, 48, 48, 4);

    expect(pyramid.next).toBe(5);
    expect(pyramid.scale).toBeCloseTo(Math.pow(2, 1 / 5), 12);
    expect(pyramid.levels[0]).toBe(texture);
    expect(pyramid.levels[4]).toMatchObject({ width: (160 / pyramid.scale) | 0 });
    expect(pyramid.levels[20]).toMatchObject({ width: 80, height: 60 });
    // Offset variants exist from two octaves down.
    expect(pyramid.levels[41]).toMatchObject({ width: 40, height: 30 });
  });
});

describe("detectBbf", () => {
  it("finds candidates with a permissive cascade and groups them", () => {
    const raw = detectBbf(texture, firstStages(1), { minNeighbors: 0 });
    const grouped = detectBbf(texture, firstStages(1));

    expect(raw.length).toBeGreaterThan(grouped.length);
    for (let i = 1; i < grouped.length; i++) {
      expect(grouped[i - 1].neighbors).toBeGreaterThanOrEqual(grouped[i].neighbors);
    }
  });

  it("finds no faces in noise with the full cascade", () => {
    expect(detectBbf(texture, bbfFace, { minNeighbors: 2 })).toEqual([]);
  });

  it("scales detections with the pyramid level", () => {
    const raw = bbfDetectRaw(bbfPyramid(texture, 48, 48, 2), firstStages(1));

    expect(new Set(raw.map((d) => Math.round(d.width))).size).toBeGreaterThan(1);
  });

  it("rejects small and bad input", () => {
    expect(() => detectBbf(createMatrix(20, 20), bbfFace)).toThrow(RangeError);
    expect(() => detectBbf(createMatrix(60, 60, { channels: 3 }), bbfFace)).toThrow(RangeError);
    expect(() => detectBbf(createMatrix(60, 60, { type: "f32" }) as never, bbfFace)).toThrow(
      TypeError,
    );
  });
});
