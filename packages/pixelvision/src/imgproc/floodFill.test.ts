import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { floodFill } from "./floodFill";

describe("floodFill", () => {
  const image = fromRows([
    [1, 1, 5, 9],
    [1, 1, 5, 9],
    [9, 9, 9, 9],
  ]);

  it("fills the equal-valued region round the seed", () => {
    const { image: filled, mask, area, rect } = floodFill(image, { x: 0, y: 0 }, 200);
    expect(area).toBe(4);
    expect(rect).toEqual({ x: 0, y: 0, width: 2, height: 2 });
    expect(toRows(filled)).toEqual([
      [200, 200, 5, 9],
      [200, 200, 5, 9],
      [9, 9, 9, 9],
    ]);
    expect(toRows(mask)).toEqual([
      [255, 255, 0, 0],
      [255, 255, 0, 0],
      [0, 0, 0, 0],
    ]);
    // The input is untouched unless it is also the output.
    expect(image.data[0]).toBe(1);
  });

  it("wraps round an L-shaped region and reports its bounding box", () => {
    const { area, rect } = floodFill(image, { x: 3, y: 0 }, 0);
    expect(area).toBe(6);
    expect(rect).toEqual({ x: 0, y: 0, width: 4, height: 3 });
  });

  it("crosses diagonals only with 8-connectivity", () => {
    const checker = fromRows([
      [0, 9, 9],
      [9, 0, 9],
      [9, 9, 0],
    ]);
    expect(floodFill(checker, { x: 0, y: 0 }, 5).area).toBe(1);
    const eight = floodFill(checker, { x: 0, y: 0 }, 5, { connectivity: 8 });
    expect(eight.area).toBe(3);
    expect(eight.rect).toEqual({ x: 0, y: 0, width: 3, height: 3 });
  });

  it("follows a gradient step by step unless the range is fixed to the seed", () => {
    const ramp = fromRows([
      [10, 12, 14, 16, 18],
      [10, 12, 14, 16, 18],
    ]);
    expect(floodFill(ramp, { x: 0, y: 0 }, 0, { loDiff: 2, upDiff: 2 }).area).toBe(10);
    // Fixed range: only values within [10 − 2, 10 + 2] of the seed.
    expect(
      floodFill(ramp, { x: 0, y: 0 }, 0, { loDiff: 2, upDiff: 2, fixedRange: true }).area,
    ).toBe(4);
    // In the next row a fixed range also extends to the left.
    const hook = fromRows([
      [9, 5, 5],
      [5, 5, 5],
    ]);
    expect(floodFill(hook, { x: 2, y: 0 }, 0, { fixedRange: true }).area).toBe(5);
    // Seeded in the middle, a fixed range reaches both ways.
    const middle = floodFill(ramp, { x: 2, y: 1 }, 0, { loDiff: 2, upDiff: 0, fixedRange: true });
    expect(middle.rect).toEqual({ x: 1, y: 0, width: 2, height: 2 });
    expect(middle.area).toBe(4);
  });

  it("applies loDiff below and upDiff above the reference", () => {
    const row = fromRows([[5, 8, 2, 6]]);
    // From 5: 8 is 3 above (upDiff 3 allows it), 2 is 6 below 8 (loDiff 2 stops it).
    expect(floodFill(row, { x: 0, y: 0 }, 0, { loDiff: 2, upDiff: 3 }).area).toBe(2);
    // loDiff 6 lets 2 join, and 6 is 4 above 2.
    expect(floodFill(row, { x: 0, y: 0 }, 0, { loDiff: 6, upDiff: 3 }).area).toBe(3);
    expect(floodFill(row, { x: 0, y: 0 }, 0, { loDiff: 6, upDiff: 4 }).area).toBe(4);
  });

  it("marks only the mask with maskOnly, and stops at mask pixels", () => {
    const flat = createMatrix(5, 3);
    const mask = createMatrix(5, 3);
    for (let y = 0; y < 3; y++) mask.data[y * 5 + 2] = 1;
    const result = floodFill(flat, { x: 0, y: 1 }, 9, { mask, maskOnly: true, maskValue: 7 });
    expect(result.mask).toBe(mask);
    expect(result.area).toBe(6);
    expect(toRows(mask)[0]).toEqual([7, 7, 1, 0, 0]);
    expect(result.image.data.every((v) => v === 0)).toBe(true);
    // Seeding on a marked pixel fills nothing.
    const again = floodFill(flat, { x: 2, y: 0 }, 9, { mask });
    expect(again.area).toBe(0);
    expect(again.rect).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it("compares every channel of colour images", () => {
    const rgb = fromRows([[10, 10, 10, 12, 10, 10, 10, 40, 10]], { channels: 3 });
    const { image: filled, area } = floodFill(rgb, { x: 0, y: 0 }, [1, 2, 3], {
      loDiff: [0, 0, 0],
      upDiff: [2, 0, 0],
    });
    expect(area).toBe(2);
    expect(toRows(filled)).toEqual([[1, 2, 3, 1, 2, 3, 10, 40, 10]]);
  });

  it("fills in place when out is the image, and handles a 1-pixel image", () => {
    const copy = fromRows([[4, 4]]);
    expect(floodFill(copy, { x: 1, y: 0 }, 300, { out: copy }).image).toBe(copy);
    expect(Array.from(copy.data)).toEqual([255, 255]);
    expect(floodFill(fromRows([[3]]), { x: 0, y: 0 }, 8).area).toBe(1);
  });

  it("lets a pixel join through the pixel above when its left neighbour is too far", () => {
    // Row 0 fills in steps of 1. In row 1, 7 is 2 above its left neighbour 5
    // but only 1 above the 6 over it, so it joins (OpenCV's check of the
    // parent row, limited to the parent's span).
    const steps = fromRows([
      [5, 6, 7],
      [5, 7, 7],
    ]);
    expect(floodFill(steps, { x: 0, y: 0 }, 1, { loDiff: 1, upDiff: 1 }).area).toBe(6);
    const diagonal = fromRows([
      [5, 6, 7],
      [5, 7, 8],
    ]);
    expect(
      floodFill(diagonal, { x: 0, y: 0 }, 1, { loDiff: 1, upDiff: 1, connectivity: 8 }).area,
    ).toBe(6);
  });

  it("reaches diagonally below the ends of a span with 8-connectivity", () => {
    const steps = fromRows([
      [0, 5, 5, 0],
      [5, 9, 9, 5],
    ]);
    expect(floodFill(steps, { x: 1, y: 0 }, 1).area).toBe(2);
    expect(floodFill(steps, { x: 1, y: 0 }, 1, { connectivity: 8 }).area).toBe(4);
  });

  it("rejects bad input", () => {
    const seed = { x: 0, y: 0 };
    expect(() => floodFill(image, { x: 4, y: 0 }, 1)).toThrow(RangeError);
    expect(() => floodFill(image, { x: 0.5, y: 0 }, 1)).toThrow(RangeError);
    expect(() => floodFill(image, { x: 0, y: -1 }, 1)).toThrow(RangeError);
    expect(() => floodFill(image, seed, 1, { connectivity: 6 as never })).toThrow(RangeError);
    expect(() => floodFill(image, seed, 1, { maskValue: 0 })).toThrow(RangeError);
    expect(() => floodFill(image, seed, 1, { maskValue: 256 })).toThrow(RangeError);
    expect(() => floodFill(image, seed, 1, { loDiff: -1 })).toThrow(RangeError);
    expect(() => floodFill(image, seed, [1, 2])).toThrow(RangeError);
    expect(() => floodFill(image, seed, Number.NaN)).toThrow(RangeError);
    expect(() => floodFill(fromRows([[1, 2, 3, 4]], { channels: 4 }), seed, 1)).toThrow(RangeError);
    expect(() => floodFill(image, seed, 1, { mask: createMatrix(2, 2) })).toThrow(RangeError);
    expect(() => floodFill(image, seed, 1, { mask: createMatrix(4, 3, { channels: 3 }) })).toThrow(
      RangeError,
    );
    expect(() =>
      floodFill(image, seed, 1, { mask: createMatrix(4, 3, { type: "f32" }) as never }),
    ).toThrow(TypeError);
    expect(() => floodFill(fromRows([[1]], { type: "i32" }) as never, seed, 1)).toThrow(TypeError);
  });
});
