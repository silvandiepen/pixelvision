import { describe, expect, it } from "vitest";
import { affineTransform, perspectiveTransform, transformPoint } from "./transforms";

const square = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

describe("perspectiveTransform", () => {
  it("maps each source corner onto its target", () => {
    const target = [
      { x: 10, y: 20 },
      { x: 110, y: 5 },
      { x: 130, y: 90 },
      { x: 0, y: 100 },
    ];

    const h = perspectiveTransform(square, target);

    target.forEach((point, i) => {
      const mapped = transformPoint(h, square[i]);
      expect(mapped.x).toBeCloseTo(point.x, 9);
      expect(mapped.y).toBeCloseTo(point.y, 9);
    });
  });

  it("gives the identity for identical quadrilaterals", () => {
    const h = Array.from(perspectiveTransform(square, square));

    [1, 0, 0, 0, 1, 0, 0, 0, 1].forEach((value, i) => expect(h[i]).toBeCloseTo(value, 12));
  });

  it("rejects collinear points, wrong counts and non-finite values", () => {
    const line = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ];
    expect(() => perspectiveTransform(line, square)).toThrow(/one line/);
    expect(() => perspectiveTransform(square.slice(0, 3), square)).toThrow(RangeError);
    expect(() =>
      perspectiveTransform([{ x: Number.NaN, y: 0 }, ...square.slice(1)], square),
    ).toThrow(/finite/);
  });
});

describe("affineTransform", () => {
  it("solves rotation, scale and translation", () => {
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    // Rotate 90°, scale 2, move by (5, 7).
    const to = [
      { x: 5, y: 7 },
      { x: 5, y: 9 },
      { x: 3, y: 7 },
    ];

    expect(Array.from(affineTransform(from, to))).toEqual([0, -2, 5, 2, 0, 7, 0, 0, 1]);
  });

  it("maps arbitrary triangles", () => {
    const from = [
      { x: 3, y: 1 },
      { x: 10, y: 4 },
      { x: 2, y: 9 },
    ];
    const to = [
      { x: -1, y: 2 },
      { x: 6, y: 0.5 },
      { x: 4, y: 12 },
    ];

    const transform = affineTransform(from, to);

    from.forEach((point, i) => {
      const mapped = transformPoint(transform, point);
      expect(mapped.x).toBeCloseTo(to[i].x, 10);
      expect(mapped.y).toBeCloseTo(to[i].y, 10);
    });
  });

  it("rejects collinear source points", () => {
    const line = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(() => affineTransform(line, line)).toThrow(/one line/);
  });
});
