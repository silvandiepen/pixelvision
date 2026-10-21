import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { otsuLevel, threshold } from "./threshold";

describe("otsuLevel", () => {
  it("splits two clusters between them", () => {
    const level = otsuLevel(fromRows([[10, 12, 11, 200, 205, 198]]));

    expect(level).toBeGreaterThanOrEqual(12);
    expect(level).toBeLessThan(198);
  });

  it("returns 0 for a flat image", () => {
    expect(otsuLevel(fromRows([[7, 7, 7]]))).toBe(0);
  });

  it("rejects colour and non-u8 input", () => {
    expect(() => otsuLevel(createMatrix(2, 2, { channels: 3 }))).toThrow(RangeError);
    expect(() => otsuLevel(createMatrix(2, 2, { type: "f32" }) as never)).toThrow(TypeError);
  });
});

describe("threshold", () => {
  const image = fromRows([[10, 100, 200]]);

  it("uses a given level", () => {
    expect(toRows(threshold(image, { level: 100 }))).toEqual([[0, 0, 255]]);
  });

  it("inverts and uses a custom value", () => {
    expect(toRows(threshold(image, { level: 50, max: 1, invert: true }))).toEqual([[1, 0, 0]]);
  });

  it("picks Otsu's level by default", () => {
    expect(toRows(threshold(fromRows([[10, 12, 200, 205]])))).toEqual([[0, 0, 255, 255]]);
  });

  it("writes into a given matrix and rejects bad input", () => {
    const out = createMatrix(1, 1);

    expect(threshold(image, { out })).toBe(out);
    expect(() => threshold(createMatrix(2, 2, { channels: 2 }))).toThrow(RangeError);
    expect(() => threshold(createMatrix(2, 2, { type: "i32" }) as never)).toThrow(TypeError);
  });
});
