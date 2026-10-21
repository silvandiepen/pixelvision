import { describe, expect, it } from "vitest";
import { robustSharpness, sharpness } from "./sharpness";
import { blurred, faceScene, noisy } from "./testScenes";

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

describe("robustSharpness", () => {
  it("is 0 for a flat image and for images smaller than 3 x 3", () => {
    expect(robustSharpness(image(10, 10, () => 128))).toBe(0);
    expect(robustSharpness(image(2, 9, (x, y) => x * y * 20))).toBe(0);
    expect(robustSharpness(image(9, 2, (x, y) => x * y * 20))).toBe(0);
  });

  it("is the Laplacian variance without noise removal", () => {
    const { image: frame } = faceScene(160, 120, 0.8);
    expect(robustSharpness(frame, { noiseWeight: 0 })).toBeCloseTo(sharpness(frame), 6);
  });

  it("keeps the edges and drops the noise", () => {
    const { image: frame, box } = faceScene(160, 160, 1);
    const crop = { width: frame.width, height: frame.height, data: frame.data };
    const soft = blurred(frame, 3);
    // Noise lifts the plain Laplacian variance of a blurred frame far above the blurred frame's
    // own; the noise-like part is removed here, so it stays low.
    expect(sharpness(noisy(soft, 4))).toBeGreaterThan(sharpness(soft) * 5);
    expect(robustSharpness(noisy(soft, 4))).toBeLessThan(robustSharpness(crop) / 10);
    expect(robustSharpness(crop)).toBeGreaterThan(sharpness(crop, box) / 2);
  });

  it("removes more with a larger noise weight", () => {
    const noisyFace = noisy(faceScene(120, 120, 0.8).image, 6);
    const half = robustSharpness(noisyFace, { noiseWeight: 0.5 });
    expect(half).toBeGreaterThan(robustSharpness(noisyFace));
    expect(half).toBeLessThan(sharpness(noisyFace));
  });

  it("clamps to 0 when the noise estimate exceeds the variance", () => {
    const gray = noisy(faceScene(30, 30, 0.1).image, 8);
    expect(robustSharpness(gray, { noiseWeight: 3 })).toBe(0);
  });
});
