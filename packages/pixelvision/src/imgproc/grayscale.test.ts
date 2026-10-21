import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { grayscale } from "./grayscale";

const pixel = (data: number[], channels?: number) => ({ width: 1, height: 1, data, channels });

describe("grayscale", () => {
  it("weights RGBA with BT.601 luma", () => {
    // 0.299 * 255 = 76.2, 0.587 * 255 = 149.7, 0.114 * 255 = 29.1
    expect(grayscale(pixel([255, 0, 0, 255])).data[0]).toBe(76);
    expect(grayscale(pixel([0, 255, 0, 255])).data[0]).toBe(150);
    expect(grayscale(pixel([0, 0, 255, 255])).data[0]).toBe(29);
  });

  it("keeps black, white and gray", () => {
    const image = {
      width: 3,
      height: 1,
      data: [0, 0, 0, 255, 255, 255, 255, 255, 128, 128, 128, 0],
    };

    expect(Array.from(grayscale(image).data)).toEqual([0, 255, 128]);
  });

  it("ignores alpha", () => {
    expect(grayscale(pixel([100, 100, 100, 0])).data[0]).toBe(100);
  });

  it("reads BGR orders with red and blue swapped", () => {
    expect(grayscale(pixel([255, 0, 0, 255]), { order: "bgra" }).data[0]).toBe(29);
    expect(grayscale(pixel([255, 0, 0]), { order: "bgr" }).data[0]).toBe(29);
  });

  it("reads RGB when asked or when the matrix has 3 channels", () => {
    expect(grayscale(pixel([255, 0, 0]), { order: "rgb" }).data[0]).toBe(76);
    expect(grayscale(pixel([255, 0, 0], 3)).data[0]).toBe(76);
  });

  it("returns a single-channel matrix of the input size", () => {
    const gray = grayscale({ width: 2, height: 3, data: new Uint8Array(24) });

    expect(gray).toMatchObject({ type: "u8", width: 2, height: 3, channels: 1 });
  });

  it("writes into a given output matrix", () => {
    const out = createMatrix(10, 10);

    const result = grayscale(pixel([255, 255, 255, 255]), { out });

    expect(result).toBe(out);
    expect(out).toMatchObject({ width: 1, height: 1, channels: 1 });
    expect(out.data[0]).toBe(255);
  });

  it("handles an empty image", () => {
    expect(grayscale({ width: 0, height: 0, data: [] }).data.length).toBe(0);
  });

  it("rejects data that is too short for the order", () => {
    expect(() => grayscale({ width: 2, height: 1, data: [0, 0, 0, 0, 0, 0] })).toThrow(RangeError);
  });
});
