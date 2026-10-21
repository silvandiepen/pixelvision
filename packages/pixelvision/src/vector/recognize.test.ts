import { describe, expect, it } from "vitest";
import { connectedComponents } from "../shape/connectedComponents";
import type { Point } from "../math/transforms.model";
import { drawMask } from "../test-svg";
import {
  ellipseDistance,
  fitCircle,
  fitEllipse,
  fitPolygon,
  fitRect,
  leastSquares,
  matchLoop,
  recognizeShape,
  rectDistance,
  shapeSegments,
} from "./recognize";
import type { RecognizeSettings, TracedOutline } from "./recognize.model";
import { edgeMidpoints, groupShapes, traceLoops } from "./trace";
import type { ShapeKind } from "./vectorize.model";

const ALL: RecognizeSettings = {
  tolerance: 1,
  kinds: new Set<ShapeKind>(["circle", "ellipse", "rect", "polygon"]),
};

/**
 * Traces a drawn mask's first shape into its outline and holes, as vectorize does.
 *
 * @param inside - Whether a point is inside, on a 200 by 200 canvas.
 * @returns The outline first, then each hole.
 */
const trace = (inside: (x: number, y: number) => boolean): TracedOutline[] => {
  const mask = drawMask(200, 200, inside);
  const [shape] = groupShapes(traceLoops(mask, connectedComponents(mask).labels.data), 2);
  return [shape.outline, ...shape.holes].map((loop) => ({
    samples: edgeMidpoints(loop.vertices),
    area: loop.area,
  }));
};

/**
 * Turns a point about a centre.
 *
 * @param x - Point x.
 * @param y - Point y.
 * @param degrees - Angle, clockwise on screen.
 * @returns The point in the turned frame, about (100, 100).
 */
const unturn = (x: number, y: number, degrees: number): Point => {
  const t = (-degrees * Math.PI) / 180;
  const [dx, dy] = [x - 100, y - 100];
  return { x: dx * Math.cos(t) - dy * Math.sin(t), y: dx * Math.sin(t) + dy * Math.cos(t) };
};

/**
 * A polygon's outline as dense samples, one about every pixel.
 *
 * @param corners - The corners.
 * @returns The samples.
 */
const along = (corners: readonly Point[]): Point[] =>
  corners.flatMap((a, i) => {
    const b = corners[(i + 1) % corners.length];
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y));
    return Array.from({ length: steps }, (_, k) => ({
      x: a.x + ((b.x - a.x) * k) / steps,
      y: a.y + ((b.y - a.y) * k) / steps,
    }));
  });

describe("leastSquares", () => {
  it("fits a line to points by minimising the residuals", () => {
    const [a, b] = leastSquares([0, 0], ([slope, offset]) =>
      [0, 1, 2, 3].map((x) => slope * x + offset - (2 * x + 1)),
    );
    expect(a).toBeCloseTo(2, 6);
    expect(b).toBeCloseTo(1, 6);
  });
});

describe("fitCircle", () => {
  it("finds the centre and radius of points on a circle", () => {
    const points = Array.from({ length: 40 }, (_, k) => ({
      x: 30 + 12 * Math.cos(k / 6),
      y: -5 + 12 * Math.sin(k / 6),
    }));
    const { cx, cy, r } = fitCircle(points);
    expect(cx).toBeCloseTo(30, 6);
    expect(cy).toBeCloseTo(-5, 6);
    expect(r).toBeCloseTo(12, 6);
  });
});

describe("fitEllipse and ellipseDistance", () => {
  it("finds a turned ellipse, and the distance of points from it", () => {
    const t = (35 * Math.PI) / 180;
    const points = Array.from({ length: 60 }, (_, k) => {
      const [u, v] = [40 * Math.cos(k / 9.5), 15 * Math.sin(k / 9.5)];
      return {
        x: 70 + u * Math.cos(t) - v * Math.sin(t),
        y: 60 + u * Math.sin(t) + v * Math.cos(t),
      };
    });

    const ellipse = fitEllipse(points);

    expect(ellipse.cx).toBeCloseTo(70, 4);
    expect(ellipse.cy).toBeCloseTo(60, 4);
    // Its own axes may come either way round: radii 40 along 35°, or 15 along -55°.
    const [long, short] = [ellipse.rx, ellipse.ry].sort((x, y) => y - x);
    expect(long).toBeCloseTo(40, 4);
    expect(short).toBeCloseTo(15, 4);
    const turned =
      ((ellipse.angle * 180) / Math.PI + (ellipse.rx > ellipse.ry ? 0 : 90) + 360) % 180;
    expect(turned).toBeCloseTo(35, 4);
    expect(Math.max(...points.map((p) => ellipseDistance(p, ellipse)))).toBeLessThan(1e-6);
    // 3 px out along the long axis, and 2 px in along the short one.
    expect(
      ellipseDistance({ x: 70 + 43 * Math.cos(t), y: 60 + 43 * Math.sin(t) }, ellipse),
    ).toBeCloseTo(3, 4);
    expect(
      ellipseDistance({ x: 70 - 13 * Math.sin(t), y: 60 + 13 * Math.cos(t) }, ellipse),
    ).toBeCloseTo(2, 4);
  });
});

describe("rectDistance", () => {
  it("is signed: negative inside, zero on the edge, positive outside", () => {
    const rect = [10, 10, 20, 10, 0];
    expect(rectDistance({ x: 10, y: 10 }, rect)).toBe(-5);
    expect(rectDistance({ x: 20, y: 12 }, rect)).toBe(0);
    expect(rectDistance({ x: 23, y: 19 }, rect)).toBe(5);
    // A rounded corner is cut off: the corner point is outside by r(√2 - 1).
    expect(rectDistance({ x: 20, y: 15 }, [10, 10, 20, 10, 0, 4])).toBeCloseTo(
      4 * (Math.SQRT2 - 1),
    );
  });
});

describe("fitRect", () => {
  it.each([20, 70, -30])("finds a rectangle turned by %d°, within ±45°", (degrees) => {
    const [outline] = trace((x, y) => {
      const p = unturn(x, y, degrees);
      return Math.abs(p.x) < 40 && Math.abs(p.y) < 20;
    });

    const rect = fitRect(outline.samples, outline.area, false);

    const turned = ((degrees + 45 + 180) % 90) - 45;
    expect(rect.angle).toBeCloseTo(turned, 0);
    const [w, h] = turned === degrees ? [80, 40] : [40, 80];
    expect(Math.abs(rect.width - w)).toBeLessThan(0.5);
    expect(Math.abs(rect.height - h)).toBeLessThan(0.5);
    expect(Math.abs(rect.x + rect.width / 2 - 100)).toBeLessThan(0.3);
  });

  it("fits the corner radius of a rounded rectangle", () => {
    const [outline] = trace((x, y) => {
      const [u, v] = [Math.max(Math.abs(x - 100) - 30, 0), Math.max(Math.abs(y - 100) - 10, 0)];
      return Math.hypot(u, v) < 12;
    });

    const rect = fitRect(outline.samples, outline.area, true);
    expect(Math.abs(rect.rx - 12)).toBeLessThan(0.5);
    expect(Math.abs(rect.width - 84)).toBeLessThan(0.5);
  });
});

describe("fitPolygon", () => {
  it("places each corner where the fitted sides cross", () => {
    const corners = [
      { x: 20, y: 150 },
      { x: 100, y: 30.4 },
      { x: 180.6, y: 150 },
    ];
    const [outline] = trace((x, y) => {
      const sign = (a: Point, b: Point) => (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
      return corners.every((a, i) => sign(a, corners[(i + 1) % 3]) > 0);
    });

    const polygon = fitPolygon(outline.samples, 1)!;

    expect(polygon).toHaveLength(3);
    for (const corner of corners) {
      expect(polygon.some((p) => Math.hypot(p.x - corner.x, p.y - corner.y) < 0.75)).toBe(true);
    }
  });

  it("keeps a corner whose sides nearly line up where the outline has it", () => {
    // The top bends by 4°, too little for its sides' lines to cross reliably.
    const corners = [
      { x: 0, y: 0 },
      { x: 200, y: 7 },
      { x: 400, y: 0 },
      { x: 200, y: 150 },
    ];
    const polygon = fitPolygon(along(corners), 1)!;
    expect(polygon).toHaveLength(4);
    expect(polygon.some((p) => p.x === 200 && p.y === 7)).toBe(true);
  });

  it("gives up on outlines that take too many corners, or too few", () => {
    const circle = Array.from({ length: 200 }, (_, k) => ({
      x: 50 * Math.cos(k / 31.8),
      y: 50 * Math.sin(k / 31.8),
    }));
    expect(fitPolygon(circle, 1)).toBeNull();
    // A regular 12-gon fits within the tolerance only with all 12 corners.
    const twelve = along(
      Array.from({ length: 12 }, (_, k) => ({
        x: 80 * Math.cos((k * Math.PI) / 6),
        y: 80 * Math.sin((k * Math.PI) / 6),
      })),
    );
    expect(fitPolygon(twelve, 1)).toBeNull();
    expect(
      fitPolygon(
        along([
          { x: 0, y: 0 },
          { x: 30, y: 0.2 },
        ]),
        1,
      ),
    ).toBeNull();
  });
});

describe("matchLoop", () => {
  const [disc] = trace((x, y) => Math.hypot(x - 100.3, y - 99.6) < 40);
  const [oval] = trace((x, y) => ((x - 100) / 60) ** 2 + ((y - 100) / 30) ** 2 < 1);

  it("tries the simplest primitive first, and only the kinds asked for", () => {
    expect(matchLoop(disc, ALL)?.kind).toBe("circle");
    expect(matchLoop(oval, ALL)?.kind).toBe("ellipse");
    // A circle is an ellipse too.
    expect(matchLoop(disc, { ...ALL, kinds: new Set(["ellipse"]) })?.kind).toBe("ellipse");
    // So is a rounded square with corners half its side.
    expect(matchLoop(disc, { ...ALL, kinds: new Set(["rect"]) })).toMatchObject({ kind: "rect" });
    expect(matchLoop(disc, { ...ALL, kinds: new Set(["polygon"]) })).toBeNull();
  });

  it("checks the area, so a thin arc along a circle isn't one", () => {
    const [arc] = trace((x, y) => {
      const d = Math.hypot(x - 100, y - 100);
      return d > 59 && d < 60.5 && y < 100;
    });
    expect(matchLoop(arc, { ...ALL, tolerance: 2, kinds: new Set(["circle"]) })).toBeNull();
  });
});

describe("recognizeShape", () => {
  it("makes a ring of a circle with a concentric circular hole", () => {
    const ring = recognizeShape(
      trace((x, y) => {
        const d = Math.hypot(x - 100, y - 100);
        return d < 50 && d > 30;
      }),
      ALL,
    );
    expect(ring?.kind).toBe("circle");
    if (ring?.kind !== "circle") return;
    expect(ring.r).toBeCloseTo(40, 0);
    expect(ring.strokeWidth).toBeCloseTo(20, 0);
  });

  it("makes a path of parts when the outline and holes are primitives but no ring", () => {
    // A disc with a hole off its centre, and a square with a round hole.
    const offCentre = recognizeShape(
      trace((x, y) => Math.hypot(x - 100, y - 100) < 50 && Math.hypot(x - 115, y - 100) > 20),
      ALL,
    );
    expect(offCentre?.kind === "path" && offCentre.parts?.map((p) => p.kind)).toEqual([
      "circle",
      "circle",
    ]);
    const washer = recognizeShape(
      trace(
        (x, y) =>
          Math.abs(x - 100) < 60 && Math.abs(y - 100) < 60 && Math.hypot(x - 100, y - 100) > 25,
      ),
      ALL,
    );
    expect(washer?.kind === "path" && washer.parts?.map((p) => p.kind)).toEqual(["rect", "circle"]);
    expect(washer?.kind === "path" && washer.segments.filter((s) => s.type === "M")).toHaveLength(
      2,
    );
  });

  it("gives nothing when the outline or a hole isn't a primitive", () => {
    const star = (x: number, y: number, r: number) => {
      const a = Math.atan2(y - 100, x - 100);
      return Math.hypot(x - 100, y - 100) < r * (1 + 0.3 * Math.cos(5 * a));
    };
    expect(
      recognizeShape(
        trace((x, y) => star(x, y, 60)),
        ALL,
      ),
    ).toBeNull();
    expect(
      recognizeShape(
        trace((x, y) => Math.hypot(x - 100, y - 100) < 90 && !star(x, y, 40)),
        ALL,
      ),
    ).toBeNull();
  });
});

describe("shapeSegments", () => {
  it("draws primitives as their outlines, holes the other way round", () => {
    const circle = shapeSegments({ kind: "circle", cx: 0, cy: 0, r: 10 });
    expect(circle.segments.map((s) => s.type).join("")).toBe("MCCCCZ");
    expect(circle.segments[0].points[0]).toEqual({ x: 10, y: 0 });

    const ring = shapeSegments({ kind: "circle", cx: 0, cy: 0, r: 10, strokeWidth: 4 });
    expect(ring.holes).toBe(1);
    expect(ring.segments[0].points[0]).toEqual({ x: 12, y: 0 });
    expect(ring.segments[6].points[0]).toEqual({ x: 8, y: 0 });
    // The hole runs anticlockwise: its first curve heads up (y decreasing).
    expect(ring.segments[7].points[2]?.y).toBeLessThan(0);

    const pill = shapeSegments({
      kind: "rect",
      x: 0,
      y: 0,
      width: 40,
      height: 20,
      rx: 10,
      angle: 0,
    });
    expect(pill.segments.map((s) => s.type).join("")).toBe("MLCLCLCLCZ");
    const square = shapeSegments({
      kind: "rect",
      x: 0,
      y: 0,
      width: 4,
      height: 4,
      rx: 0,
      angle: 90,
    });
    expect(square.segments.map((s) => s.type).join("")).toBe("MLLLZ");
    expect(square.segments[0].points[0]?.x).toBeCloseTo(4);

    // A square hole in a disc runs anticlockwise on screen: down its left side first.
    const holed = shapeSegments({
      kind: "path",
      segments: [],
      holes: 1,
      parts: [
        { kind: "circle", cx: 0, cy: 0, r: 10 },
        { kind: "rect", x: -2, y: -2, width: 4, height: 4, rx: 0, angle: 0 },
      ],
    });
    expect(holed.segments.slice(6).map((s) => s.points[0])).toEqual([
      { x: -2, y: -2 },
      { x: -2, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: -2 },
      undefined,
    ]);

    const path = { kind: "path", segments: circle.segments, holes: 0 } as const;
    expect(shapeSegments(path).segments).toBe(circle.segments);
  });
});
