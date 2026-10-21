import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { boxBlur, boxSum } from "./boxBlur";

const image = fromRows([
  [0, 9, 0],
  [0, 9, 0],
  [0, 0, 90],
]);

describe("boxSum", () => {
  it("sums the window, repeating edge pixels", () => {
    // Row sums (edge repeated): [9, 9, 9], [9, 9, 9], [0, 90, 180].
    // Column sums of those, edge repeated: top 9+9+9, middle 9+9+row3, bottom 9+row3+row3.
    expect(toRows(boxSum(image, { radius: 1 }))).toEqual([
      [27, 27, 27],
      [18, 108, 198],
      [9, 189, 369],
    ]);
  });

  it("returns the image itself for radius 0", () => {
    expect(toRows(boxSum(image, { radius: 0 }))).toEqual(toRows(image));
  });

  it("handles windows larger than the image", () => {
    const sums = boxSum(fromRows([[10, 20]]), { radius: 3 });

    // Row: clamp(-3..3) around x=0 reads [10,10,10,10,20,20,20]; 7 rows of that.
    expect(toRows(sums)).toEqual([[7 * 100, 7 * 110]]);
  });

  it("sums each channel separately", () => {
    const pair = fromRows([[1, 100, 3, 200]], { channels: 2 });

    // Channel 0: [1+1+3, 1+3+3] x 3 rows; channel 1: [100+100+200, 100+200+200] x 3.
    expect(toRows(boxSum(pair, { radius: 1 }))).toEqual([[15, 1200, 21, 1500]]);
  });

  it("writes into a given i32 matrix", () => {
    const out = createMatrix(1, 1, { type: "i32" });

    expect(boxSum(image, { radius: 1, out })).toBe(out);
  });
});

describe("boxBlur", () => {
  it("averages the window, rounding down", () => {
    // The sums above divided by 9, rounded down.
    expect(toRows(boxBlur(image, { radius: 1 }))).toEqual([
      [3, 3, 3],
      [2, 12, 22],
      [1, 21, 41],
    ]);
  });

  it("keeps a flat image flat", () => {
    const flat = fromRows([
      [200, 200],
      [200, 200],
    ]);

    expect(toRows(boxBlur(flat, { radius: 2 }))).toEqual(toRows(flat));
  });

  it("writes into a given u8 matrix", () => {
    const out = createMatrix(1, 1);

    expect(boxBlur(image, { radius: 1, out })).toBe(out);
  });

  it("rejects non-u8 input and bad radii", () => {
    expect(() => boxBlur(createMatrix(2, 2, { type: "f32" }) as never, { radius: 1 })).toThrow(
      TypeError,
    );
    expect(() => boxBlur(image, { radius: -1 })).toThrow(RangeError);
    expect(() => boxSum(image, { radius: 1.5 })).toThrow(RangeError);
  });
});
