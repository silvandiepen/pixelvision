import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows } from "../test-utils";
import { matchTemplate } from "./matchTemplate";
import { minMaxLoc } from "./minMaxLoc";

describe("matchTemplate", () => {
  const image = fromRows([
    [3, 7, 1, 8, 2],
    [9, 4, 6, 0, 5],
    [2, 8, 3, 7, 1],
    [6, 1, 9, 4, 8],
  ]);
  const template = fromRows([
    [6, 0],
    [3, 7],
  ]);

  it("scores the window it was cut from as a perfect match", () => {
    for (const [method, perfect] of [
      ["sqdiff", 0],
      ["sqdiff-normed", 0],
      ["ccorr-normed", 1],
      ["ccoeff-normed", 1],
    ] as const) {
      const scores = matchTemplate(image, template, { method });
      expect([scores.width, scores.height]).toEqual([4, 3]);
      expect(scores.data[1 * 4 + 2], method).toBe(perfect);
      const { min, max, minLoc, maxLoc } = minMaxLoc(scores);
      expect(perfect === 0 ? [min, minLoc] : [max, maxLoc], method).toEqual([
        perfect,
        { x: 2, y: 1 },
      ]);
    }
  });

  it("computes squared differences and their normalised form", () => {
    const row = fromRows([[1, 2, 4]]);
    const one = fromRows([[2]]);
    expect(Array.from(matchTemplate(row, one, { method: "sqdiff" }).data)).toEqual([1, 0, 4]);
    // Divided by sqrt(window² · template²) = 2 · window.
    expect(Array.from(matchTemplate(row, one, { method: "sqdiff-normed" }).data)).toEqual([
      0.5, 0, 0.5,
    ]);
    // Every single pixel is proportional to every other one.
    expect(Array.from(matchTemplate(row, one, { method: "ccorr-normed" }).data)).toEqual([1, 1, 1]);
  });

  it("scores an inverted pattern −1 with the correlation coefficient", () => {
    const ramp = fromRows([[0, 10, 20, 30]]);
    const falling = fromRows([[30, 20]]);
    expect(Array.from(matchTemplate(ramp, falling).data)).toEqual([-1, -1, -1]);
    // Here the rounded numerator reaches the denominator exactly: clamped to −1.
    expect(Array.from(matchTemplate(fromRows([[199, 181]]), fromRows([[1, 19]])).data)).toEqual([
      -1,
    ]);
  });

  it("follows OpenCV for flat templates and flat windows", () => {
    // A flat template has no correlation coefficient: every position scores 1.
    expect(Array.from(matchTemplate(fromRows([[1, 5, 9]]), fromRows([[4, 4]])).data)).toEqual([
      1, 1,
    ]);
    // A flat window scores 0, or 1 (worst) for sqdiff-normed against a dark window.
    const dark = fromRows([[0, 0, 0, 7]]);
    const pattern = fromRows([[2, 5]]);
    expect(matchTemplate(dark, pattern).data[0]).toBe(0);
    expect(matchTemplate(dark, pattern, { method: "ccorr-normed" }).data[0]).toBe(0);
    expect(matchTemplate(dark, pattern, { method: "sqdiff-normed" }).data[0]).toBe(1);
  });

  it("sums over every channel of colour images", () => {
    const rgb = fromRows([[10, 20, 30, 40, 50, 60, 10, 20, 30]], { channels: 3 });
    const patch = fromRows([[40, 50, 60]], { channels: 3 });
    const scores = matchTemplate(rgb, patch, { method: "sqdiff" });
    expect(Array.from(scores.data)).toEqual([3 * 900, 0, 3 * 900]);
    const rgba = createMatrix(3, 1, { channels: 4 });
    rgba.data.set([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4]);
    expect(matchTemplate(rgba, createMatrix(1, 1, { channels: 4 })).width).toBe(3);
  });

  it("matches a template the size of the image and writes into out", () => {
    const out = createMatrix(9, 9, { type: "f32" });
    expect(matchTemplate(template, template, { method: "ccorr-normed", out })).toBe(out);
    expect([out.width, out.height, out.data[0]]).toEqual([1, 1, 1]);
  });

  it("rejects bad input", () => {
    expect(() => matchTemplate(image, createMatrix(6, 1))).toThrow(RangeError);
    expect(() => matchTemplate(image, createMatrix(0, 0))).toThrow(RangeError);
    expect(() => matchTemplate(image, createMatrix(1, 1, { channels: 3 }))).toThrow(RangeError);
    expect(() => matchTemplate(image, template, { method: "ccorr" as never })).toThrow(RangeError);
    expect(() =>
      matchTemplate(fromRows([[1, 2]], { channels: 2 }), fromRows([[1, 2]], { channels: 2 })),
    ).toThrow(RangeError);
    expect(() => matchTemplate(image, createMatrix(1, 1, { type: "f32" }) as never)).toThrow(
      TypeError,
    );
  });
});
