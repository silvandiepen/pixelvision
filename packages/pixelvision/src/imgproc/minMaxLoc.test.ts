import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows } from "../test-utils";
import { minMaxLoc } from "./minMaxLoc";

describe("minMaxLoc", () => {
  const values = fromRows([
    [3, 1, 4],
    [1, 5, 9],
  ]);

  it("finds the extremes and the first position of each", () => {
    expect(minMaxLoc(values)).toEqual({
      min: 1,
      max: 9,
      minLoc: { x: 1, y: 0 },
      maxLoc: { x: 2, y: 1 },
    });
  });

  it("searches only where the mask is set, in any element type", () => {
    const mask = fromRows([
      [1, 0, 1],
      [0, 1, 0],
    ]);
    expect(minMaxLoc(values, mask)).toEqual({
      min: 3,
      max: 5,
      minLoc: { x: 0, y: 0 },
      maxLoc: { x: 1, y: 1 },
    });
    const floats = fromRows([[-0.5, 2.25]], { type: "f32" });
    expect(minMaxLoc(floats)).toMatchObject({ min: -0.5, max: 2.25 });
    expect(minMaxLoc(fromRows([[7]]))).toMatchObject({ min: 7, max: 7, minLoc: { x: 0, y: 0 } });
  });

  it("rejects input with nothing to search or the wrong shape", () => {
    expect(() => minMaxLoc(createMatrix(0, 0))).toThrow(RangeError);
    expect(() => minMaxLoc(values, createMatrix(3, 2))).toThrow(RangeError);
    expect(() => minMaxLoc(fromRows([[1, 2]], { channels: 2 }))).toThrow(RangeError);
    expect(() => minMaxLoc(values, createMatrix(2, 2))).toThrow(RangeError);
    expect(() => minMaxLoc(values, createMatrix(3, 2, { channels: 2 }))).toThrow(RangeError);
    expect(() => minMaxLoc(values, createMatrix(3, 2, { type: "f32" }) as never)).toThrow(
      TypeError,
    );
  });
});
