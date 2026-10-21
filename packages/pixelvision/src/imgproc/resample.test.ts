import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { resample } from "./resample";

describe("resample", () => {
  it("averages 2x2 blocks when halving", () => {
    const image = fromRows([
      [0, 4, 100, 100],
      [8, 4, 100, 200],
    ]);

    expect(toRows(resample(image, { width: 2, height: 1 }))).toEqual([[4, 125]]);
  });

  it("weights partial pixels when the factor isn't whole", () => {
    const row = fromRows([[0, 30, 60]], { type: "f32" });
    const tall = { ...row, height: 2, data: new Float32Array([0, 30, 60, 0, 30, 60]) };

    // Each of 2 outputs covers 1.5 inputs: (0 + 30/2) / 1.5 = 10, (30/2 + 60) / 1.5 = 50.
    const [result] = toRows(resample(tall, { width: 2, height: 1 }));

    expect(result[0]).toBeCloseTo(10, 4);
    expect(result[1]).toBeCloseTo(50, 4);
  });

  it.each(["u8", "f32"] as const)("weights partial rows and columns (%s, factor 1.5)", (type) => {
    const ramp = fromRows(
      [
        [0, 30, 60],
        [0, 30, 60],
        [0, 30, 60],
      ],
      { type },
    );

    const rows = toRows(resample(ramp, { width: 2, height: 2 }));

    // Each output covers 1.5 inputs: (0 + 15) / 1.5 = 10 and (15 + 60) / 1.5 = 50 in every row.
    for (const [left, right] of rows) {
      expect(Math.abs(left - 10)).toBeLessThanOrEqual(1);
      expect(Math.abs(right - 50)).toBeLessThanOrEqual(1);
    }
  });

  it("shrinks every channel of a colour image correctly", () => {
    const rgb = fromRows(
      [
        [10, 20, 30, 10, 20, 30],
        [10, 20, 30, 10, 20, 30],
      ],
      { channels: 3 },
    );

    expect(toRows(resample(rgb, { width: 1, height: 1 }))).toEqual([[10, 20, 30]]);
  });

  it("shrinks by large factors through the float path", () => {
    const big = createMatrix(32, 32, { data: new Uint8Array(1024).fill(77) });

    expect(Array.from(resample(big, { width: 1, height: 1 }).data)).toEqual([77]);
  });

  it("grows with bilinear interpolation, aligning pixel centres", () => {
    const image = fromRows([[0, 100]]);

    expect(toRows(resample(image, { width: 4, height: 1 }))).toEqual([[0, 25, 75, 100]]);
  });

  it("grows a colour image and keeps flat areas flat", () => {
    const rgb = fromRows([[5, 6, 7]], { channels: 3 });

    expect(toRows(resample(rgb, { width: 2, height: 2 }))).toEqual([
      [5, 6, 7, 5, 6, 7],
      [5, 6, 7, 5, 6, 7],
    ]);
  });

  it("writes into a given matrix", () => {
    const out = createMatrix(1, 1);

    expect(resample(createMatrix(4, 4), { width: 2, height: 2, out })).toBe(out);
  });

  it("rejects bad sizes and empty input", () => {
    expect(() => resample(createMatrix(4, 4), { width: 0, height: 2 })).toThrow(RangeError);
    expect(() => resample(createMatrix(4, 4), { width: 2, height: 1.5 })).toThrow(RangeError);
    expect(() => resample(createMatrix(0, 0), { width: 2, height: 2 })).toThrow(RangeError);
  });
});
