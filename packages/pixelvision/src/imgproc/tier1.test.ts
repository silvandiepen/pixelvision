import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { adaptiveThreshold } from "./adaptiveThreshold";
import { rgbToHsv } from "./color";
import { inRange } from "./inRange";
import { laplacian } from "./laplacian";
import { medianBlur } from "./medianBlur";
import { morphology } from "./morphology";

describe("inRange", () => {
  it("marks pixels whose every channel is within bounds", () => {
    const rgb = fromRows([[10, 200, 30, 10, 50, 30]], { channels: 3 });

    expect(toRows(inRange(rgb, [0, 100, 0], [20, 255, 40]))).toEqual([[255, 0]]);
  });

  it("rejects bounds of the wrong length and writes into out", () => {
    const gray = fromRows([[5]]);
    const out = createMatrix(2, 2);

    expect(inRange(gray, [0], [9], out)).toBe(out);
    expect(() => inRange(gray, [0, 0], [9, 9])).toThrow(RangeError);
  });
});

describe("medianBlur", () => {
  it("removes a lone outlier and keeps edges", () => {
    const image = fromRows([
      [10, 10, 10, 200, 200],
      [10, 255, 10, 200, 200],
      [10, 10, 10, 200, 200],
    ]);

    const [, middle] = toRows(medianBlur(image));

    expect(middle[1]).toBe(10);
    expect(middle[4]).toBe(200);
  });

  it("filters each channel and accepts larger windows", () => {
    const rgb = fromRows([[1, 2, 3, 4, 5, 6, 7, 8, 9]], { channels: 3 });

    expect(medianBlur(rgb, 5).channels).toBe(3);
  });

  it("rejects even or tiny sizes", () => {
    expect(() => medianBlur(fromRows([[1]]), 4)).toThrow(RangeError);
    expect(() => medianBlur(fromRows([[1]]), 1)).toThrow(RangeError);
  });
});

describe("morphology", () => {
  const specks = fromRows([
    [0, 0, 0, 0, 0, 0],
    [0, 9, 9, 9, 0, 0],
    [0, 9, 9, 9, 0, 9],
    [0, 9, 9, 9, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ]);

  it("opens (removes specks) and closes (fills gaps)", () => {
    const opened = toRows(morphology(specks, "open"));

    expect(opened[2][5]).toBe(0);
    expect(opened[2][2]).toBe(9);
    expect(toRows(morphology(fromRows([[9, 0, 9]]), "close"))).toEqual([[9, 9, 9]]);
  });

  it("outlines shapes with the gradient, into a given matrix", () => {
    const out = createMatrix(1, 1);
    const gradient = morphology(specks, "gradient", { out });

    expect(gradient).toBe(out);
    expect(toRows(gradient)[2][2]).toBe(0);
    expect(toRows(gradient)[2][0]).toBe(9);
  });
});

describe("laplacian", () => {
  it("responds to a bright dot with both kernels", () => {
    const dot = fromRows([
      [0, 0, 0],
      [0, 10, 0],
      [0, 0, 0],
    ]);

    expect(toRows(laplacian(dot))[1][1]).toBe(-40);
    expect(toRows(laplacian(dot, { size: 3 }))[1][1]).toBe(-80);
  });

  it("handles a single pixel and rejects other sizes", () => {
    expect(Array.from(laplacian(fromRows([[7]])).data)).toEqual([0]);
    expect(() => laplacian(fromRows([[1]]), { size: 5 as never })).toThrow(RangeError);
  });
});

describe("adaptiveThreshold", () => {
  // A dark stroke on a background whose brightness ramps up.
  const image = createMatrix(30, 9);
  for (let y = 0; y < 9; y++)
    for (let x = 0; x < 30; x++) image.data[y * 30 + x] = 60 + x * 5 - (y === 4 ? 40 : 0);

  it("finds a dark stroke under uneven lighting", () => {
    const ink = toRows(adaptiveThreshold(image, { blockSize: 5, offset: 5, invert: true }));

    expect(ink[4].every((v) => v === 255)).toBe(true);
    expect(ink[0].every((v) => v === 0)).toBe(true);
  });

  it("supports the Gaussian mean, a custom value and an output matrix", () => {
    const out = createMatrix(1, 1);
    const result = adaptiveThreshold(image, {
      method: "gaussian",
      blockSize: 5,
      offset: 5,
      invert: true,
      max: 1,
      out,
    });

    expect(result).toBe(out);
    expect(toRows(result)[4][15]).toBe(1);
  });

  it("keeps the bright background without inverting", () => {
    const paper = toRows(adaptiveThreshold(image, { blockSize: 5, offset: 5 }));

    expect(paper[4].every((v) => v === 0)).toBe(true);
    expect(paper[0][15]).toBe(255);
  });

  it("rejects bad block sizes", () => {
    expect(() => adaptiveThreshold(image, { blockSize: 4 })).toThrow(RangeError);
  });
});

describe("rgbToHsv", () => {
  it("converts primaries as OpenCV does", () => {
    const pixel = (r: number, g: number, b: number) =>
      Array.from(rgbToHsv({ width: 1, height: 1, data: [r, g, b, 255] }).data);

    expect(pixel(255, 0, 0)).toEqual([0, 255, 255]);
    expect(pixel(0, 255, 0)).toEqual([60, 255, 255]);
    expect(pixel(0, 0, 255)).toEqual([120, 255, 255]);
    expect(pixel(255, 0, 128)).toEqual([165, 255, 255]);
    expect(pixel(128, 128, 128)).toEqual([0, 0, 128]);
    expect(pixel(0, 0, 0)).toEqual([0, 0, 0]);
  });

  it("reads 3-channel matrices, writes into out and rejects short data", () => {
    const out = createMatrix(1, 1, { channels: 3 });

    expect(rgbToHsv({ width: 1, height: 1, channels: 3, data: [0, 255, 0] }, out)).toBe(out);
    expect(() => rgbToHsv({ width: 2, height: 1, data: [0, 0, 0, 0] })).toThrow(RangeError);
  });
});
