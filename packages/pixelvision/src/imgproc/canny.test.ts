import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { canny } from "./canny";

/** Draws a filled rectangle of `value` on a black image. */
const rectangle = (
  width: number,
  height: number,
  [x0, y0, x1, y1]: [number, number, number, number],
  value = 200,
): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) image.data[y * width + x] = value;
  return image;
};

const edgeCount = (edges: Matrix<"u8">) => edges.data.filter((v) => v === 255).length;

describe("canny", () => {
  it("outlines a rectangle with thin edges", () => {
    const edges = canny(rectangle(20, 20, [5, 5, 15, 15]), { low: 100, high: 300 });

    expect(edges.data.every((v) => v === 0 || v === 255)).toBe(true);
    // A thin outline has roughly the perimeter, far fewer pixels than the area.
    expect(edgeCount(edges)).toBeGreaterThan(30);
    expect(edgeCount(edges)).toBeLessThan(60);
    expect(edges.data[10 * 20 + 10]).toBe(0);
  });

  it("finds nothing in a flat image", () => {
    expect(edgeCount(canny(rectangle(10, 10, [0, 0, 10, 10]), { low: 1, high: 2 }))).toBe(0);
  });

  it("ignores edges weaker than the low threshold", () => {
    const faint = rectangle(20, 20, [5, 5, 15, 15], 10);

    expect(edgeCount(canny(faint, { low: 100, high: 200 }))).toBe(0);
  });

  it("swaps thresholds given in the wrong order", () => {
    const image = rectangle(20, 20, [5, 5, 15, 15]);

    expect(Array.from(canny(image, { low: 300, high: 100 }).data)).toEqual(
      Array.from(canny(image, { low: 100, high: 300 }).data),
    );
  });

  it("finds edges touching the bottom row", () => {
    // A rectangle cut off by the bottom of the image: its sides reach row 9.
    const edges = canny(rectangle(20, 10, [5, 4, 15, 10]), { low: 100, high: 300 });

    expect(edges.data.slice(9 * 20).some((v) => v === 255)).toBe(true);
  });

  it("follows weak edges connected to strong ones", () => {
    const image = createMatrix(30, 10);
    // A step whose strength fades from strong (left) to weak (right).
    for (let x = 0; x < 30; x++) {
      for (let y = 5; y < 10; y++) image.data[y * 30 + x] = Math.max(20, 200 - x * 6);
    }
    const strongOnly = edgeCount(canny(image, { low: 790, high: 800 }));
    const withHysteresis = edgeCount(canny(image, { low: 100, high: 800 }));

    expect(withHysteresis).toBeGreaterThan(strongOnly);
  });

  it("writes into a given matrix", () => {
    const out = createMatrix(1, 1);

    expect(canny(rectangle(8, 8, [2, 2, 6, 6]), { low: 50, high: 100, out })).toBe(out);
  });

  it("rejects colour and non-u8 input", () => {
    expect(() => canny(createMatrix(4, 4, { channels: 3 }), { low: 1, high: 2 })).toThrow(
      RangeError,
    );
    expect(() => canny(createMatrix(4, 4, { type: "i32" }) as never, { low: 1, high: 2 })).toThrow(
      TypeError,
    );
  });
});
