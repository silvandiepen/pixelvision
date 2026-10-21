import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { warpAffine, warpPerspective } from "./warp";

const image = fromRows([
  [10, 20, 30],
  [40, 50, 60],
  [70, 80, 90],
]);
const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];

describe("warpPerspective", () => {
  it("keeps every pixel, edges included, under the identity", () => {
    expect(toRows(warpPerspective(image, identity))).toEqual(toRows(image));
  });

  it("interpolates between pixels", () => {
    const half = warpPerspective(image, [1, 0, 0.5, 0, 1, 0.5, 0, 0, 1], { width: 2, height: 2 });

    expect(toRows(half)).toEqual([
      [30, 40],
      [60, 70],
    ]);
  });

  it("fills pixels that map outside the input", () => {
    const shifted = warpPerspective(image, [1, 0, 1, 0, 1, 0, 0, 0, 1], { fill: 255 });

    expect(toRows(shifted)).toEqual([
      [20, 30, 255],
      [50, 60, 255],
      [80, 90, 255],
    ]);
  });

  it("divides by the projective term", () => {
    // w = 2 everywhere: output (x, y) reads input (x/2, y/2) scaled twice: (2x/2, 2y/2).
    const scaled = warpPerspective(image, [2, 0, 0, 0, 2, 0, 0, 0, 2]);

    expect(toRows(scaled)).toEqual(toRows(image));
  });

  it("fills when the projective term is zero", () => {
    expect(
      Array.from(warpPerspective(image, [1, 0, 0, 0, 1, 0, 0, 0, 0], { fill: 9 }).data),
    ).toEqual(new Array(9).fill(9));
  });

  it("accepts a transform matrix, other output sizes and multiple channels", () => {
    const transform = createMatrix(3, 3, { type: "f64", data: new Float64Array(identity) });
    const rgb = fromRows([[1, 2, 3, 4, 5, 6]], { channels: 3 });

    const result = warpPerspective(rgb, transform, { width: 1, height: 1 });

    expect(toRows(result)).toEqual([[1, 2, 3]]);
  });

  it("writes into a given matrix", () => {
    const out = createMatrix(1, 1);

    expect(warpPerspective(image, identity, { out })).toBe(out);
  });

  it("rejects short transforms and bad sizes", () => {
    expect(() => warpPerspective(image, [1, 0, 0])).toThrow(RangeError);
    expect(() => warpPerspective(image, identity, { width: -1 })).toThrow(RangeError);
  });
});

describe("warpAffine", () => {
  it("keeps every pixel under the identity, using only two rows", () => {
    expect(toRows(warpAffine(image, [1, 0, 0, 0, 1, 0]))).toEqual(toRows(image));
  });

  it("does not extrapolate past the top-left edge", () => {
    const shifted = warpAffine(image, [1, 0, -0.5, 0, 1, 0], { fill: 0 });

    expect(toRows(shifted)[0]).toEqual([0, 15, 25]);
  });

  it("samples the last row and column exactly", () => {
    const mirrored = warpAffine(image, [-1, 0, 2, 0, -1, 2]);

    expect(toRows(mirrored)).toEqual([
      [90, 80, 70],
      [60, 50, 40],
      [30, 20, 10],
    ]);
  });

  it("rejects transforms with fewer than 6 values", () => {
    expect(() => warpAffine(image, [1, 0, 0, 0, 1])).toThrow(RangeError);
  });

  it("handles a 1-pixel image", () => {
    expect(toRows(warpAffine(fromRows([[42]]), identity))).toEqual([[42]]);
  });
});
