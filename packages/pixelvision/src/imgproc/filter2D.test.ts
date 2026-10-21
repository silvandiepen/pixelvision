import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { filter2D } from "./filter2D";

describe("filter2D", () => {
  const image = fromRows([
    [10, 20, 30, 40],
    [50, 60, 70, 80],
    [90, 100, 110, 120],
  ]);

  it("leaves the image unchanged with an identity kernel", () => {
    const identity = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];
    expect(toRows(filter2D(image, identity))).toEqual(toRows(image));
    expect(toRows(filter2D(image, [[1]]))).toEqual(toRows(image));
  });

  it("correlates (does not flip) and repeats the edge pixel outside the image", () => {
    // Anchor is the middle weight, so [1, 0, 0] reads the left neighbour.
    expect(toRows(filter2D(image, [[1, 0, 0]]))[0]).toEqual([10, 10, 20, 30]);
    // An even width puts the anchor right of centre: [1, 0] also reads the left neighbour.
    expect(toRows(filter2D(image, [[1, 0]]))[0]).toEqual([10, 10, 20, 30]);
    // Reading the row below: the last row repeats itself.
    expect(toRows(filter2D(image, [[0], [0], [1]]))[2]).toEqual([90, 100, 110, 120]);
  });

  it("averages a 1-pixel image to itself", () => {
    const box = Array.from({ length: 3 }, () => [1 / 9, 1 / 9, 1 / 9]);
    expect(Array.from(filter2D(fromRows([[7]]), box).data)).toEqual([7]);
  });

  it("adds delta, rounds half to even and saturates bytes", () => {
    expect(toRows(filter2D(fromRows([[200, 3, 5]]), [[2]]))).toEqual([[255, 6, 10]]);
    expect(toRows(filter2D(fromRows([[200, 3, 5]]), [[-1]]))).toEqual([[0, 0, 0]]);
    // 5 · 0.5 + 1 = 3.5 → 4 and 3 · 0.5 + 1 = 2.5 → 2 (halves go to even); 200 · 0.5 + 1 = 101.
    expect(toRows(filter2D(fromRows([[5, 3, 200]]), [[0.5]], { delta: 1 }))).toEqual([[4, 2, 101]]);
  });

  it("keeps negative and fractional sums with f32 output", () => {
    const dx = filter2D(fromRows([[10, 20, 40]]), [[-1, 0, 1]], { type: "f32" });
    expect(dx.type).toBe("f32");
    expect(Array.from(dx.data)).toEqual([10, 30, 20]);
    const half = filter2D(fromRows([[3]]), [[0.5]], { type: "f32", delta: -2 });
    expect(Array.from(half.data)).toEqual([-0.5]);
  });

  it("filters each channel separately", () => {
    const rgb = fromRows([[10, 100, 200, 30, 110, 220]], { channels: 3 });
    expect(toRows(filter2D(rgb, [[0, 1, 0]]))).toEqual(toRows(rgb));
    expect(toRows(filter2D(rgb, [[0, 0, 1]]))).toEqual([[30, 110, 220, 30, 110, 220]]);
  });

  it("gives delta alone for an all-zero kernel", () => {
    expect(toRows(filter2D(image, [[0, 0]], { delta: 4 }))[0]).toEqual([4, 4, 4, 4]);
  });

  it("writes into out for both output types", () => {
    const bytes = createMatrix(1, 1);
    const floats = createMatrix(1, 1, { type: "f32" });
    expect(filter2D(image, [[1]], { out: bytes })).toBe(bytes);
    expect(filter2D(image, [[1]], { type: "f32", out: floats })).toBe(floats);
    expect(floats.width).toBe(4);
  });

  it("rejects bad kernels and images", () => {
    expect(() => filter2D(image, [])).toThrow(RangeError);
    expect(() => filter2D(image, [[]])).toThrow(RangeError);
    expect(() => filter2D(image, [[1, 2], [3]])).toThrow(RangeError);
    expect(() => filter2D(image, [[Number.NaN]])).toThrow(RangeError);
    expect(() => filter2D(fromRows([[1, 2]], { channels: 2 }), [[1]])).toThrow(RangeError);
    expect(() => filter2D(fromRows([[1]], { type: "f32" }) as never, [[1]])).toThrow(TypeError);
  });
});
