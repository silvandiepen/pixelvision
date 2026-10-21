import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { noiseImage, rectanglesImage } from "../test-images";
import { detectYape, scorePixel, yapeScores } from "./yape";

describe("detectYape", () => {
  it("finds corners of rectangles", () => {
    const image = gaussianBlur(
      rectanglesImage(80, 80, [
        [20, 20, 50, 50, 220],
        [55, 10, 70, 25, 120],
      ]),
      { kernelSize: 3 },
    );

    const points = detectYape(image);

    expect(points.length).toBeGreaterThan(0);
    // All four corners of the big square, left ones included (jsfeat missed those).
    for (const [cx, cy] of [
      [20, 20],
      [49, 20],
      [20, 49],
      [49, 49],
    ]) {
      expect(points.some((p) => Math.abs(p.x - cx) <= 2 && Math.abs(p.y - cy) <= 2)).toBe(true);
    }
  });

  it("finds nothing in a flat image", () => {
    expect(detectYape(createMatrix(40, 40))).toEqual([]);
  });

  it("keeps points that are local maxima within the radius", () => {
    const image = gaussianBlur(noiseImage(90, 70, 9), { kernelSize: 3 });
    const radius = 4;
    const { scores } = yapeScores(image, radius, 7, 4);

    for (const p of detectYape(image, { radius })) {
      const v = scores[p.y * 90 + p.x];
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const n = scores[(p.y + dy) * 90 + p.x + dx];
          expect(v > 0 ? n <= v : n >= v).toBe(true);
        }
      }
    }
  });

  it("clamps the radius to 3-7 and uses tau", () => {
    const image = gaussianBlur(noiseImage(80, 80, 4), { kernelSize: 3 });

    expect(detectYape(image, { radius: 1 })).toEqual(detectYape(image, { radius: 3 }));
    expect(detectYape(image, { radius: 20 })).toEqual(detectYape(image, { radius: 7 }));
    expect(detectYape(image, { tau: 60 }).length).toBeLessThan(
      detectYape(image, { tau: 2 }).length,
    );
  });

  it("scores many textures without errors (state machine coverage)", () => {
    for (let seed = 1; seed <= 12; seed++) {
      for (const radius of [3, 5, 7]) {
        for (const tau of [2, 7, 20]) {
          const image = gaussianBlur(noiseImage(48, 48, seed), { kernelSize: seed % 2 ? 3 : 5 });
          const { scores } = yapeScores(image, radius, tau, 4);
          expect(scores.every(Number.isFinite)).toBe(true);
        }
      }
    }
  });

  it("rejects colour and non-u8 input", () => {
    expect(() => detectYape(createMatrix(10, 10, { channels: 3 }))).toThrow(RangeError);
    expect(() => detectYape(createMatrix(10, 10, { type: "f64" }) as never)).toThrow(TypeError);
  });
});

describe("scorePixel", () => {
  it("walks every transition of the state machine without errors", () => {
    // A 16-pixel circle at offsets 1..18 (with wrap-around copies), centre at 0.
    const dirs = Int32Array.from({ length: 1024 }, (_, i) => (i % 16) + 1);
    const values = new Uint8Array(17);
    const centre = 100;
    const levels = [80, 100, 120]; // darker, similar, brighter (tau 7)
    let seed = 99;
    let accepted = 0;
    for (let n = 0; n < 200_000; n++) {
      values[0] = centre;
      for (let k = 1; k <= 16; k++) {
        seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
        values[k] = levels[(seed >>> 16) % 3];
      }
      const score = scorePixel(values, 0, dirs, 8, 16, centre - 7, centre + 7);
      expect(Number.isFinite(score)).toBe(true);
      if (score !== 0) accepted++;
    }
    expect(accepted).toBeGreaterThan(0);
  });
});
