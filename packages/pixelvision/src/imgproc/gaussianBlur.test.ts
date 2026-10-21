import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { gaussianBlur } from "./gaussianBlur";

describe("gaussianBlur", () => {
  it("keeps a flat image flat", () => {
    const flat = fromRows([
      [80, 80, 80],
      [80, 80, 80],
    ]);

    expect(toRows(gaussianBlur(flat))).toEqual(toRows(flat));
  });

  it("spreads a single bright pixel symmetrically", () => {
    const dot = fromRows([
      [0, 0, 0],
      [0, 255, 0],
      [0, 0, 0],
    ]);

    // Kernel [64, 128, 64] / 256 per pass, rounded down.
    expect(toRows(gaussianBlur(dot))).toEqual([
      [15, 31, 15],
      [31, 63, 31],
      [15, 31, 15],
    ]);
  });

  it("blurs float matrices without rounding", () => {
    const step = fromRows([[0, 0, 1, 1]], { type: "f32" });

    const blurred = toRows(gaussianBlur(step, { kernelSize: 3 }))[0];

    expect(blurred).toEqual([0, 0.25, 0.75, 1]);
  });

  it("blurs every channel separately", () => {
    const image = fromRows([[0, 200, 0, 200, 255, 200]], { channels: 2 });

    const [row] = toRows(gaussianBlur(image));

    expect([row[1], row[3], row[5]]).toEqual([200, 200, 200]);
    expect(row[2]).toBe(63);
  });

  it("picks an odd kernel from sigma", () => {
    const image = fromRows([
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);

    const row = toRows(gaussianBlur(image, { sigma: 2 }))[0];

    // 2 * ceil(6) + 1 = 13 taps: the spread reaches 6 pixels to either side.
    expect(row.slice(5, 18)).toEqual([...row.slice(5, 18)].reverse());
    expect(row[4]).toBe(0);
  });

  it("writes into a given matrix of the same type", () => {
    const out = createMatrix(5, 5);

    expect(gaussianBlur(fromRows([[1, 2]]), { out })).toBe(out);
    expect(out).toMatchObject({ width: 2, height: 1 });
  });

  it("returns an empty matrix for an empty image", () => {
    expect(gaussianBlur(createMatrix(0, 3)).data.length).toBe(0);
  });

  it.each([0, 4, 2.5])("rejects kernel size %s", (kernelSize) => {
    expect(() => gaussianBlur(fromRows([[1]]), { kernelSize })).toThrow(RangeError);
  });
});
