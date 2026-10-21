import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { houghLines } from "./houghLines";

/** A blank edge image with the given pixels set. */
const edgesWith = (width: number, height: number, points: Array<[number, number]>) => {
  const image = createMatrix(width, height);
  for (const [x, y] of points) image.data[y * width + x] = 255;
  return image;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("houghLines", () => {
  it("finds a vertical line", () => {
    const image = edgesWith(
      60,
      60,
      range(60).map((y) => [20, y] as [number, number]),
    );

    const [line] = houghLines(image, { threshold: 40 });

    expect(line.theta).toBeCloseTo(0, 6);
    expect(line.rho).toBe(20);
    expect(line.votes).toBe(60);
  });

  it("finds a horizontal line", () => {
    const image = edgesWith(
      60,
      60,
      range(60).map((x) => [x, 33] as [number, number]),
    );

    const [line] = houghLines(image, { threshold: 40 });

    expect(line.theta).toBeCloseTo(Math.PI / 2, 6);
    expect(line.rho).toBe(33);
  });

  it("finds a diagonal line", () => {
    const image = edgesWith(
      60,
      60,
      range(60).map((i) => [i, 59 - i] as [number, number]),
    );

    const [line] = houghLines(image, { threshold: 40 });

    // x + y = 59 has normal angle 45° and rho 59 / sqrt(2).
    expect(line.theta).toBeCloseTo(Math.PI / 4, 6);
    expect(Math.abs(line.rho - 59 / Math.SQRT2)).toBeLessThanOrEqual(1);
  });

  it("orders lines by votes and honours maxLines", () => {
    const points: Array<[number, number]> = [
      ...range(50).map((y) => [10, y] as [number, number]),
      ...range(30).map((x) => [x + 20, 40] as [number, number]),
    ];
    const image = edgesWith(60, 60, points);

    const lines = houghLines(image, { threshold: 20 });

    expect(lines[0].votes).toBeGreaterThanOrEqual(lines[1].votes);
    expect(lines[0].rho).toBe(10);
    expect(houghLines(image, { threshold: 20, maxLines: 1 })).toHaveLength(1);
  });

  it("returns nothing below the threshold", () => {
    expect(houghLines(edgesWith(20, 20, [[3, 4]]), { threshold: 5 })).toEqual([]);
  });

  it("rejects bad steps and colour input", () => {
    expect(() => houghLines(createMatrix(4, 4), { rhoStep: 0 })).toThrow(RangeError);
    expect(() => houghLines(createMatrix(4, 4), { thetaStep: -1 })).toThrow(RangeError);
    expect(() => houghLines(createMatrix(4, 4, { channels: 3 }))).toThrow(RangeError);
  });
});
