import { describe, expect, it } from "vitest";
import { gaussianKernel } from "./gaussianKernel";

const sum = (values: ArrayLike<number>) => Array.from(values).reduce((a, b) => a + b, 0);

describe("gaussianKernel", () => {
  it("uses binomial weights for small odd sizes without sigma", () => {
    expect(Array.from(gaussianKernel(1))).toEqual([1]);
    expect(Array.from(gaussianKernel(3))).toEqual([0.25, 0.5, 0.25]);
    expect(Array.from(gaussianKernel(5, { integer: true }))).toEqual([16, 64, 96, 64, 16]);
  });

  it("is symmetric, peaks in the middle and sums to 1", () => {
    const kernel = Array.from(gaussianKernel(9, { sigma: 1.5 }));

    expect(kernel).toEqual([...kernel].reverse());
    expect(Math.max(...kernel)).toBe(kernel[4]);
    expect(sum(kernel)).toBeCloseTo(1, 6);
  });

  it("derives sigma from the size when none is given", () => {
    const derived = gaussianKernel(9);
    const explicit = gaussianKernel(9, { sigma: 0.3 * (4 - 1) + 0.8 });

    expect(Array.from(derived)).toEqual(Array.from(explicit));
  });

  it("returns fixed-point weights summing to about 256", () => {
    const kernel = gaussianKernel(11, { sigma: 2, integer: true });

    expect(kernel).toBeInstanceOf(Int32Array);
    expect(Math.abs(sum(kernel) - 256)).toBeLessThanOrEqual(kernel.length);
  });

  it("widens with sigma", () => {
    const narrow = gaussianKernel(7, { sigma: 0.5 });
    const wide = gaussianKernel(7, { sigma: 3 });

    expect(wide[0]).toBeGreaterThan(narrow[0]);
    expect(wide[3]).toBeLessThan(narrow[3]);
  });

  it.each([0, -1, 2.5])("rejects size %s", (size) => {
    expect(() => gaussianKernel(size)).toThrow(RangeError);
  });
});
