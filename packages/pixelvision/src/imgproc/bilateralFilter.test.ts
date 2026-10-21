import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { bilateralFilter } from "./bilateralFilter";

describe("bilateralFilter", () => {
  it("keeps a flat image flat and a hard edge hard", () => {
    const flat = createMatrix(6, 4);
    flat.data.fill(90);
    expect(bilateralFilter(flat).data.every((v) => v === 90)).toBe(true);

    // Across the edge the colour weight is exp(−190² / (2 · 10²)) ≈ 0.
    const edge = fromRows([
      [10, 10, 10, 200, 200, 200],
      [10, 10, 10, 200, 200, 200],
    ]);
    const kept = bilateralFilter(edge, { diameter: 5, sigmaColor: 10, sigmaSpace: 5 });
    expect(toRows(kept)).toEqual(toRows(edge));
  });

  it("smooths small differences", () => {
    const dot = createMatrix(5, 5);
    dot.data.fill(100);
    dot.data[12] = 110;
    const smooth = bilateralFilter(dot, { diameter: 5, sigmaColor: 50, sigmaSpace: 50 });
    // 110 among 20 neighbours of 100 with nearly equal weights: about 100.5.
    expect(smooth.data[12]).toBeGreaterThanOrEqual(100);
    expect(smooth.data[12]).toBeLessThanOrEqual(101);
    expect(smooth.data[0]).toBe(100);
  });

  it("uses the summed colour difference for RGB", () => {
    const rgb = fromRows([[10, 10, 10, 200, 20, 20, 200, 20, 20]], { channels: 3 });
    const result = bilateralFilter(rgb, { diameter: 3, sigmaColor: 10, sigmaSpace: 3 });
    expect(toRows(result)).toEqual(toRows(rgb));
  });

  it("derives the radius from sigmaSpace when the diameter is 0", () => {
    const ramp = fromRows([[0, 50, 100, 150, 200, 250]]);
    const derived = bilateralFilter(ramp, { diameter: 0, sigmaColor: 100, sigmaSpace: 2 });
    // radius round(1.5 · 2) = 3, the same as a diameter of 7.
    const seven = bilateralFilter(ramp, { diameter: 7, sigmaColor: 100, sigmaSpace: 2 });
    expect(toRows(derived)).toEqual(toRows(seven));
  });

  it("copies the image when a sigma is (almost) zero", () => {
    const image = fromRows([[1, 200, 3]]);
    expect(toRows(bilateralFilter(image, { sigmaColor: 0 }))).toEqual([[1, 200, 3]]);
    expect(toRows(bilateralFilter(image, { sigmaSpace: 1e-9 }))).toEqual([[1, 200, 3]]);
  });

  it("handles a 1-pixel image and writes into out", () => {
    const out = createMatrix(3, 3);
    expect(bilateralFilter(fromRows([[42]]), { out })).toBe(out);
    expect(Array.from(out.data.subarray(0, 1))).toEqual([42]);
  });

  it("rejects bad input", () => {
    expect(() => bilateralFilter(fromRows([[1, 2, 3, 4]], { channels: 4 }))).toThrow(RangeError);
    expect(() => bilateralFilter(fromRows([[1]]), { diameter: 2.5 })).toThrow(RangeError);
    expect(() => bilateralFilter(fromRows([[1]]), { sigmaColor: Number.NaN })).toThrow(RangeError);
    expect(() => bilateralFilter(fromRows([[1]]), { sigmaSpace: Infinity })).toThrow(RangeError);
    expect(() => bilateralFilter(fromRows([[1]], { type: "i32" }) as never)).toThrow(TypeError);
  });
});
