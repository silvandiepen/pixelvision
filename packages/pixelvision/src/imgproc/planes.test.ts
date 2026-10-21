import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { forEachChannel } from "./planes";

describe("forEachChannel", () => {
  it("passes single-channel data through without copying", () => {
    const source = fromRows([[1, 2]]);
    const target = createMatrix(2, 1);
    let seen: unknown;

    forEachChannel(source, target, (input) => {
      seen = input;
    });

    expect(seen).toBe(source.data);
  });

  it("runs each channel separately and interleaves the results", () => {
    const source = fromRows([[1, 10, 2, 20]], { channels: 2 });
    const target = createMatrix(2, 1, { channels: 2 });
    const planes: number[][] = [];

    forEachChannel(source, target, (input, output) => {
      planes.push(Array.from(input));
      for (let i = 0; i < input.length; i++) output[i] = input[i] + 1;
    });

    expect(planes).toEqual([
      [1, 2],
      [10, 20],
    ]);
    expect(toRows(target)).toEqual([[2, 11, 3, 21]]);
  });
});
