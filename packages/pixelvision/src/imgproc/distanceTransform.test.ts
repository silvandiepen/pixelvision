import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows } from "../test-utils";
import { distanceTransform } from "./distanceTransform";

/** Step costs as stored: the mask weight in 16-bit fixed point. */
const fixed = (weight: number) => Math.round(Math.fround(weight) * 65536) / 65536;

/**
 * A 7 x 7 image of 255 with a single zero at the centre.
 *
 * @returns The image.
 */
const dot = () => {
  const image = createMatrix(7, 7);
  image.data.fill(255);
  image.data[3 * 7 + 3] = 0;
  return image;
};

/**
 * Reads the distance at a pixel.
 *
 * @param data - Distances.
 * @param x - Column.
 * @param y - Row.
 * @returns The distance.
 */
const at = (data: Float32Array, x: number, y: number) => data[y * 7 + x];

describe("distanceTransform", () => {
  it("measures city-block and chessboard distance exactly", () => {
    const l1 = distanceTransform(dot(), { metric: "l1" }).data;
    const c = distanceTransform(dot(), { metric: "c" }).data;
    expect([at(l1, 3, 3), at(l1, 4, 3), at(l1, 4, 4), at(l1, 0, 0), at(l1, 6, 1)]).toEqual([
      0, 1, 2, 6, 5,
    ]);
    expect([at(c, 4, 4), at(c, 0, 0), at(c, 6, 1)]).toEqual([1, 3, 3]);
  });

  it("approximates Euclidean distance with OpenCV's 3 x 3 and 5 x 5 steps", () => {
    const three = distanceTransform(dot(), { metric: "l2", maskSize: 3 }).data;
    expect(at(three, 4, 3)).toBe(fixed(0.955));
    expect(at(three, 4, 4)).toBe(fixed(1.3693));
    expect(at(three, 5, 3)).toBe(2 * fixed(0.955));

    const five = distanceTransform(dot()).data;
    expect(at(five, 4, 3)).toBe(1);
    expect(at(five, 4, 4)).toBe(fixed(1.4));
    // A knight's move: 2 across, 1 down.
    expect(at(five, 5, 4)).toBe(fixed(2.1969));
    // True distance to (6, 0) is √18 ≈ 4.243: a diagonal three times.
    expect(at(five, 6, 0)).toBeCloseTo(3 * fixed(1.4), 6);
  });

  it("uses the 3 x 3 mask for l1 whatever the mask size", () => {
    const a = distanceTransform(dot(), { metric: "l1", maskSize: 5 }).data;
    const b = distanceTransform(dot(), { metric: "l1", maskSize: 3 }).data;
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("does not treat the image edge as background", () => {
    expect(distanceTransform(fromRows([[255, 255, 0]]), { metric: "l1" }).data[0]).toBe(2);
    const none = distanceTransform(fromRows([[255]])).data[0];
    expect(none).toBeGreaterThan(65000);
    expect(Array.from(distanceTransform(fromRows([[0]])).data)).toEqual([0]);
  });

  it("writes into out", () => {
    const out = createMatrix(1, 1, { type: "f32" });
    expect(distanceTransform(dot(), { out })).toBe(out);
    expect(out.width).toBe(7);
  });

  it("rejects bad input", () => {
    expect(() => distanceTransform(dot(), { metric: "l3" as never })).toThrow(RangeError);
    expect(() => distanceTransform(dot(), { maskSize: 4 as never })).toThrow(RangeError);
    expect(() => distanceTransform(fromRows([[1, 2]], { channels: 2 }))).toThrow(RangeError);
    expect(() => distanceTransform(fromRows([[1]], { type: "f32" }) as never)).toThrow(TypeError);
  });
});
