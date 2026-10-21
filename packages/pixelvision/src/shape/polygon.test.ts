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
