import { describe, expect, it } from "vitest";
import { sharpness } from "./sharpness";

const image = (width: number, height: number, fn: (x: number, y: number) => number) => {
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data[y * width + x] = fn(x, y);
  return { width, height, data };
};

describe("sharpness", () => {
  it("is 0 for a flat image", () => {
    expect(sharpness(image(10, 10, () => 128))).toBe(0);
  });

  it("scores a crisp edge above a blurred one", () => {
    const crisp = image(20, 20, (x) => (x < 10 ? 0 : 255));
    const soft = image(20, 20, (x) => Math.max(0, Math.min(255, (x - 5) * 25)));
    expect(sharpness(crisp)).toBeGreaterThan(sharpness(soft));
  });

  it("scores only the region, clipped to the image", () => {
    const img = image(20, 20, (x) => (x < 10 ? 0 : 255));
    expect(sharpness(img, { x: 0, y: 0, width: 5, height: 20 })).toBe(0);
    expect(sharpness(img, { x: -10, y: -10, width: 100, height: 100 })).toBe(sharpness(img));
  });

  it("is 0 for regions without interior pixels", () => {
    expect(sharpness(image(2, 2, () => 9))).toBe(0);
    expect(
      sharpness(
        image(20, 20, (x) => x),
        { x: 5, y: 5, width: 0, height: 0 },
      ),
    ).toBe(0);
  });
});
