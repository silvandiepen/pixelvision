import { describe, expect, it } from "vitest";
import { createRng } from "./rng";

/**
 * OpenCV's `RNG::next`, written with 64-bit integers as a reference.
 *
 * @param state - Starting state.
 * @returns A function returning successive outputs.
 */
const reference = (state: bigint) => {
  let s = state === 0n ? 0xffffffffn : state;
  return () => {
    s = (s & 0xffffffffn) * 4164903690n + (s >> 32n);
    return Number(s & 0xffffffffn);
  };
};

describe("createRng", () => {
  it("follows OpenCV's multiply-with-carry sequence from its Hough seed", () => {
    const rng = createRng();
    const expected = reference(0xffffffffffffffffn);
    for (let i = 0; i < 1000; i++) expect(rng.next()).toBe(expected());
  });

  it("starts from a given seed, and from 0xffffffff for 0", () => {
    for (const seed of [1, 12345, 2 ** 40 + 7, Number.MAX_SAFE_INTEGER]) {
      const rng = createRng(seed);
      const expected = reference(BigInt(seed));
      for (let i = 0; i < 200; i++) expect(rng.next()).toBe(expected());
    }
    const zero = createRng(0);
    const expected = reference(0n);
    for (let i = 0; i < 10; i++) expect(zero.next()).toBe(expected());
  });

  it("draws whole numbers below a bound as next() modulo the bound", () => {
    const a = createRng(99);
    const b = reference(99n);
    for (let count = 1; count < 300; count++) expect(a.uniform(count)).toBe(b() % count);
  });

  it("rejects seeds that aren't whole, non-negative and safe", () => {
    expect(() => createRng(-1)).toThrow(RangeError);
    expect(() => createRng(1.5)).toThrow(RangeError);
    expect(() => createRng(2 ** 53)).toThrow(RangeError);
  });
});
