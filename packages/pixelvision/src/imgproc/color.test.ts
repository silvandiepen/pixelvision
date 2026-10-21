import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { fromRows } from "../test-utils";
import {
  hlsToRgb,
  hsvToRgb,
  labToRgb,
  rgbToHls,
  rgbToHsv,
  rgbToLab,
  rgbToYCrCb,
  yCrCbToRgb,
} from "./color";

/**
 * Converts one RGB pixel.
 *
 * @param convert - The conversion.
 * @param rgb - R, G, B.
 * @returns The three output values.
 */
const pixel = (convert: (image: Matrix<"u8">) => Matrix<"u8">, rgb: number[]) =>
  Array.from(convert(fromRows([rgb], { channels: 3 })).data);

describe("rgbToHls", () => {
  it("puts every pure hue at lightness 128 and saturation 255", () => {
    expect(pixel(rgbToHls, [255, 0, 0])).toEqual([0, 128, 255]);
    expect(pixel(rgbToHls, [0, 255, 0])).toEqual([60, 128, 255]);
    expect(pixel(rgbToHls, [0, 0, 255])).toEqual([120, 128, 255]);
    // Magenta: 300° stored as 150.
    expect(pixel(rgbToHls, [255, 0, 255])).toEqual([150, 128, 255]);
  });

  it("gives grays no saturation and dark colours low lightness", () => {
    expect(pixel(rgbToHls, [255, 255, 255])).toEqual([0, 255, 0]);
    expect(pixel(rgbToHls, [0, 0, 0])).toEqual([0, 0, 0]);
    expect(pixel(rgbToHls, [128, 128, 128])).toEqual([0, 128, 0]);
    // Dark red: L = (128 / 255) / 2 · 255 = 64, still fully saturated.
    expect(pixel(rgbToHls, [128, 0, 0])).toEqual([0, 64, 255]);
  });

  it("reads RGBA image data and writes into out", () => {
    const out = createMatrix(1, 1, { channels: 3 });
    expect(rgbToHls({ width: 1, height: 1, data: [0, 255, 0, 255] }, out)).toBe(out);
    expect(Array.from(out.data)).toEqual([60, 128, 255]);
  });
});

describe("hlsToRgb", () => {
  it("rebuilds primaries and grays", () => {
    // p2 = 1, p1 = 2 · 128/255 − 1 = 1/255: the other channels land on 1.
    expect(pixel(hlsToRgb, [0, 128, 255])).toEqual([255, 1, 1]);
    expect(pixel(hlsToRgb, [60, 128, 255])).toEqual([1, 255, 1]);
    expect(pixel(hlsToRgb, [120, 64, 255])).toEqual([0, 0, 128]);
    expect(pixel(hlsToRgb, [90, 200, 0])).toEqual([200, 200, 200]);
  });

  it("wraps hues of 180 and above round the wheel", () => {
    expect(pixel(hlsToRgb, [180, 64, 255])).toEqual(pixel(hlsToRgb, [0, 64, 255]));
  });
});

describe("hsvToRgb", () => {
  it("rebuilds primaries from hue sectors", () => {
    expect(pixel(hsvToRgb, [0, 255, 255])).toEqual([255, 0, 0]);
    expect(pixel(hsvToRgb, [60, 255, 255])).toEqual([0, 255, 0]);
    expect(pixel(hsvToRgb, [120, 255, 255])).toEqual([0, 0, 255]);
    expect(pixel(hsvToRgb, [30, 255, 255])).toEqual([255, 255, 0]);
    expect(pixel(hsvToRgb, [180, 255, 255])).toEqual([255, 0, 0]);
  });

  it("gives value as gray without saturation, and inverts rgbToHsv on primaries", () => {
    expect(pixel(hsvToRgb, [77, 0, 90])).toEqual([90, 90, 90]);
    for (const rgb of [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 255],
    ]) {
      expect(pixel((m) => hsvToRgb(rgbToHsv(m)), rgb)).toEqual(rgb);
    }
  });
});

describe("rgbToYCrCb and yCrCbToRgb", () => {
  it("keep grays at the chroma centre", () => {
    expect(pixel(rgbToYCrCb, [255, 255, 255])).toEqual([255, 128, 128]);
    expect(pixel(rgbToYCrCb, [0, 0, 0])).toEqual([0, 128, 128]);
    expect(pixel(yCrCbToRgb, [255, 128, 128])).toEqual([255, 255, 255]);
    expect(pixel(yCrCbToRgb, [40, 128, 128])).toEqual([40, 40, 40]);
  });

  it("converts red with the fixed-point weights", () => {
    // Y = (255 · 4899 + 8192) >> 14 = 76; Cr = 128 + (255 − 76) · 0.713 saturates;
    // Cb = 128 + (0 − 76) · 0.564 = 85.
    expect(pixel(rgbToYCrCb, [255, 0, 0])).toEqual([76, 255, 85]);
    // Back: R = 76 + 127 · 1.403 = 254, G = 76 − 43 · 0.344 − 127 · 0.714 = 0, B = 76 − 43 · 1.773 = 0.
    expect(pixel(yCrCbToRgb, [76, 255, 85])).toEqual([254, 0, 0]);
  });
});

describe("rgbToLab and labToRgb", () => {
  it("map white and black to the ends of L with neutral a and b", () => {
    expect(pixel(rgbToLab, [255, 255, 255])).toEqual([255, 128, 128]);
    expect(pixel(rgbToLab, [0, 0, 0])).toEqual([0, 128, 128]);
    expect(pixel(labToRgb, [255, 128, 128])).toEqual([255, 255, 255]);
    expect(pixel(labToRgb, [0, 128, 128])).toEqual([0, 0, 0]);
  });

  it("puts red at positive a and b, and blue at negative b", () => {
    const [, aRed, bRed] = pixel(rgbToLab, [255, 0, 0]);
    const [, , bBlue] = pixel(rgbToLab, [0, 0, 255]);
    expect(aRed).toBeGreaterThan(128 + 60);
    expect(bRed).toBeGreaterThan(128 + 40);
    expect(bBlue).toBeLessThan(128 - 80);
  });

  it("round-trips colours within the precision of 8-bit Lab", () => {
    // L, a and b are stored in whole bytes, so a round trip can move a
    // channel by a few levels, most in dark saturated colours.
    expect(pixel((m) => labToRgb(rgbToLab(m)), [200, 30, 40])).toEqual([199, 30, 40]);
    expect(pixel((m) => labToRgb(rgbToLab(m)), [12, 140, 220])).toEqual([9, 140, 219]);
    expect(pixel((m) => labToRgb(rgbToLab(m)), [128, 128, 128])).toEqual([128, 128, 128]);
  });
});

describe("colour conversion input", () => {
  const forward = [rgbToHsv, rgbToHls, rgbToLab, rgbToYCrCb];
  const inverse = [hsvToRgb, hlsToRgb, labToRgb, yCrCbToRgb];

  it("handles a 1-pixel image and reuses out", () => {
    for (const convert of [...forward, ...inverse]) {
      const out = createMatrix(5, 5, { channels: 3 });
      const result = convert(fromRows([[10, 20, 30]], { channels: 3 }), out);
      expect(result).toBe(out);
      expect([result.width, result.height, result.channels]).toEqual([1, 1, 3]);
    }
  });

  it("rejects short data and fewer than 3 channels", () => {
    for (const convert of forward) {
      expect(() => convert({ width: 2, height: 1, data: [0, 0, 0, 0] })).toThrow(RangeError);
      expect(() => convert(fromRows([[1, 2]], { channels: 2 }))).toThrow(RangeError);
    }
  });

  it("needs 3-channel u8 matrices for the inverses", () => {
    for (const convert of inverse) {
      expect(() => convert(fromRows([[1, 2, 3, 4]], { channels: 4 }))).toThrow(RangeError);
      expect(() => convert(fromRows([[1, 2, 3]], { type: "i32", channels: 3 }) as never)).toThrow(
        TypeError,
      );
    }
  });
});
