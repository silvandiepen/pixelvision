import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { noiseImage } from "../test-images";
import { buildPyramid } from "./pyramid";

describe("buildPyramid", () => {
  it("halves each level and keeps the image as level 0", () => {
    const image = noiseImage(64, 40);

    const pyramid = buildPyramid(image, 4);

    expect(pyramid[0]).toBe(image);
    expect(pyramid.map((l) => [l.width, l.height])).toEqual([
      [64, 40],
      [32, 20],
      [16, 10],
      [8, 5],
    ]);
  });

  it("builds a single level", () => {
    expect(buildPyramid(noiseImage(8, 8), 1)).toHaveLength(1);
  });

  it("rejects bad input", () => {
    expect(() => buildPyramid(noiseImage(8, 8), 0)).toThrow(RangeError);
    expect(() => buildPyramid(createMatrix(8, 8, { channels: 3 }), 2)).toThrow(RangeError);
    expect(() => buildPyramid(createMatrix(8, 8, { type: "f32" }) as never, 2)).toThrow(TypeError);
  });
});
