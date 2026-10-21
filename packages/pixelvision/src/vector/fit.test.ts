import { describe, expect, it } from "vitest";
import type { Point } from "../math/transforms.model";
import {
  findCorners,
  fitCubics,
  fitLine,
  fitLoop,
  intersectLines,
  projectOnLine,
  refineCorner,
  segmentDistance,
  simplifyOpen,
  smooth,
} from "./fit";
import type { FitSettings } from "./fit.model";
import type { PathSegment } from "./vectorize.model";

/**
 * Samples along a closed polygon, one per pixel of its outline.
 *
 * @param corners - Corners as `[x, y]`, in order.
 * @param offset - Where the first sample of each side lies, in steps (default half a step in).
 * @returns The samples.
 */
const along = (corners: number[][], offset = 0.5): Point[] => {
  const points: Point[] = [];
  corners.forEach(([ax, ay], i) => {
    const [bx, by] = corners[(i + 1) % corners.length];
    const steps = Math.round(Math.hypot(bx - ax, by - ay));
    for (let s = 0; s < steps; s++) {
      const t = (s + offset) / steps;
      points.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t });
    }
  });
  return points;
};

const SQUARE = along([
  [0, 0],
  [40, 0],
  [40, 40],
  [0, 40],
]);
const CURVES: FitSettings = { tolerance: 0.5, cornerAngle: Math.PI / 3, curves: true };

describe("line helpers", () => {
  it("measures, fits, crosses and projects lines", () => {
    expect(segmentDistance({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
    expect(segmentDistance({ x: 13, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
    expect(segmentDistance({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);

    const line = fitLine([
      { x: 0, y: 1 },
      { x: 2, y: 2 },
      { x: 4, y: 3 },
    ]);
    expect(line.point).toEqual({ x: 2, y: 2 });
    expect(line.direction.y / line.direction.x).toBeCloseTo(0.5);

    const vertical = { point: { x: 3, y: 0 }, direction: { x: 0, y: 1 } };
    const crossing = intersectLines(line, vertical)!;
    expect(crossing.x).toBeCloseTo(3);
    expect(crossing.y).toBeCloseTo(2.5);
    expect(intersectLines(vertical, { point: { x: 9, y: 9 }, direction: { x: 0, y: -1 } })).toBe(
      null,
    );
    expect(projectOnLine({ x: 7, y: 5 }, vertical)).toEqual({ x: 3, y: 5 });
  });
});

describe("findCorners", () => {
  it("finds the 4 corners of a square and none on a circle", () => {
    expect(findCorners(SQUARE, Math.PI / 3, 1)).toHaveLength(4);
    const circle = Array.from({ length: 160 }, (_, i) => ({
      x: 30 * Math.cos((i / 160) * 2 * Math.PI),
      y: 30 * Math.sin((i / 160) * 2 * Math.PI),
    }));
    expect(findCorners(circle, Math.PI / 3, 1)).toEqual([]);
  });

  it("finds a corner the pixel grid cut in two, whichever way round it's traced", () => {
    // A corner cut off by a short diagonal: two gentle turns close together.
    const cut = along([
      [0, 3],
      [2, 0.6],
      [40, 0],
      [40, 40],
      [0, 40],
    ]);
    for (const samples of [cut, [...cut].reverse()]) {
      const corners = findCorners(samples, (70 * Math.PI) / 180, 1);
      expect(corners).toHaveLength(4);
      const nearest = Math.min(...corners.map((i) => Math.hypot(samples[i].x, samples[i].y)));
      expect(nearest).toBeLessThan(3);
    }
  });
});

describe("refineCorner", () => {
  const at = (i: number) => SQUARE[((i % 160) + 160) % 160];

  it("places a corner where its sides meet", () => {
    // Sample 39 is (39.5, 0), next to the top-right corner (40, 0).
    expect(refineCorner(at, 39, 39, 40)).toEqual({ x: 40, y: 0 });
  });

  it("keeps the sample when the sides are too short or parallel", () => {
    expect(refineCorner(at, 39, 3, 40)).toBe(at(39));
    // The tip of a thin spike: its two sides run side by side.
    const spike = along([
      [0, 0],
      [30, 0],
      [30, 1],
      [0, 1],
    ]);
    const tip = (i: number) => spike[((i % 62) + 62) % 62];
    expect(refineCorner(tip, 30, 30, 30)).toBe(tip(30));
  });
});

describe("smooth and simplifyOpen", () => {
  it("smooths a staircase, keeping an open run's ends", () => {
    const stairs = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0].map((y, x) => ({ x, y }));
    const open = smooth(stairs, false);
    expect(open[0]).toBe(stairs[0]);
    expect(open[10]).toBe(stairs[10]);
    // The 1-pixel zigzag flattens to its middle line.
    for (const p of open.slice(3, 8)) expect(Math.abs(p.y - 0.5)).toBeLessThan(0.05);
    const closed = smooth(stairs.slice(0, 10), true);
    for (const p of closed) expect(Math.abs(p.y - 0.5)).toBeLessThan(0.05);
  });

  it("keeps the points a polyline needs", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 0.2 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(simplifyOpen(points, 0.5)).toEqual([2, 3]);
  });
});

describe("fitCubics", () => {
  it("draws a straight run as one line", () => {
    const out: PathSegment[] = [];
    const run = [0, 1, 2, 3].map((x) => ({ x, y: 0 }));
    fitCubics(run, { x: 1, y: 0 }, { x: -1, y: 0 }, 0.5, out);
    expect(out).toEqual([{ type: "L", points: [{ x: 3, y: 0 }] }]);
  });

  it("fits a quarter circle with curves within the tolerance", () => {
    const arc = Array.from({ length: 41 }, (_, i) => {
      const a = (i / 40) * (Math.PI / 2);
      return { x: 40 * Math.cos(a), y: 40 * Math.sin(a) };
    });
    const out: PathSegment[] = [];
    fitCubics(arc, { x: 0, y: 1 }, { x: 1, y: 0 }, 0.1, out);
    // One cubic matches a quarter circle to 0.03% of its radius, given the right handles.
    expect(out.map((segment) => segment.type)).toEqual(["C"]);
    expect(out[out.length - 1].points.at(-1)).toBe(arc[40]);
    let from = arc[0];
    for (const segment of out) {
      const [c1, c2, end] = segment.points as Point[];
      for (let k = 0; k <= 20; k++) {
        const t = k / 20;
        const mt = 1 - t;
        const x =
          mt ** 3 * from.x + 3 * t * mt * mt * c1.x + 3 * t * t * mt * c2.x + t ** 3 * end.x;
        const y =
          mt ** 3 * from.y + 3 * t * mt * mt * c1.y + 3 * t * t * mt * c2.y + t ** 3 * end.y;
        expect(Math.abs(Math.hypot(x, y) - 40)).toBeLessThan(0.15);
      }
      from = end;
    }
  });

  it("falls back to short handles when the tangents leave no solution", () => {
    // Three points with parallel end tangents: the handle lengths can't be solved for.
    const out: PathSegment[] = [];
    const u = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
    ];
    fitCubics(u, { x: 0, y: 1 }, { x: 0, y: 1 }, 0.5, out);
    expect(out.length).toBeGreaterThan(0);
    expect(out[out.length - 1].points.at(-1)).toBe(u[2]);
  });
});

describe("fitLoop", () => {
  it("meets touching straight spans at their lines' crossing", () => {
    // Samples on the corners themselves, so each side's span shares its ends.
    const square = along(
      [
        [0, 0],
        [40, 0],
        [40, 40],
        [0, 40],
      ],
      0,
    );
    const spans = [0, 40, 80, 120].map((start) => ({ start, length: 40 }));
    const segments = fitLoop(square, CURVES, spans);
    expect(segments.map((s) => s.type).join("")).toBe("MLLLZ");
    const corners = segments.slice(0, 4).map((s) => s.points[0] as Point);
    expect(
      corners.map((p) => [Math.round(p.x * 1e6) / 1e6 + 0, Math.round(p.y * 1e6) / 1e6 + 0]),
    ).toEqual([
      [0, 0],
      [40, 0],
      [40, 40],
      [0, 40],
    ]);
  });

  it("keeps the sample between two touching spans along the same line", () => {
    const spans = [
      { start: 2, length: 18 },
      { start: 20, length: 18 },
    ];
    const segments = fitLoop(SQUARE, CURVES, spans);
    expect(segments.some((s) => s.type !== "Z" && s.points[0] === SQUARE[20])).toBe(true);
  });
});
