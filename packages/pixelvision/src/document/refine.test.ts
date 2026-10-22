import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { Point } from "../math/transforms.model";
import {
  gradientStrength,
  levelWithin,
  outlineSupport,
  refineQuad,
  refinedVersions,
  strengthPercentile,
} from "./refine";

/** A 120 x 90 dark image with a light rectangle from (30, 20) to (90, 70). */
const card = (): Matrix<"u8"> => {
  const m = createMatrix(120, 90);
  for (let y = 0; y < 90; y++) {
    for (let x = 0; x < 120; x++)
      m.data[y * 120 + x] = x >= 30 && x < 90 && y >= 20 && y < 70 ? 220 : 30;
  }
  return m;
};
const exact: Point[] = [
  { x: 29.5, y: 19.5 },
  { x: 89.5, y: 19.5 },
  { x: 89.5, y: 69.5 },
  { x: 29.5, y: 69.5 },
];

describe("strengthPercentile", () => {
  it("finds the strength below which a share of the pixels fall", () => {
    const strength = Float32Array.from({ length: 100 }, (_, i) => i);
    expect(strengthPercentile(strength, 0.9)).toBe(89);
    expect(strengthPercentile(strength, 0)).toBe(0);
  });

  it("caps at the strongest bin", () => {
    expect(strengthPercentile(Float32Array.of(5000, 5000), 1)).toBe(2047);
  });
});

describe("levelWithin", () => {
  it("splits the bright pixels again", () => {
    // 8 dark, 8 middle and 16 bright pixels: the bright class splits between middle and bright.
    const values = [...Array(8).fill(10), ...Array(8).fill(100), ...Array(16).fill(240)];
    const m = createMatrix(8, 4, { data: Uint8Array.from(values) });
    const level = levelWithin(m, 50, true)!;
    expect(level).toBeGreaterThanOrEqual(100);
    expect(level).toBeLessThan(240);
  });

  it("gives null with too few pixels on that side", () => {
    expect(levelWithin(createMatrix(4, 4), 0, true)).toBeNull();
  });
});

describe("outlineSupport", () => {
  it("is the share of the outline on edge pixels", () => {
    const edges = createMatrix(10, 10);
    for (let x = 0; x < 10; x++) edges.data[x] = 255;
    const square = [
      { x: 0, y: 0 },
      { x: 9, y: 0 },
      { x: 9, y: 9 },
      { x: 0, y: 9 },
    ];
    expect(outlineSupport(square, edges)).toBeCloseTo(10 / 40, 1);
  });

  it("is 0 for a quad outside the image", () => {
    const far = [
      { x: 50, y: 50 },
      { x: 60, y: 50 },
      { x: 60, y: 60 },
      { x: 50, y: 60 },
    ];
    expect(outlineSupport(far, createMatrix(10, 10))).toBe(0);
  });
});

describe("refineQuad", () => {
  const image = card();
  const strength = gradientStrength(image);

  it("moves sides onto the edges", () => {
    const rough = exact.map((p, i) => ({ x: p.x + (i % 2 ? 2 : -2), y: p.y + (i < 2 ? -2 : 2) }));
    const refined = refineQuad(rough, strength, 120, 90, 4)!;
    refined.forEach((p, i) => {
      expect(Math.hypot(p.x - exact[i].x, p.y - exact[i].y)).toBeLessThan(1.5);
    });
  });

  it("keeps a side whose edge doesn't run straight", () => {
    // The top edge zigzags 6 px every 4 px: no line fits it.
    const torn = createMatrix(120, 90);
    for (let y = 0; y < 90; y++) {
      for (let x = 0; x < 120; x++) {
        const top = x % 8 < 4 ? 17 : 23;
        torn.data[y * 120 + x] = x >= 30 && x < 90 && y >= top && y < 70 ? 220 : 30;
      }
    }
    const refined = refineQuad(exact, gradientStrength(torn), 120, 90, 4)!;
    expect(refined[0].y).toBeCloseTo(19.5, 6);
    expect(refined[1].y).toBeCloseTo(19.5, 6);
  });

  it("keeps a side with too few points to fit", () => {
    const tiny = [
      { x: 30, y: 20 },
      { x: 32, y: 20 },
      { x: 32, y: 22 },
      { x: 30, y: 22 },
    ];
    expect(refineQuad(tiny, strength, 120, 90, 2)).toEqual(tiny);
  });

  it("gives null when two sides run parallel", () => {
    const flat = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(refineQuad(flat, strength, 120, 90, 2)).toBeNull();
  });
});

describe("refinedVersions", () => {
  const image = card();
  const strength = gradientStrength(image);

  it("gives the candidate and two refinements", () => {
    const versions = refinedVersions(exact, strength, 120, 90, 1);
    expect(versions).toHaveLength(3);
    expect(versions[0]).toEqual(exact);
  });

  it("stops at a refinement that isn't a convex quad", () => {
    const flat = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(refinedVersions(flat, strength, 120, 90, 1)).toEqual([flat]);
  });
});
