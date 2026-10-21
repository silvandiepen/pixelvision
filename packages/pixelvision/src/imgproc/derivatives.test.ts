import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows } from "../test-utils";
import { scharrDerivatives, sobelDerivatives } from "./derivatives";

const at = (data: ArrayLike<number>, width: number, x: number, y: number) => [
  data[(y * width + x) * 2],
  data[(y * width + x) * 2 + 1],
];

const verticalEdge = fromRows([
  [0, 0, 100, 100],
  [0, 0, 100, 100],
  [0, 0, 100, 100],
]);

describe("sobelDerivatives", () => {
  it("responds to a vertical edge in x only", () => {
    const g = sobelDerivatives(verticalEdge);

    expect(g).toMatchObject({ type: "i32", channels: 2, width: 4, height: 3 });
    // (100 - 0) * (1 + 2 + 1)
    expect(at(g.data, 4, 1, 1)).toEqual([400, 0]);
    expect(at(g.data, 4, 0, 1)).toEqual([0, 0]);
  });

  it("responds to a horizontal edge in y only", () => {
    const g = sobelDerivatives(
      fromRows([
        [0, 0, 0],
        [50, 50, 50],
        [50, 50, 50],
      ]),
    );

    expect(at(g.data, 3, 1, 0)).toEqual([0, 0]);
    expect(at(g.data, 3, 1, 1)).toEqual([0, 200]);
  });

  it("returns f32 gradients for float input", () => {
    const g = sobelDerivatives(fromRows([[0, 0.5, 1]], { type: "f32" }));

    expect(g.type).toBe("f32");
  });

  it("handles 1-pixel-tall and 1-pixel-wide images", () => {
    expect(Array.from(sobelDerivatives(fromRows([[0, 10, 20]])).data)).toEqual([
      40, 0, 80, 0, 40, 0,
    ]);
    // Two rows mirror onto each other, so there's no vertical difference to see.
    expect(Array.from(sobelDerivatives(fromRows([[0], [10]])).data)).toEqual([0, 0, 0, 0]);
  });

  it("writes into a given matrix", () => {
    const out = createMatrix(1, 1, { type: "i32", channels: 2 });

    expect(sobelDerivatives(verticalEdge, { out })).toBe(out);
  });

  it("rejects multi-channel input", () => {
    expect(() => sobelDerivatives(createMatrix(2, 2, { channels: 3 }))).toThrow(RangeError);
  });
});

describe("scharrDerivatives", () => {
  it("weights the smoothing 3-10-3", () => {
    const g = scharrDerivatives(verticalEdge);

    // (100 - 0) * (3 + 10 + 3)
    expect(at(g.data, 4, 1, 1)).toEqual([1600, 0]);
  });
});
