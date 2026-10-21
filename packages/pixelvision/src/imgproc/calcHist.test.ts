import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { calcHist } from "./calcHist";

describe("calcHist", () => {
  const gray = fromRows([[0, 1, 1, 255, 128]]);

  it("counts every byte value with the default 256 bins", () => {
    const histogram = calcHist(gray);
    expect([histogram.type, histogram.width, histogram.height]).toEqual(["i32", 256, 1]);
    expect([
      histogram.data[0],
      histogram.data[1],
      histogram.data[128],
      histogram.data[255],
    ]).toEqual([1, 2, 1, 1]);
  });

  it("groups values into equal bins", () => {
    // Two bins of 128 levels: 0, 1, 1 below 128; 255 and 128 above.
    expect(toRows(calcHist(gray, { bins: 2 }))).toEqual([[3, 2]]);
  });

  it("leaves out values outside [low, high)", () => {
    // [1, 255) in 2 bins of 127: 1, 1 → bin 0; 128 → bin 1; 0 and 255 are out.
    expect(toRows(calcHist(gray, { bins: 2, range: [1, 255] }))).toEqual([[2, 1]]);
  });

  it("gives one row per channel and honours a mask", () => {
    const rgb = fromRows([[10, 20, 30, 10, 200, 250]], { channels: 3 });
    const histogram = calcHist(rgb, { bins: 4 });
    expect(toRows(histogram)).toEqual([
      [2, 0, 0, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
    ]);
    const mask = fromRows([[0, 1]]);
    expect(toRows(calcHist(rgb, { bins: 4, mask }))).toEqual([
      [1, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 0, 1],
    ]);
  });

  it("clears a reused output and handles a 1-pixel image", () => {
    const out = createMatrix(3, 1, { type: "i32" });
    out.data.fill(9);
    expect(calcHist(fromRows([[200]]), { bins: 3, out })).toBe(out);
    expect(Array.from(out.data)).toEqual([0, 0, 1]);
  });

  it("rejects bad options", () => {
    expect(() => calcHist(gray, { bins: 0 })).toThrow(RangeError);
    expect(() => calcHist(gray, { range: [5, 5] })).toThrow(RangeError);
    expect(() => calcHist(gray, { range: [0, Infinity] })).toThrow(RangeError);
    expect(() => calcHist(gray, { mask: fromRows([[1, 1]]) })).toThrow(RangeError);
    expect(() => calcHist(gray, { mask: createMatrix(5, 1, { channels: 2 }) })).toThrow(RangeError);
    expect(() => calcHist(gray, { mask: createMatrix(5, 1, { type: "f32" }) as never })).toThrow(
      TypeError,
    );
    expect(() => calcHist(fromRows([[1]], { type: "i32" }) as never)).toThrow(TypeError);
  });
});
