import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows } from "../test-utils";
import { clahe } from "./clahe";

/**
 * A flat image.
 *
 * @param width - Width.
 * @param height - Height.
 * @param value - Every pixel's value.
 * @returns The image.
 */
const flat = (width: number, height: number, value: number) => {
  const image = createMatrix(width, height);
  image.data.fill(value);
  return image;
};

describe("clahe", () => {
  it("clips a flat tile's single peak and spreads the excess", () => {
    // 8 x 8 in 2 x 2 tiles: 16 pixels a tile, limit trunc(40 · 16 / 256) = 2.
    // The 14 clipped pixels go one each to bins 0, 18, 36, …, 234; bin 100
    // sums bins 0–100: 6 spread + 2 kept = 8, and 8 · 255 / 16 = 127.5 → 128.
    const result = clahe(flat(8, 8, 100), { tileGridSize: { width: 2, height: 2 } });
    expect(result.data.every((v) => v === 128)).toBe(true);
  });

  it("equalises each tile fully without a clip limit", () => {
    const result = clahe(flat(8, 8, 100), { clipLimit: 0, tileGridSize: { width: 2, height: 2 } });
    expect(result.data.every((v) => v === 255)).toBe(true);
  });

  it("stretches a dull two-level image to the full range", () => {
    // Left half 100, right half 110, one tile: CDF 0.5 at 100, 1 at 110.
    const image = fromRows(
      Array.from({ length: 4 }, () => [100, 100, 100, 100, 110, 110, 110, 110]),
    );
    const result = clahe(image, { clipLimit: 0, tileGridSize: { width: 1, height: 1 } });
    expect(result.data[0]).toBe(128);
    expect(result.data[7]).toBe(255);
  });

  it("blends the mappings of neighbouring tiles between their centres", () => {
    // Two 8 x 8 tiles: the left all 50, the right all 200. Without clipping,
    // the left tile maps 50 and up to 255, the right maps everything below
    // 200 to 0. A 50 at x = 5, 6, 7 lies 1/8, 2/8, 3/8 of the way to the
    // right tile's centre: 255 · 7/8, 6/8, 5/8 = 223, 191, 159.
    const image = createMatrix(16, 8);
    for (let y = 0; y < 8; y++)
      image.data.fill(50, y * 16, y * 16 + 8).fill(200, y * 16 + 8, y * 16 + 16);
    const result = clahe(image, { clipLimit: 0, tileGridSize: { width: 2, height: 1 } });
    expect(Array.from(result.data.subarray(0, 16))).toEqual([
      255, 255, 255, 255, 255, 223, 191, 159, 255, 255, 255, 255, 255, 255, 255, 255,
    ]);
  });

  it("mirrors images that don't divide into the grid, down to 1 pixel", () => {
    expect(Array.from(clahe(fromRows([[37]])).data)).toEqual([255]);
    // 2 pixels padded to 8 tiles mirror back and forth: 10 20 | 10 20 10 20 10 20.
    const pair = clahe(fromRows([[10, 20]]), { clipLimit: 0 });
    expect(pair.width).toBe(2);
    expect(pair.data[1]).toBe(255);
    const odd = clahe(flat(7, 5, 60), { tileGridSize: { width: 2, height: 3 } });
    expect([odd.width, odd.height]).toEqual([7, 5]);
    expect(new Set(odd.data).size).toBe(1);
    // Divisible across but not down still pads both ways, as OpenCV does.
    expect(clahe(flat(8, 5, 60), { tileGridSize: { width: 2, height: 2 } }).height).toBe(5);
  });

  it("handles an empty image and writes into out", () => {
    const out = createMatrix(2, 2);
    expect(clahe(createMatrix(0, 0), { out })).toBe(out);
    expect(out.width).toBe(0);
  });

  it("rejects bad input", () => {
    const image = flat(4, 4, 1);
    expect(() => clahe(fromRows([[1, 2, 3]], { channels: 3 }))).toThrow(RangeError);
    expect(() => clahe(image, { tileGridSize: { width: 0, height: 2 } })).toThrow(RangeError);
    expect(() => clahe(image, { tileGridSize: { width: 2, height: 1.5 } })).toThrow(RangeError);
    expect(() => clahe(image, { clipLimit: Number.NaN })).toThrow(RangeError);
    expect(() => clahe(fromRows([[1]], { type: "f32" }) as never)).toThrow(TypeError);
  });
});
