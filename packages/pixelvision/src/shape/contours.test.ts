import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { fromRows } from "../test-utils";
import { findContours } from "./contours";

describe("findContours", () => {
  it("traces a filled square clockwise from its top-left corner", () => {
    const image = fromRows([
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ]);

    const [contour] = findContours(image);

    expect(contour).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ]);
  });

  it("finds one contour per region and ignores holes", () => {
    const image = fromRows([
      [1, 1, 1, 0, 0, 0],
      [1, 0, 1, 0, 1, 0],
      [1, 1, 1, 0, 0, 0],
    ]);

    const contours = findContours(image);

    expect(contours).toHaveLength(2);
    expect(contours[0]).toHaveLength(8);
    expect(contours[1]).toEqual([{ x: 4, y: 1 }]);
  });

  it("joins diagonal neighbours (8-connected) and traces thin shapes", () => {
    const diagonal = fromRows([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);

    const [contour] = findContours(diagonal);

    expect(findContours(diagonal)).toHaveLength(1);
    expect(contour[0]).toEqual({ x: 0, y: 0 });
    expect(contour).toContainEqual({ x: 2, y: 2 });
  });

  it("skips small regions and handles regions touching the border", () => {
    const image = createMatrix(6, 6);
    image.data.fill(1, 0, 12);
    image.data[30] = 1;

    const contours = findContours(image, { minPixels: 2 });

    expect(contours).toHaveLength(1);
    expect(contours[0][0]).toEqual({ x: 0, y: 0 });
  });

  it("returns nothing for an empty image and rejects bad input", () => {
    expect(findContours(createMatrix(4, 4))).toEqual([]);
    expect(() => findContours(createMatrix(2, 2, { channels: 3 }))).toThrow(RangeError);
    expect(() => findContours(createMatrix(2, 2, { type: "f32" }) as never)).toThrow(TypeError);
  });
});
