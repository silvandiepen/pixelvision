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

describe("detectHaar with trees of several splits", () => {
  const stump = firstStages(frontalFace, 1).complexClassifiers[0].simpleClassifiers[0];
  const other = firstStages(frontalFace, 1).complexClassifiers[0].simpleClassifiers[1];
  const run = (tree: HaarCascade["complexClassifiers"][0]["simpleClassifiers"][0]) =>
    detectHaar(
      texture,
      {
        size: frontalFace.size,
        complexClassifiers: [{ threshold: 0.5, simpleClassifiers: [tree] }],
      },
      { minNeighbors: 0, edgeDensity: false },
    );

  it("continues at the left or right split instead of scoring", () => {
    const expected = run(stump);
    expect(expected.length).toBeGreaterThan(0);

    // Always below the threshold: the tree goes left, to the stump.
    expect(run({ ...other, threshold: Infinity, left: stump })).toEqual(expected);
    // Never below: it goes right.
    expect(run({ ...other, threshold: -Infinity, right: stump })).toEqual(expected);
  });
});

describe("detectHaar with OpenCV scoring", () => {
  /** One split over the window's left and right halves. */
  const halves = (threshold: number, opencvScoring: boolean): HaarCascade => ({
    size: [8, 8],
    opencvScoring,
    complexClassifiers: [
      {
        threshold: 0,
        simpleClassifiers: [
          {
            features: [
              [0, 0, 4, 8, 1],
              [4, 0, 4, 8, -1],
            ],
            threshold,
            left_val: -1,
            right_val: 1,
          },
        ],
      },
    ],
  });
  // 9 x 9: exactly one 8 x 8 window, at (0, 0) and scale 1.
  const image = createMatrix(9, 9);
  for (let y = 0; y < 9; y++)
    for (let x = 0; x < 9; x++) image.data[y * 9 + x] = x < 4 ? 200 : 40 + 3 * y;
  const found = (threshold: number, opencvScoring: boolean) =>
    detectHaar(image, halves(threshold, opencvScoring), { minNeighbors: 0, edgeDensity: false })
      .length;

  it("normalises over the window inside a one-pixel border", () => {
    // Inside the border: columns 1-6, rows 1-6.
    let total = 0;
    let squares = 0;
    for (let y = 1; y < 7; y++) {
      for (let x = 1; x < 7; x++) {
        total += image.data[y * 9 + x];
        squares += image.data[y * 9 + x] ** 2;
      }
    }
    let left = 0;
    let right = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (x < 4) left += image.data[y * 9 + x];
        else right += image.data[y * 9 + x];
      }
    }
    const value = (left - right) / Math.sqrt(36 * squares - total * total);

    expect(found(value - 1e-9, true)).toBe(1);
    expect(found(value + 1e-9, true)).toBe(0);
    // Scored over the whole window, the value is smaller.
    expect(found(value - 1e-3, false)).toBe(0);
  });

  it("scores a flat window as zero at every size, and skips rectangles rounded away", () => {
    const flat = createMatrix(40, 40);
    flat.data.fill(90);
    const cascade = halves(-0.5, true);

    // Zero-sum features read 0 on a flat window: above -0.5 everywhere.
    expect(
      detectHaar(flat, cascade, { minNeighbors: 0, edgeDensity: false }).length,
    ).toBeGreaterThan(0);
    expect(detectHaar(flat, halves(0.5, true), { minNeighbors: 0, edgeDensity: false })).toEqual(
      [],
    );
    // At a tenth of the size the rectangles round to nothing and weigh 0.
    expect(
      detectHaar(flat, cascade, { minScale: 0.1, minNeighbors: 0, edgeDensity: false }).length,
    ).toBeGreaterThan(0);
  });
});
