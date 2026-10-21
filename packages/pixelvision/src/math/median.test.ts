import { describe, expect, it } from "vitest";
import { median, selectLowerMedian } from "./median";

describe("median", () => {
  it("returns the middle value for odd counts", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([5])).toBe(5);
  });

  it("averages the two middle values for even counts", () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([1, 2])).toBe(1.5);
  });

  it("doesn't modify the input and returns NaN for no values", () => {
    const values = [9, 1, 5];
    median(values);

    expect(values).toEqual([9, 1, 5]);
    expect(median([])).toBeNaN();
  });

  it("agrees with sorting on random data", () => {
    let seed = 1;
    for (let n = 1; n < 60; n++) {
      const values = Array.from({ length: n }, () => (seed = (seed * 48271) % 2147483647) % 100);
      const sorted = [...values].sort((a, b) => a - b);
      const expected = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

      expect(median(values)).toBe(expected);
    }
  });
});

describe("selectLowerMedian", () => {
  it("selects the lower median of a sub-range", () => {
    expect(selectLowerMedian([100, 4, 1, 3, 2, -100], 1, 4)).toBe(2);
  });
});
