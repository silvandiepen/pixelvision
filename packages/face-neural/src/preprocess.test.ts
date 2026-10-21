import { describe, expect, it } from "vitest";
import { INPUT_SIZE } from "./decode";
import { letterbox } from "./preprocess";

describe("letterbox", () => {
  const area = INPUT_SIZE * INPUT_SIZE;

  it("scales to fit, converts RGB to BGR planes and pads with 0", () => {
    const rgba = {
      width: 2,
      height: 1,
      data: Uint8ClampedArray.of(10, 20, 30, 255, 10, 20, 30, 255),
    };

    const { data, scale } = letterbox(rgba);

    expect(scale).toBe(320);
    // Inside the image: B, G, R planes.
    expect([data[0], data[area], data[2 * area]]).toEqual([30, 20, 10]);
    // Below the image (row 400): padding.
    expect(data[400 * INPUT_SIZE]).toBe(0);
  });

  it("reads gray and RGB matrices", () => {
    const gray = { width: 1, height: 1, channels: 1, data: [77] };
    const rgb = { width: 1, height: 1, channels: 3, data: [1, 2, 3] };

    expect(letterbox(gray).data[area]).toBe(77);
    expect(letterbox(rgb).data[0]).toBe(3);
  });

  it("interpolates between pixels", () => {
    const ramp = { width: 2, height: 2, channels: 1, data: [0, 100, 0, 100] };

    const { data } = letterbox(ramp);

    expect(data[160]).toBeGreaterThan(0);
    expect(data[160]).toBeLessThan(100);
  });
});
