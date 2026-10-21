import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { houghLinesP } from "./houghLinesP";
import type { LineSegment } from "./houghLinesP.model";

/**
 * Draws a line of 255s with Bresenham's algorithm.
 *
 * @param image - Image to draw on.
 * @param x0 - Start column.
 * @param y0 - Start row.
 * @param x1 - End column.
 * @param y1 - End row.
 */
const drawLine = (image: Matrix, x0: number, y0: number, x1: number, y1: number): void => {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    image.data[y0 * image.width + x0] = 255;
    if (x0 === x1 && y0 === y1) return;
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y0 += sy;
    }
  }
};

/**
 * A segment as `[x1, y1, x2, y2]` with the smaller end first, for comparing.
 *
 * @param segment - The segment.
 * @returns Its ends, ordered.
 */
const ordered = ({ from, to }: LineSegment): number[] =>
  from.x < to.x || (from.x === to.x && from.y < to.y)
    ? [from.x, from.y, to.x, to.y]
    : [to.x, to.y, from.x, from.y];

describe("houghLinesP", () => {
  it("finds a horizontal, a vertical and a diagonal segment with their end points", () => {
    const image = createMatrix(80, 60);
    drawLine(image, 10, 8, 70, 8);
    drawLine(image, 40, 15, 40, 55);
    drawLine(image, 5, 20, 30, 45);
    const segments = houghLinesP(image, { threshold: 15, minLineLength: 10 }).map(ordered);
    expect(segments.sort((a, b) => a[0] - b[0])).toEqual([
      [5, 20, 30, 45],
      [10, 8, 70, 8],
      [40, 15, 40, 55],
    ]);
  });

  it("finds steep lines leaning either way", () => {
    const image = createMatrix(60, 60);
    drawLine(image, 10, 5, 20, 55);
    drawLine(image, 50, 5, 40, 55);
    const segments = houghLinesP(image, {
      threshold: 20,
      minLineLength: 20,
      maxLineGap: 2,
    }).map(ordered);
    expect(segments.sort((a, b) => a[0] - b[0])).toEqual([
      [10, 5, 20, 55],
      [40, 55, 50, 5],
    ]);
  });

  it("bridges gaps up to maxLineGap and drops segments shorter than minLineLength", () => {
    const image = createMatrix(70, 20);
    drawLine(image, 5, 10, 30, 10);
    drawLine(image, 34, 10, 64, 10);
    drawLine(image, 2, 2, 5, 2);
    const split = houghLinesP(image, { threshold: 10, minLineLength: 10 }).map(ordered);
    expect(split.sort((a, b) => a[0] - b[0])).toEqual([
      [5, 10, 30, 10],
      [34, 10, 64, 10],
    ]);
    const joined = houghLinesP(image, { threshold: 10, minLineLength: 10, maxLineGap: 3 });
    expect(joined.map(ordered)).toEqual([[5, 10, 64, 10]]);
  });

  it("stops at maxLines and at the image border", () => {
    const image = createMatrix(40, 40);
    drawLine(image, 0, 5, 39, 5);
    drawLine(image, 0, 30, 39, 30);
    expect(houghLinesP(image, { threshold: 10, maxLines: 1 })).toHaveLength(1);
    expect(houghLinesP(image, { threshold: 10 }).map(ordered).sort()).toEqual([
      [0, 30, 39, 30],
      [0, 5, 39, 5],
    ]);
  });

  it("is deterministic per seed", () => {
    const image = createMatrix(64, 48);
    drawLine(image, 3, 40, 60, 4);
    drawLine(image, 2, 2, 61, 45);
    drawLine(image, 30, 0, 33, 47);
    for (const seed of [undefined, 0, 1, 2 ** 40]) {
      const first = houghLinesP(image, { threshold: 12, minLineLength: 8, maxLineGap: 2, seed });
      const again = houghLinesP(image, { threshold: 12, minLineLength: 8, maxLineGap: 2, seed });
      expect(again).toEqual(first);
      expect(first.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("returns nothing for an empty image or one without strong lines", () => {
    expect(houghLinesP(createMatrix(10, 10))).toEqual([]);
    const image = createMatrix(10, 10);
    drawLine(image, 1, 1, 8, 1);
    expect(houghLinesP(image, { threshold: 20 })).toEqual([]);
  });

  it("works with a coarse angle step: one angle, or a last angle that isn't dropped", () => {
    const image = createMatrix(30, 30);
    drawLine(image, 12, 2, 12, 27);
    // A step over π leaves only θ = 0, the vertical lines.
    expect(houghLinesP(image, { threshold: 10, thetaStep: 4 }).map(ordered)).toEqual([
      [12, 2, 12, 27],
    ]);
    expect(houghLinesP(image, { threshold: 10, thetaStep: 0.4, rhoStep: 2 }).map(ordered)).toEqual([
      [12, 2, 12, 27],
    ]);
  });

  it("rejects bad input", () => {
    expect(() => houghLinesP(createMatrix(4, 4, { channels: 3 }))).toThrow(RangeError);
    expect(() => houghLinesP(createMatrix(4, 4), { rhoStep: 0 })).toThrow(RangeError);
    expect(() => houghLinesP(createMatrix(4, 4), { thetaStep: -1 })).toThrow(RangeError);
    expect(() => houghLinesP(createMatrix(4, 4), { seed: -2 })).toThrow(RangeError);
  });
});
