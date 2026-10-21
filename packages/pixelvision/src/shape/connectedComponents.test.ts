import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows, toRows } from "../test-utils";
import { connectedComponents } from "./connectedComponents";

describe("connectedComponents", () => {
  const image = fromRows([
    [0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0],
  ]);

  it("labels 8-connected regions by first 2x2 block and measures them", () => {
    const { labels, components } = connectedComponents(image);

    // The region in block row 0 at the left comes first, as in OpenCV.
    expect(toRows(labels)).toEqual([
      [0, 0, 0, 0, 2, 2],
      [1, 0, 0, 0, 2, 2],
      [0, 1, 0, 0, 0, 0],
    ]);
    expect(components[0]).toMatchObject({ label: 1, x: 0, y: 1, width: 2, height: 2, area: 2 });
    expect(components[1]).toMatchObject({ label: 2, area: 4, centroid: { x: 4.5, y: 0.5 } });
  });

  it("separates diagonal neighbours with 4-connectivity, numbering row by row", () => {
    const { components } = connectedComponents(image, 4);

    expect(components.map((c) => c.area)).toEqual([4, 1, 1]);
  });

  it("returns nothing for an empty image and rejects bad input", () => {
    expect(connectedComponents(createMatrix(3, 3)).components).toEqual([]);
    expect(() => connectedComponents(image, 6 as never)).toThrow(RangeError);
    expect(() => connectedComponents(createMatrix(2, 2, { channels: 3 }))).toThrow(RangeError);
  });
});
