import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { flip } from "./flip";

describe("flip", () => {
  const image = fromRows(
    [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ],
    { channels: 2 },
  );

  it("mirrors left to right, keeping channels together", () => {
    expect(toRows(flip(image))).toEqual([
      [3, 4, 1, 2],
      [7, 8, 5, 6],
    ]);
  });

  it("mirrors top to bottom", () => {
    expect(toRows(flip(image, "vertical"))).toEqual([
      [5, 6, 7, 8],
      [1, 2, 3, 4],
    ]);
  });

  it("writes into a given matrix", () => {
    const out = createMatrix(1, 1, { channels: 2 });

    expect(flip(image, "horizontal", out)).toBe(out);
  });
});
