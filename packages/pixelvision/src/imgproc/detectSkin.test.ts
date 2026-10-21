import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { detectSkin } from "./detectSkin";

const pixel = (r: number, g: number, b: number) =>
  detectSkin({ width: 1, height: 1, data: [r, g, b, 255] }).data[0];

describe("detectSkin", () => {
  it("accepts typical skin tones", () => {
    expect(pixel(224, 172, 140)).toBe(255);
    expect(pixel(141, 85, 36)).toBe(255);
  });

  it.each([
    ["too dark red", 90, 60, 40],
    ["too little green", 200, 40, 30],
    ["too little blue", 200, 120, 20],
    ["green dominant", 120, 200, 100],
    ["blue dominant", 150, 100, 160],
    ["too gray", 120, 110, 105],
    ["red too close to green", 200, 190, 100],
  ])("rejects %s", (_, r, g, b) => {
    expect(pixel(r, g, b)).toBe(0);
  });

  it("writes into a given matrix", () => {
    const out = createMatrix(3, 3);

    expect(detectSkin({ width: 1, height: 1, data: [0, 0, 0, 0] }, { out })).toBe(out);
  });

  it("rejects data that is too short", () => {
    expect(() => detectSkin({ width: 2, height: 1, data: [0, 0, 0, 0] })).toThrow(RangeError);
  });
});
