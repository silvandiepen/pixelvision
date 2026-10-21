import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { dilate, erode } from "./morphology";

const dot = fromRows([
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 9, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
]);

describe("dilate", () => {
  it("grows a pixel into a square", () => {
    expect(toRows(dilate(dot))).toEqual([
      [0, 0, 0, 0, 0],
      [0, 9, 9, 9, 0],
      [0, 9, 9, 9, 0],
      [0, 9, 9, 9, 0],
      [0, 0, 0, 0, 0],
    ]);
  });

  it("grows further with radius and iterations", () => {
    expect(dilate(dot, { radius: 2 }).data.every((v) => v === 9)).toBe(true);
    expect(toRows(dilate(dot, { iterations: 2 }))).toEqual(toRows(dilate(dot, { radius: 2 })));
  });

  it("does nothing with zero iterations, writes into out", () => {
    const out = createMatrix(1, 1);

    expect(toRows(dilate(dot, { iterations: 0, out }))).toEqual(toRows(dot));
  });
});

describe("erode", () => {
  it("removes a lone pixel and shrinks a block", () => {
    const block = dilate(dot);

    expect(erode(dot).data.every((v) => v === 0)).toBe(true);
    expect(toRows(erode(block))).toEqual(toRows(dot));
  });

  it("rejects bad input", () => {
    expect(() => erode(dot, { radius: -1 })).toThrow(RangeError);
    expect(() => erode(createMatrix(2, 2, { channels: 3 }))).toThrow(RangeError);
    expect(() => dilate(createMatrix(2, 2, { type: "f32" }) as never)).toThrow(TypeError);
  });
});
