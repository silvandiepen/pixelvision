import { describe, expect, it } from "vitest";
import { DEFAULT_MAX_CAPTURE_PIXELS, fitToPixels } from "./captureSize";

describe("fitToPixels", () => {
  it("keeps a size within the budget", () => {
    expect(fitToPixels(1280, 720, DEFAULT_MAX_CAPTURE_PIXELS)).toEqual({
      width: 1280,
      height: 720,
      scale: 1,
    });
  });

  it("scales a larger size down to the budget, keeping its aspect ratio", () => {
    expect(fitToPixels(7680, 4320, 1920 * 1080)).toEqual({
      width: 1920,
      height: 1080,
      scale: 0.25,
    });

    const odd = fitToPixels(4001, 3001, DEFAULT_MAX_CAPTURE_PIXELS);
    expect(odd.width * odd.height).toBeLessThanOrEqual(DEFAULT_MAX_CAPTURE_PIXELS);
    expect(odd.width / odd.height).toBeCloseTo(4001 / 3001, 2);
    expect(odd.scale).toBeCloseTo(odd.width / 4001, 10);
  });

  it("never goes below one pixel, nor over the budget for extreme shapes", () => {
    expect(fitToPixels(100_000, 1, 10)).toMatchObject({ width: 10, height: 1 });
    expect(fitToPixels(1, 100_000, 10)).toMatchObject({ width: 1, height: 10 });
    expect(fitToPixels(4, 4, 0.5)).toMatchObject({ width: 1, height: 1 });
  });

  it.each([
    [0, 480, 1000],
    [640, -1, 1000],
    [NaN, 480, 1000],
    [640, Infinity, 1000],
    [640, 480, 0],
  ])("rejects %s x %s within %s", (width, height, budget) => {
    expect(() => fitToPixels(width, height, budget)).toThrow(RangeError);
  });
});
