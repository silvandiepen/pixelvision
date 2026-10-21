import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows } from "../test-utils";
import { calcBackProject } from "./calcBackProject";

describe("calcBackProject", () => {
  it("replaces each value with its bin's histogram value", () => {
    // 4 bins of 64: 0–63, 64–127, 128–191, 192–255.
    const image = fromRows([[0, 63, 64, 200, 255]]);
    expect(Array.from(calcBackProject(image, [10, 20, 30, 40]).data)).toEqual([10, 10, 20, 40, 40]);
  });

  it("scales, rounds half to even and clamps", () => {
    const image = fromRows([[0, 100, 200]]);
    expect(Array.from(calcBackProject(image, [1, 2.5, 300], { scale: 1 }).data)).toEqual([
      1, 2, 255,
    ]);
    expect(Array.from(calcBackProject(image, [1, 2, 3], { scale: 255 / 3 }).data)).toEqual([
      85, 170, 255,
    ]);
    expect(Array.from(calcBackProject(image, [-4, 0, 0]).data)).toEqual([0, 0, 0]);
  });

  it("reads one channel over a range, and gives 0 outside it", () => {
    // Hue-like channel 0 in [0, 180), channel 1 ignored.
    const hsv = fromRows([[0, 255, 90, 255, 179, 0, 200, 9]], { channels: 2 });
    const out = calcBackProject(hsv, [5, 6, 7], { range: [0, 180] });
    expect(Array.from(out.data)).toEqual([5, 6, 7, 0]);
    expect(Array.from(calcBackProject(hsv, [1, 2], { channel: 1 }).data)).toEqual([2, 2, 1, 1]);
  });

  it("writes into a given output", () => {
    const out = createMatrix(2, 1);
    expect(calcBackProject(fromRows([[0, 255]]), [3, 4], { out })).toBe(out);
    expect(Array.from(out.data)).toEqual([3, 4]);
  });

  it("rejects bad input", () => {
    const image = fromRows([[1, 2]]);
    expect(() => calcBackProject(image, [])).toThrow(RangeError);
    expect(() => calcBackProject(image, [1], { channel: 1 })).toThrow(RangeError);
    expect(() => calcBackProject(image, [1], { channel: -1 })).toThrow(RangeError);
    expect(() => calcBackProject(image, [1], { range: [5, 5] })).toThrow(RangeError);
    expect(() => calcBackProject(image, [1], { scale: Infinity })).toThrow(RangeError);
    expect(() => calcBackProject(createMatrix(2, 1, { type: "f32" }) as never, [1])).toThrow(
      TypeError,
    );
  });
});
