import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { noiseImage } from "../test-images";
import { frontalFace } from "../cascades/frontal-face";
import { upperBody } from "../cascades/upper-body";
import { detectHaar, haarSingleScale } from "./haar";
import type { HaarCascade } from "./haar.model";

/** A cascade cut to its first stages, so it fires on ordinary texture. */
const firstStages = (cascade: HaarCascade, stages: number): HaarCascade => ({
  ...cascade,
  complexClassifiers: cascade.complexClassifiers.slice(0, stages),
});

const texture = gaussianBlur(noiseImage(120, 100, 4), { kernelSize: 3 });

describe("detectHaar", () => {
  it("finds candidates at several scales with a permissive cascade", () => {
    const raw = detectHaar(texture, firstStages(frontalFace, 1), {
      minNeighbors: 0,
      edgeDensity: false,
    });

    expect(raw.length).toBeGreaterThan(0);
    expect(new Set(raw.map((d) => d.width)).size).toBeGreaterThan(1);
  });

  it("groups and orders results by support", () => {
    const grouped = detectHaar(texture, firstStages(frontalFace, 1), { edgeDensity: false });

    for (let i = 1; i < grouped.length; i++) {
      expect(grouped[i - 1].neighbors).toBeGreaterThanOrEqual(grouped[i].neighbors);
    }
  });

  it("skips flat windows with edge pruning", () => {
    const flat = createMatrix(80, 80);
    flat.data.fill(128);

    expect(detectHaar(flat, firstStages(frontalFace, 1))).toEqual([]);
  });

  it("uses tilted features when the cascade has them", () => {
    expect(() => detectHaar(texture, firstStages(upperBody, 2), { minNeighbors: 0 })).not.toThrow();
  });

  it("finds no faces in noise with the full cascade", () => {
    expect(detectHaar(texture, frontalFace, { minNeighbors: 3 })).toEqual([]);
  });

  it("rejects bad input", () => {
    expect(() => detectHaar(texture, frontalFace, { scaleFactor: 1 })).toThrow(RangeError);
    expect(() => detectHaar(createMatrix(10, 10, { channels: 3 }), frontalFace)).toThrow(
      RangeError,
    );
    expect(() => detectHaar(createMatrix(10, 10, { type: "f32" }) as never, frontalFace)).toThrow(
      TypeError,
    );
  });
});

describe("haarSingleScale", () => {
  it("returns nothing when the window doesn't fit", () => {
    const small = { sum: new Float64Array(4), squares: new Float64Array(4) };

    expect(haarSingleScale(small, 1, 1, 1, frontalFace, 0)).toEqual([]);
  });

  it("treats a flat window's variance as 1", () => {
    const flat = createMatrix(30, 30);
    flat.data.fill(50);
    // Integral of a flat image: no variance anywhere.
    const sum = new Float64Array(31 * 31);
    const squares = new Float64Array(31 * 31);
    for (let y = 1; y <= 30; y++) {
      for (let x = 1; x <= 30; x++) {
        sum[y * 31 + x] = 50 * x * y;
        squares[y * 31 + x] = 2500 * x * y;
      }
    }

    expect(() => haarSingleScale({ sum, squares }, 30, 30, 1, frontalFace, 0)).not.toThrow();
  });
});
