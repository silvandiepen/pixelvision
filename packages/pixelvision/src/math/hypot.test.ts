import { describe, expect, it } from "vitest";
import { hypot } from "./hypot";

describe("hypot", () => {
  it("computes the hypotenuse in either argument order", () => {
    expect(hypot(3, 4)).toBe(5);
    expect(hypot(-4, 3)).toBe(5);
  });

  it("returns 0 for two zeros", () => {
    expect(hypot(0, 0)).toBe(0);
  });

  it("doesn't overflow for huge values", () => {
    expect(hypot(1e200, 1e200)).toBeCloseTo(Math.SQRT2 * 1e200, -190);
  });
});
