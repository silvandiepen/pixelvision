import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { noiseImage, rectanglesImage } from "../test-images";
import { detectYape06 } from "./yape06";

describe("detectYape06", () => {
  it("finds a bright blob and a dark blob", () => {
    const image = gaussianBlur(
      rectanglesImage(
        60,
        40,
        [
          [13, 16, 18, 21, 255],
          [41, 16, 46, 21, 0],
        ],
        128,
      ),
      { kernelSize: 5 },
    );

    const points = detectYape06(image, { laplacianThreshold: 20, minEigenvalueThreshold: 10 });

    expect(points.some((p) => Math.abs(p.x - 15) <= 2 && Math.abs(p.y - 18) <= 2)).toBe(true);
    expect(points.some((p) => Math.abs(p.x - 43) <= 2 && Math.abs(p.y - 18) <= 2)).toBe(true);
  });

  it("finds nothing in a flat image", () => {
    expect(detectYape06(createMatrix(40, 40))).toEqual([]);
  });

  it("rejects straight edges through the eigenvalue test", () => {
    const edge = gaussianBlur(rectanglesImage(60, 60, [[0, 0, 30, 60, 255]]), { kernelSize: 5 });

    expect(detectYape06(edge, { laplacianThreshold: 5, minEigenvalueThreshold: 25 })).toEqual([]);
  });

  it("keeps points inside a border of at least 5 pixels", () => {
    for (const p of detectYape06(noiseImage(60, 50), { border: 1 })) {
      expect(p.x).toBeGreaterThanOrEqual(5);
      expect(p.y).toBeGreaterThanOrEqual(5);
      expect(p.x).toBeLessThan(55);
      expect(p.y).toBeLessThan(45);
    }
  });

  it("rejects colour and non-u8 input", () => {
    expect(() => detectYape06(createMatrix(10, 10, { channels: 2 }))).toThrow(RangeError);
    expect(() => detectYape06(createMatrix(10, 10, { type: "i32" }) as never)).toThrow(TypeError);
  });
});
