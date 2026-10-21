import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { meanShift } from "./meanShift";

/**
 * A black image with one bright filled rectangle.
 *
 * @param width - Image width.
 * @param height - Image height.
 * @param blob - The rectangle.
 * @param blob.x - Left column.
 * @param blob.y - Top row.
 * @param blob.width - Width.
 * @param blob.height - Height.
 * @returns The image.
 */
const withBlob = (
  width: number,
  height: number,
  blob: { x: number; y: number; width: number; height: number },
): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  for (let y = blob.y; y < blob.y + blob.height; y++) {
    image.data.fill(255, y * width + blob.x, y * width + blob.x + blob.width);
  }
  return image;
};

describe("meanShift", () => {
  const image = withBlob(100, 80, { x: 60, y: 40, width: 10, height: 10 });

  it("centres the window on the blob", () => {
    // The blob's centroid is (64.5, 44.5); a 20 x 20 window centred there starts at 54.5 → 54.
    const { window, iterations } = meanShift(image, { x: 45, y: 30, width: 20, height: 20 });
    expect(window).toEqual({ x: 54, y: 34, width: 20, height: 20 });
    expect(iterations).toBeGreaterThan(0);
    expect(iterations).toBeLessThan(10);
  });

  it("stops after maxIterations, or at once when the move is below epsilon", () => {
    const start = { x: 45, y: 30, width: 20, height: 20 };
    expect(meanShift(image, start, { maxIterations: 1 }).iterations).toBe(1);
    // An epsilon of 100 px stops after the first move.
    const once = meanShift(image, start, { epsilon: 100 });
    expect(once.iterations).toBe(0);
    expect(once.window).not.toEqual(start);
    // With epsilon 0 it only stops on maxIterations.
    expect(meanShift(image, start, { epsilon: 0, maxIterations: 7 }).iterations).toBe(7);
  });

  it("stops where there is no probability", () => {
    const { window, iterations } = meanShift(image, { x: 0, y: 0, width: 10, height: 10 });
    expect(window).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    expect(iterations).toBe(0);
  });

  it("keeps the window inside the image and clips one that hangs over", () => {
    const corner = withBlob(50, 40, { x: 45, y: 35, width: 5, height: 5 });
    const { window } = meanShift(corner, { x: 30, y: 20, width: 20, height: 20 });
    expect(window).toEqual({ x: 30, y: 20, width: 20, height: 20 });
    // Hanging over the right and bottom edges, it's clipped to the image.
    const clipped = meanShift(corner, { x: 40, y: 30, width: 20, height: 20 });
    expect(clipped.window).toEqual({ x: 40, y: 30, width: 10, height: 10 });
  });

  it("restarts from the centre when the window is outside the image", () => {
    const centre = withBlob(40, 30, { x: 20, y: 15, width: 1, height: 1 });
    const { window } = meanShift(centre, { x: 100, y: 100, width: 5, height: 5 });
    expect(window).toEqual({ x: 20, y: 15, width: 1, height: 1 });
  });

  it("rejects bad input", () => {
    const w = { x: 0, y: 0, width: 4, height: 4 };
    expect(() => meanShift(createMatrix(8, 8, { type: "f32" }) as never, w)).toThrow(TypeError);
    expect(() => meanShift(createMatrix(8, 8, { channels: 2 }), w)).toThrow(RangeError);
    expect(() => meanShift(image, { ...w, width: 0 })).toThrow(RangeError);
    expect(() => meanShift(image, { ...w, height: -1 })).toThrow(RangeError);
    expect(() => meanShift(image, { ...w, x: 0.5 })).toThrow(RangeError);
    expect(() => meanShift(image, w, { maxIterations: 0 })).toThrow(RangeError);
    expect(() => meanShift(image, w, { epsilon: -1 })).toThrow(RangeError);
  });
});
