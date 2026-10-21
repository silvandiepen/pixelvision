import { describe, expect, it } from "vitest";
import { boundingRect, convexHull, huMoments, minAreaRect, moments } from "./shapes";

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe("boundingRect", () => {
  it("covers every point in whole pixels", () => {
    expect(
      boundingRect([
        { x: 2, y: 3 },
        { x: 5.5, y: 9 },
        { x: 4, y: 1 },
      ]),
    ).toEqual({
      x: 2,
      y: 1,
      width: 4,
      height: 9,
    });
    expect(boundingRect([{ x: 7, y: 7 }])).toEqual({ x: 7, y: 7, width: 1, height: 1 });
    expect(boundingRect([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});

describe("convexHull", () => {
  it("drops inner and collinear points and runs clockwise from the top-left", () => {
    const points = [...square, { x: 5, y: 5 }, { x: 5, y: 0 }, { x: 3, y: 4 }, { x: 0, y: 0 }];

    expect(convexHull(points)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
  });

  it("returns tiny inputs as they are", () => {
    expect(
      convexHull([
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ]),
    ).toEqual([{ x: 1, y: 1 }]);
    expect(convexHull([])).toEqual([]);
  });

  it("starts at the top-most, then left-most point", () => {
    const diamond = [
      { x: 5, y: 0 },
      { x: 10, y: 5 },
      { x: 5, y: 10 },
      { x: 0, y: 5 },
    ];

    expect(convexHull(diamond)[0]).toEqual({ x: 5, y: 0 });
  });
});

describe("minAreaRect", () => {
  it("fits a rotated rectangle tightly", () => {
    // A 20x10 rectangle rotated by 30°.
    const angle = Math.PI / 6;
    const corners = [
      [0, 0],
      [20, 0],
      [20, 10],
      [0, 10],
    ].map(([x, y]) => ({
      x: 50 + x * Math.cos(angle) - y * Math.sin(angle),
      y: 50 + x * Math.sin(angle) + y * Math.cos(angle),
    }));

    const rect = minAreaRect(corners);

    expect(rect.width * rect.height).toBeCloseTo(200, 6);
    expect([rect.width, rect.height].sort((a, b) => a - b)).toEqual([
      expect.closeTo(10, 6),
      expect.closeTo(20, 6),
    ]);
    expect(rect.corners).toHaveLength(4);
  });

  it("handles no points, one point and repeated points", () => {
    expect(minAreaRect([])).toMatchObject({ width: 0, height: 0 });
    expect(
      minAreaRect([
        { x: 3, y: 4 },
        { x: 3, y: 4 },
      ]),
    ).toMatchObject({ center: { x: 3, y: 4 }, width: 0 });
    expect(
      minAreaRect([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
      ]).width,
    ).toBeCloseTo(4, 9);
  });
});

describe("moments and huMoments", () => {
  it("measures a square's area, centroid and spread", () => {
    const m = moments(square);

    expect(m.m00).toBe(100);
    expect(m.m10 / m.m00).toBe(5);
    expect(m.m01 / m.m00).toBe(5);
    expect(m.mu11).toBeCloseTo(0, 9);
    expect(m.mu20).toBeCloseTo(m.mu02, 9);
  });

  it("doesn't depend on orientation", () => {
    expect(moments([...square].reverse())).toEqual(moments(square));
  });

  it("gives Hu moments that ignore translation, scale and rotation", () => {
    const shape = [
      { x: 0, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 9 },
      { x: 0, y: 9 },
    ];
    const moved = shape.map((p) => ({ x: p.y * 2 + 40, y: -p.x * 2 + 30 }));

    const a = huMoments(moments(shape));
    const b = huMoments(moments(moved));

    a.forEach((h, i) => expect(b[i]).toBeCloseTo(h, 9));
  });

  it("returns zeros for a degenerate shape", () => {
    const m = moments([{ x: 1, y: 1 }]);

    expect(m.m00).toBe(0);
    expect(m.nu20).toBe(0);
    expect(m.nu30).toBe(0);
  });
});
