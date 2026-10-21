import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { gaussianBlur } from "./gaussianBlur";
import { houghCircles } from "./houghCircles";

/**
 * A light image with dark anti-aliased discs, blurred like a photo.
 *
 * @param width - Width.
 * @param height - Height.
 * @param discs - Centre and radius of each disc.
 * @returns The image.
 */
const discs = (
  width: number,
  height: number,
  ...shapes: Array<{ x: number; y: number; r: number }>
): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let cover = 0;
      for (const { x: cx, y: cy, r } of shapes) {
        for (let s = 0; s < 16; s++) {
          const px = x + ((s % 4) + 0.5) / 4 - cx;
          const py = y + ((s >> 2) + 0.5) / 4 - cy;
          if (px * px + py * py <= r * r) cover++;
        }
      }
      image.data[y * width + x] = Math.round(220 - (160 * Math.min(cover, 16)) / 16);
    }
  }
  return gaussianBlur(image, { kernelSize: 5 });
};

describe("houghCircles", () => {
  it("finds discs with their centre and radius", () => {
    const image = discs(160, 120, { x: 50, y: 50, r: 20 }, { x: 115, y: 70, r: 30 });
    const circles = houghCircles(image, {
      minDist: 20,
      accumulatorThreshold: 20,
      minRadius: 10,
      maxRadius: 40,
    });
    expect(circles).toHaveLength(2);
    const [big, small] = [...circles].sort((a, b) => b.radius - a.radius);
    expect(Math.hypot(big.x - 115, big.y - 70)).toBeLessThan(1);
    expect(Math.abs(big.radius - 30)).toBeLessThan(1);
    expect(Math.hypot(small.x - 50, small.y - 50)).toBeLessThan(1);
    expect(Math.abs(small.radius - 20)).toBeLessThan(1);
    // Centres sit on accumulator cell centres; values are single precision.
    for (const c of circles) {
      expect(c.x % 1).toBe(0.5);
      expect(Math.fround(c.radius)).toBe(c.radius);
      expect(c.votes).toBeGreaterThan(20);
    }
    // Strongest first.
    expect(circles[0].votes).toBeGreaterThanOrEqual(circles[1].votes);
  });

  it("finds a disc with a coarser accumulator", () => {
    const image = discs(120, 100, { x: 60, y: 45, r: 25 });
    const [circle] = houghCircles(image, { dp: 2, minDist: 50, accumulatorThreshold: 15 });
    expect(Math.hypot(circle.x - 60, circle.y - 45)).toBeLessThan(1.5);
    expect(Math.abs(circle.radius - 25)).toBeLessThan(1.5);
  });

  it("keeps only the strongest of circles closer than minDist, and at most maxCircles", () => {
    const image = discs(140, 80, { x: 40, y: 40, r: 18 }, { x: 95, y: 40, r: 26 });
    const options = { accumulatorThreshold: 15, minRadius: 10, maxRadius: 35 };
    expect(houghCircles(image, { ...options, minDist: 20 })).toHaveLength(2);
    const [only] = houghCircles(image, { ...options, minDist: 100 });
    expect(houghCircles(image, { ...options, minDist: 100 })).toHaveLength(1);
    expect(houghCircles(image, { ...options, minDist: 20, maxCircles: 1 })).toEqual([only]);
  });

  it("orders equally strong circles by radius, then position", () => {
    // Two identical discs, one above the other: same votes and radius.
    const image = discs(80, 160, { x: 40, y: 40, r: 20 }, { x: 40, y: 115, r: 20 });
    const circles = houghCircles(image, { minDist: 30, accumulatorThreshold: 20, maxRadius: 30 });
    expect(circles).toHaveLength(2);
    expect(circles[0].votes).toBe(circles[1].votes);
    expect(circles[0].radius).toBe(circles[1].radius);
    expect(circles[0].x).toBe(circles[1].x);
    expect(circles[0].y).toBeLessThan(circles[1].y);
  });

  it("searches up to the larger side by default and widens a too-small radius range", () => {
    const image = discs(100, 80, { x: 50, y: 40, r: 15 });
    const [any] = houghCircles(image, { minDist: 50, accumulatorThreshold: 15 });
    expect(Math.abs(any.radius - 15)).toBeLessThan(1);
    // maxRadius 15 ≤ minRadius 15 searches 15 to 17.
    const [narrow] = houghCircles(image, {
      minDist: 50,
      accumulatorThreshold: 15,
      minRadius: 15,
      maxRadius: 15,
    });
    expect(narrow.radius).toBeGreaterThanOrEqual(15);
    expect(narrow.radius).toBeLessThanOrEqual(17);
    // A very coarse accumulator still has one radius bin.
    expect(() => houghCircles(image, { dp: 60, accumulatorThreshold: 1 })).not.toThrow();
  });

  it("returns nothing without edges or without enough votes", () => {
    const flat = createMatrix(30, 30);
    flat.data.fill(128);
    expect(houghCircles(flat)).toEqual([]);
    expect(
      houghCircles(discs(60, 60, { x: 30, y: 30, r: 10 }), { accumulatorThreshold: 500 }),
    ).toEqual([]);
  });

  it("rejects bad input", () => {
    const image = createMatrix(10, 10);
    expect(() => houghCircles(createMatrix(4, 4, { channels: 3 }))).toThrow(RangeError);
    expect(() => houghCircles(createMatrix(4, 4, { type: "f32" }) as never)).toThrow(TypeError);
    expect(() => houghCircles(image, { dp: 0 })).toThrow(RangeError);
    expect(() => houghCircles(image, { minDist: -1 })).toThrow(RangeError);
    expect(() => houghCircles(image, { cannyThreshold: 0 })).toThrow(RangeError);
    expect(() => houghCircles(image, { accumulatorThreshold: Number.NaN })).toThrow(RangeError);
    expect(() => houghCircles(image, { minRadius: 1.5 })).toThrow(RangeError);
    expect(() => houghCircles(image, { maxRadius: -1 })).toThrow(RangeError);
  });
});
