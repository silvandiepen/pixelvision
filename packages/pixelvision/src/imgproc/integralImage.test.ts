import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { integralImage } from "./integralImage";

const image = fromRows([
  [1, 2],
  [3, 4],
]);

describe("integralImage", () => {
  it("builds the sum table with a zero first row and column", () => {
    const { sum, squares, tilted } = integralImage(image);

    expect(toRows(sum!)).toEqual([
      [0, 0, 0],
      [0, 1, 3],
      [0, 4, 10],
    ]);
    expect(squares).toBeUndefined();
    expect(tilted).toBeUndefined();
  });

  it("builds squared sums on request", () => {
    expect(toRows(integralImage(image, { sum: false, squares: true }).squares!)).toEqual([
      [0, 0, 0],
      [0, 1, 5],
      [0, 10, 30],
    ]);
  });

  it("answers any rectangle sum with four lookups", () => {
    const random = fromRows([
      [5, 1, 7, 3],
      [2, 8, 4, 6],
      [9, 0, 2, 1],
    ]);
    const { sum } = integralImage(random);
    const s = (x: number, y: number) => sum!.data[y * 5 + x];

    // Columns 1..2, rows 1..2: 8 + 4 + 0 + 2
    expect(s(3, 3) - s(1, 3) - s(3, 1) + s(1, 1)).toBe(14);
  });

  it("builds the tilted table", () => {
    const { tilted } = integralImage(image, { sum: false, tilted: true });

    expect(tilted).toMatchObject({ type: "f64", width: 3, height: 3 });
    expect(toRows(tilted!)[0]).toEqual([0, 0, 0]);
  });

  it("sums each rotated triangle, left edge included", () => {
    const random = fromRows([
      [3, 1, 4, 1, 5],
      [9, 2, 6, 5, 3],
      [5, 8, 9, 7, 9],
      [3, 2, 3, 8, 4],
    ]);
    const { tilted } = integralImage(random, { sum: false, tilted: true });

    // Brute force: T(X, Y) sums the pixels with y < Y and |x - X + 1| <= Y - y - 1.
    const expected = Array.from({ length: 5 }, (_, Y) =>
      Array.from({ length: 6 }, (_, X) => {
        let total = 0;
        for (let y = 0; y < Y; y++) {
          for (let x = 0; x < 5; x++) {
            if (Math.abs(x - X + 1) <= Y - y - 1) total += random.data[y * 5 + x];
          }
        }
        return total;
      }),
    );
    expect(toRows(tilted!)).toEqual(expected);
    expect(toRows(tilted!)[2][0]).toBe(3);
  });

  it("does not overflow on large sums", () => {
    const bright = createMatrix(300, 300, { data: new Uint8Array(90000).fill(255) });

    const { squares } = integralImage(bright, { squares: true });

    expect(squares!.data[squares!.data.length - 1]).toBe(255 * 255 * 90000);
  });

  it("rejects multi-channel input", () => {
    expect(() => integralImage(createMatrix(1, 1, { channels: 4 }))).toThrow(RangeError);
  });
});
