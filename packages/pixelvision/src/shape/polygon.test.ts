import { describe, expect, it } from "vitest";
import { approxPolygon, arcLength, contourArea, isConvex } from "./polygon";

const rectangle = [
  { x: 0, y: 0 },
  { x: 4, y: 0 },
  { x: 4, y: 3 },
  { x: 0, y: 3 },
];

describe("contourArea and arcLength", () => {
  it("measures a rectangle", () => {
    expect(contourArea(rectangle)).toBe(12);
    expect(contourArea([...rectangle].reverse())).toBe(-12);
    expect(arcLength(rectangle)).toBe(14);
    expect(arcLength(rectangle, false)).toBe(11);
  });
});

describe("approxPolygon", () => {
  it("reduces a dense outline of a rectangle to its corners", () => {
    const outline = [];
    for (let x = 0; x < 40; x++) outline.push({ x, y: 0 });
    for (let y = 0; y < 30; y++) outline.push({ x: 40, y });
    for (let x = 40; x > 0; x--) outline.push({ x, y: 30 });
    for (let y = 30; y > 0; y--) outline.push({ x: 0, y });

    const polygon = approxPolygon(outline, 1);

    expect(polygon).toHaveLength(4);
    expect(polygon).toEqual(
      expect.arrayContaining([
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 40, y: 30 },
        { x: 0, y: 30 },
      ]),
    );
  });

  it("handles an outline that is a single repeated point", () => {
    const point = { x: 1, y: 1 };

    expect(approxPolygon([point, point, point, point], 0.5).length).toBeLessThanOrEqual(2);
  });

  it("keeps tiny inputs and collapses degenerate segments", () => {
    expect(approxPolygon([{ x: 1, y: 1 }], 1)).toEqual([{ x: 1, y: 1 }]);
    const repeated = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 0 },
    ];
    expect(approxPolygon(repeated, 0.5).length).toBeLessThanOrEqual(3);
  });
});

describe("approxPolygon gives OpenCV's approxPolyDP vertices", () => {
  /**
   * Points from `[x, y]` pairs.
   *
   * @param pairs - Coordinates.
   * @returns Points.
   */
  const points = (pairs: number[][]) => pairs.map(([x, y]) => ({ x, y }));
  // Outlines found while testing against OpenCV.js 4.12; expected vertices are OpenCV's.
  const hook = points([
    [98, 108],
    [98, 109],
    [99, 110],
    [99, 111],
    [99, 110],
    [100, 109],
    [101, 109],
    [100, 108],
    [99, 108],
  ]);

  it("returns nothing for an empty outline", () => {
    expect(approxPolygon([], 1)).toEqual([]);
  });

  it("drops vertices on nearly straight diagonal runs", () => {
    expect(approxPolygon(hook, 0.9)).toEqual(
      points([
        [98, 108],
        [99, 111],
        [101, 109],
      ]),
    );
  });

  it("keeps every vertex with a tiny tolerance, a revisited pixel included", () => {
    // (99, 110) is visited twice.
    expect(approxPolygon(hook, 0.05)).toEqual(
      points([
        [100, 108],
        [98, 108],
        [98, 109],
        [99, 110],
        [99, 111],
        [99, 110],
        [100, 109],
        [101, 109],
      ]),
    );
  });

  it("drops a vertex as the clean-up wraps round to the start", () => {
    const outline = points([
      [17, 11],
      [17, 12],
      [16, 13],
      [16, 14],
      [16, 15],
      [16, 16],
      [15, 17],
      [15, 18],
      [15, 19],
      [14, 20],
      [14, 21],
      [13, 21],
      [12, 20],
      [11, 20],
      [10, 19],
      [9, 19],
      [8, 18],
      [7, 18],
      [6, 17],
      [6, 16],
      [5, 15],
      [5, 14],
      [5, 13],
      [5, 12],
      [4, 11],
      [4, 10],
      [4, 9],
      [3, 8],
      [3, 7],
      [4, 6],
      [5, 5],
      [6, 4],
      [6, 3],
      [7, 2],
      [8, 1],
      [9, 1],
      [10, 1],
      [11, 1],
      [12, 2],
      [13, 2],
      [14, 2],
      [15, 2],
      [15, 3],
      [15, 4],
      [16, 5],
      [16, 6],
      [16, 7],
      [16, 8],
      [17, 9],
      [17, 10],
    ]);
    expect(approxPolygon(outline, 2.127878578333184)).toEqual(
      points([
        [14, 21],
        [5, 15],
        [3, 7],
        [8, 1],
        [15, 2],
      ]),
    );
  });
});

describe("isConvex", () => {
  it("accepts convex polygons and rejects others", () => {
    expect(isConvex(rectangle)).toBe(true);
    expect(isConvex([rectangle[0], rectangle[2], rectangle[1], rectangle[3]])).toBe(false);
    expect(isConvex(rectangle.slice(0, 2))).toBe(false);
    expect(
      isConvex([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ]),
    ).toBe(false);
  });
});
