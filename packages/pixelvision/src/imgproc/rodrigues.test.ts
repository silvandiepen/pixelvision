import { describe, expect, it } from "vitest";
import { rodrigues } from "./rodrigues";
import type { Vec3 } from "./rodrigues.model";

/**
 * Asserts two number lists agree within a tolerance.
 *
 * @param actual - Values.
 * @param expected - Expected values.
 * @param tolerance - Largest difference.
 */
const expectNear = (actual: ArrayLike<number>, expected: ArrayLike<number>, tolerance = 1e-12) => {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(Math.abs(actual[i] - expected[i])).toBeLessThanOrEqual(tolerance);
  }
};

describe("rodrigues", () => {
  it("turns a quarter turn about z into the matrix that maps x to y", () => {
    expectNear(rodrigues([0, 0, Math.PI / 2]), [0, -1, 0, 1, 0, 0, 0, 0, 1]);
    expectNear(rodrigues([Math.PI / 2, 0, 0]), [1, 0, 0, 0, 0, -1, 0, 1, 0]);
  });

  it("gives the identity for a zero vector, both ways", () => {
    expect(Array.from(rodrigues([0, 0, 0]))).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(rodrigues(Float64Array.of(1, 0, 0, 0, 1, 0, 0, 0, 1))).toEqual([0, 0, 0]);
  });

  it("round-trips rotations of every size, including tiny ones", () => {
    const vectors: Vec3[] = [
      [0.3, -1.2, 0.7],
      [2.5, 1, -0.4],
      [1e-7, -2e-7, 3e-7],
      [1e-12, 0, 0],
      [0, 0, 3],
    ];
    for (const v of vectors) {
      const back = rodrigues(rodrigues(v));
      const scale = Math.hypot(...v);
      for (let i = 0; i < 3; i++)
        expect(Math.abs(back[i] - v[i])).toBeLessThan(1e-12 * Math.max(scale, 1e-6));
    }
  });

  it("recovers half turns about axes of every sign", () => {
    const axes: Vec3[] = [
      [1, 0, 0],
      [1, 1, 0],
      [1, -1, 0],
      [1, 0, -1],
      [0, 1, 1],
      [0, 1, -1],
    ];
    for (const axis of axes) {
      const length = Math.hypot(...axis);
      const v = axis.map((a) => (a / length) * Math.PI) as Vec3;
      const back = rodrigues(rodrigues(v));
      // ±v are the same half turn; compare the matrices.
      expectNear(rodrigues(back), rodrigues(v), 1e-12);
      expect(Math.hypot(...back)).toBeCloseTo(Math.PI, 12);
    }
  });

  it("orthonormalises a matrix that is slightly off", () => {
    const exact = rodrigues([0.2, 0.4, -0.1]);
    const noisy = exact.map((v, i) => v + (i % 2 ? 1e-4 : -1e-4));
    const v = rodrigues(Float64Array.from(noisy));
    expectNear(v, [0.2, 0.4, -0.1], 1e-3);
  });

  it("rejects the wrong number of values", () => {
    expect(() => rodrigues(new Float64Array(3))).toThrow(RangeError);
    expect(() => rodrigues([1, 2] as unknown as Vec3)).toThrow(RangeError);
  });
});
