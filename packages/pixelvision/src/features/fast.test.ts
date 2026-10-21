import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { noiseImage, rectanglesImage } from "../test-images";
import { detectFast } from "./fast";

describe("detectFast", () => {
  it("finds the four corners of a bright square", () => {
    // Blurred slightly: a perfectly sharp square gives every pixel near a corner
    // the same score, and the strict 3x3 maximum (as in OpenCV) rejects ties.
    const image = gaussianBlur(rectanglesImage(40, 40, [[10, 10, 30, 30, 200]]), { kernelSize: 3 });

    const corners = detectFast(image, { threshold: 50 });

    for (const [cx, cy] of [
      [10, 10],
      [29, 10],
      [10, 29],
      [29, 29],
    ]) {
      expect(corners.some((c) => Math.abs(c.x - cx) <= 1 && Math.abs(c.y - cy) <= 1)).toBe(true);
    }
    // Straight edges between the corners are not corners.
    expect(corners.some((c) => c.x === 20 && c.y === 10)).toBe(false);
  });

  it("finds dark corners on a bright background too", () => {
    const image = gaussianBlur(rectanglesImage(40, 40, [[10, 10, 30, 30, 20]], 220), {
      kernelSize: 3,
    });

    expect(detectFast(image, { threshold: 50 })).toHaveLength(4);
  });

  it("finds nothing in a flat image", () => {
    expect(detectFast(createMatrix(30, 30))).toEqual([]);
  });

  it("finds fewer corners at a higher threshold", () => {
    const image = noiseImage(80, 60);

    expect(detectFast(image, { threshold: 60 }).length).toBeLessThan(
      detectFast(image, { threshold: 10 }).length,
    );
  });

  it("keeps corners as strict 3x3 maxima of the score, in row order", () => {
    const corners = detectFast(noiseImage(80, 60, 3), { threshold: 15 });

    for (let i = 1; i < corners.length; i++) {
      const [a, b] = [corners[i - 1], corners[i]];
      expect(a.y < b.y || (a.y === b.y && a.x < b.x)).toBe(true);
    }
    for (const a of corners) {
      for (const b of corners) {
        if (a !== b && Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1) {
          expect(a.score).not.toBe(b.score);
        }
      }
    }
  });

  it("respects the border and clamps the threshold", () => {
    const corners = detectFast(noiseImage(60, 60, 5), { threshold: 999, border: 10 });

    expect(corners).toEqual([]);
    for (const c of detectFast(noiseImage(60, 60, 5), { threshold: -5, border: 10 })) {
      expect(c.x).toBeGreaterThanOrEqual(10);
      expect(c.y).toBeLessThan(50);
    }
  });

  it("rejects colour and non-u8 input", () => {
    expect(() => detectFast(createMatrix(10, 10, { channels: 3 }))).toThrow(RangeError);
    expect(() => detectFast(createMatrix(10, 10, { type: "f32" }) as never)).toThrow(TypeError);
  });
});
