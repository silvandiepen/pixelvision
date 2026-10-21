import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { Rect } from "../shape/shapes.model";
import { camShift } from "./camShift";

/**
 * A black image with a filled, rotated ellipse of 255s.
 *
 * @param width - Image width.
 * @param height - Image height.
 * @param cx - Centre column.
 * @param cy - Centre row.
 * @param a - Half the long axis.
 * @param b - Half the short axis.
 * @param degrees - Direction of the long axis.
 * @returns The image.
 */
const ellipse = (
  width: number,
  height: number,
  cx: number,
  cy: number,
  a: number,
  b: number,
  degrees: number,
): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  const t = (degrees * Math.PI) / 180;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const u = dx * Math.cos(t) + dy * Math.sin(t);
      const v = -dx * Math.sin(t) + dy * Math.cos(t);
      if ((u / a) ** 2 + (v / b) ** 2 <= 1) image.data[y * width + x] = 255;
    }
  }
  return image;
};

/**
 * Runs camShift as on a video: each result's window starts the next call.
 *
 * @param image - The probability image, the same every frame.
 * @param window - The first window.
 * @param frames - Number of calls.
 * @returns The last result.
 */
const track = (image: Matrix<"u8">, window: Rect, frames = 8) => {
  let result = camShift(image, window);
  for (let i = 1; i < frames; i++) result = camShift(image, result.window);
  return result;
};

describe("camShift", () => {
  it("measures a rotated ellipse: its axes, direction and centre", () => {
    // Long axis 2 · 40 = 80 at 30°, short axis 2 · 15 = 30.
    const image = ellipse(200, 160, 100, 80, 40, 15, 30);
    // The window grows towards the whole ellipse over a few frames.
    const first = camShift(image, { x: 80, y: 60, width: 30, height: 30 });
    expect(first.box.height).toBeLessThan(70);
    const { box, window } = track(image, { x: 80, y: 60, width: 30, height: 30 });
    expect(box.height).toBeGreaterThan(79);
    expect(box.height).toBeLessThan(81);
    expect(box.width).toBeGreaterThan(29);
    expect(box.width).toBeLessThan(31);
    // `width` runs across the long axis: 30° + 90°.
    expect(box.angle).toBeCloseTo(120, 0);
    expect(box.center.x).toBeCloseTo(100, 1);
    expect(box.center.y).toBeCloseTo(80, 1);
    // The window fits the box's extent: |80 cos 30°| + 2 ≈ 71 wide.
    expect(window.width).toBeGreaterThanOrEqual(70);
    expect(window.width).toBeLessThanOrEqual(72);
    // The corners lie on the box.
    const [p0, p1, p2, p3] = box.corners;
    expect(Math.hypot(p1.x - p0.x, p1.y - p0.y)).toBeCloseTo(box.height, 6);
    expect(Math.hypot(p2.x - p1.x, p2.y - p1.y)).toBeCloseTo(box.width, 6);
    expect((p0.x + p2.x) / 2).toBeCloseTo(box.center.x, 9);
    expect((p1.y + p3.y) / 2).toBeCloseTo(box.center.y, 9);
  });

  it("puts the long axis in height whichever way the ellipse lies", () => {
    for (const degrees of [0, 90, 135]) {
      const image = ellipse(160, 160, 80, 80, 30, 12, degrees);
      const { box } = track(image, { x: 60, y: 60, width: 40, height: 40 });
      expect(box.height).toBeGreaterThan(box.width);
      expect(box.angle).toBeGreaterThanOrEqual(0);
      expect(box.angle).toBeLessThan(180);
      const across = (degrees + 90) % 180;
      const difference = Math.abs(box.angle - across);
      expect(Math.min(difference, 180 - difference)).toBeLessThan(1);
    }
  });

  it("reports the centroid as the centre, even against the image edge", () => {
    // An ellipse cut by the left edge: its pixels span x = 0 to 20.
    const image = ellipse(120, 100, 0, 50, 20, 30, 0);
    const { box, window } = track(image, { x: 0, y: 30, width: 30, height: 40 });
    expect(window.x).toBe(0);
    let sum = 0;
    let weighted = 0;
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 120; x++) {
        sum += image.data[y * 120 + x];
        weighted += image.data[y * 120 + x] * x;
      }
    }
    expect(box.center.x).toBeCloseTo(weighted / sum, 9);
    expect(box.center.y).toBeCloseTo(50, 9);
  });

  it("keeps the window inside the image near the right and bottom edges", () => {
    const image = ellipse(100, 80, 95, 76, 12, 8, 20);
    const { window } = track(image, { x: 80, y: 60, width: 20, height: 20 });
    expect(window.x + window.width).toBeLessThanOrEqual(100);
    expect(window.y + window.height).toBeLessThanOrEqual(80);
  });

  it("returns an empty box and the grown window where there is no probability", () => {
    const image = createMatrix(100, 100);
    const { box, window, iterations } = camShift(image, { x: 5, y: 50, width: 20, height: 20 });
    expect(box.width).toBe(0);
    expect(box.height).toBe(0);
    expect(box.corners).toHaveLength(4);
    // Grown by 10 on each side, clipped on the left without shrinking, as OpenCV does.
    expect(window).toEqual({ x: 0, y: 40, width: 40, height: 40 });
    expect(iterations).toBe(0);
  });

  it("rejects bad input", () => {
    const image = createMatrix(10, 10);
    expect(() => camShift(image, { x: 0, y: 0, width: 0, height: 3 })).toThrow(RangeError);
    expect(() => camShift(image, { x: 0, y: 0, width: 3, height: 3 }, { epsilon: -1 })).toThrow(
      RangeError,
    );
  });
});
