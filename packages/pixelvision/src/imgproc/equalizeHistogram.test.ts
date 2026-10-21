import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { equalizeHistogram } from "./equalizeHistogram";

describe("equalizeHistogram", () => {
  it("stretches a narrow range over 0-255", () => {
    const dull = fromRows([[100, 101, 102, 103]]);

    // Cumulative counts 1..4 of 4, times 255/4, rounded.
    expect(toRows(equalizeHistogram(dull))).toEqual([[64, 128, 191, 255]]);
  });

  it("keeps the order of gray levels", () => {
    const image = fromRows([[10, 200, 50, 50, 120]]);

    const [row] = toRows(equalizeHistogram(image));

    expect(row[0]).toBeLessThan(row[2]);
    expect(row[2]).toBe(row[3]);
    expect(row[4]).toBeLessThan(row[1]);
  });

  it("writes into a given matrix and handles an empty image", () => {
    const out = createMatrix(2, 2);

    expect(equalizeHistogram(fromRows([[1]]), { out })).toBe(out);
    expect(equalizeHistogram(createMatrix(0, 0)).data.length).toBe(0);
  });

  it("rejects colour and non-u8 input", () => {
    expect(() => equalizeHistogram(createMatrix(1, 1, { channels: 3 }))).toThrow(RangeError);
    expect(() => equalizeHistogram(createMatrix(1, 1, { type: "f32" }) as never)).toThrow(
      TypeError,
    );
  });
});
