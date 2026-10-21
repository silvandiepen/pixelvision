import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { pyrDown, pyrDownPlane } from "./pyrDown";

describe("pyrDown", () => {
  it("averages 2x2 blocks, rounding to nearest", () => {
    const image = fromRows([
      [0, 2, 10, 10],
      [1, 2, 10, 11],
    ]);

    // (0+2+1+2+2)>>2 = 1, (10+10+10+11+2)>>2 = 10
    expect(toRows(pyrDown(image))).toEqual([[1, 10]]);
  });

  it("drops an odd last row and column", () => {
    expect(pyrDown(createMatrix(5, 3))).toMatchObject({ width: 2, height: 1 });
  });

  it("halves each channel separately", () => {
    const image = fromRows(
      [
        [4, 100, 8, 200],
        [4, 100, 8, 200],
      ],
      { channels: 2 },
    );

    expect(toRows(pyrDown(image))).toEqual([[6, 150]]);
  });

  it("writes into a given matrix", () => {
    const out = createMatrix(8, 8);

    expect(pyrDown(createMatrix(4, 4), { out })).toBe(out);
    expect(out).toMatchObject({ width: 2, height: 2 });
  });

  it("rejects non-u8 input", () => {
    expect(() => pyrDown(createMatrix(2, 2, { type: "i32" }) as never)).toThrow(TypeError);
  });
});

describe("pyrDownPlane", () => {
  it("starts at an offset and leaves the rest untouched", () => {
    const source = Array.from({ length: 36 }, (_, i) => i);
    const target = new Array<number>(9).fill(-1);

    pyrDownPlane(source, target, 6, 6, 1, 0);

    // Offset 1 column: one block per row fits (3 - 2 * 1).
    expect(target[0]).toBe((1 + 2 + 7 + 8 + 2) >> 2);
    expect(target[1]).toBe(-1);
  });
});
