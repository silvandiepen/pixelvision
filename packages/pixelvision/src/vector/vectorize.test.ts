import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { Point } from "../math/transforms.model";
import { drawMask, ink, iou, parseSvg, rasterize } from "../test-svg";
import { vectorize } from "./vectorize";
import type { PathSegment, VectorImage } from "./vectorize.model";

/**
 * Whether a point is inside a polygon (even-odd).
 *
 * @param polygon - Corners as `[x, y]`.
 * @param x - Point x.
 * @param y - Point y.
 * @returns `true` inside.
 */
const inPolygon = (polygon: number[][], x: number, y: number): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/**
 * Whether a point is inside an axis-aligned ellipse.
 *
 * @param x - Point x.
 * @param y - Point y.
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param rx - Horizontal radius.
 * @param ry - Vertical radius.
 * @returns `true` inside.
 */
const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;

/** Three letter-like glyphs: an O (1 counter), an A (1) and a B (2). */
const GLYPHS = drawMask(200, 100, (x, y) => {
  if (inEllipse(x, y, 35, 50, 22, 32) && !inEllipse(x, y, 35, 50, 11, 20)) return true;
  const a = [
    [70, 85],
    [95, 15],
    [115, 15],
    [140, 85],
    [124, 85],
    [118, 67],
    [92, 67],
    [86, 85],
  ];
  const counter = [
    [96, 55],
    [105, 28],
    [114, 55],
  ];
  if (inPolygon(a, x, y) && !inPolygon(counter, x, y)) return true;
  const b =
    x >= 150 &&
    (inEllipse(x, y, 162, 32.5, 20, 17.5) ||
      inEllipse(x, y, 162, 66.5, 23, 18.5) ||
      (x <= 162 && y >= 15 && y <= 85));
  return (
    b && !(x > 162 && (inEllipse(x, y, 162, 32.5, 10, 8) || inEllipse(x, y, 162, 66.5, 12, 9)))
  );
});

const CIRCLE = { x: 50.3, y: 49.6, r: 30 };
const DISC = drawMask(100, 100, (x, y) => Math.hypot(x - CIRCLE.x, y - CIRCLE.y) < CIRCLE.r);
const SQUARE = drawMask(100, 100, (x, y) => x > 20 && x < 70 && y > 25 && y < 80);
const RING = drawMask(100, 100, (x, y) => {
  const d = Math.hypot(x - 50, y - 50);
  return d < 40 && d > 22;
});

/**
 * Walks a path's segments, calling back with each drawn piece.
 *
 * @param segments - The segments.
 * @param visit - Called with the current point and each segment after `M`.
 */
const walk = (segments: PathSegment[], visit: (from: Point, segment: PathSegment) => void) => {
  let current = { x: 0, y: 0 };
  let start = current;
  for (const segment of segments) {
    if (segment.type === "M") {
      current = start = segment.points[0];
      continue;
    }
    visit(current, segment);
    current = segment.type === "Z" ? start : segment.points[segment.points.length - 1];
  }
};

/**
 * Rasterises a result's SVG output, as a browser would fill it.
 *
 * @param result - The vectorised image.
 * @returns A mask, 255 inside.
 */
const reraster = (result: VectorImage): Uint8Array =>
  rasterize(
    parseSvg(result.toSvg()).flatMap((path) => path.subpaths),
    result.width,
    result.height,
  );

describe("vectorize", () => {
  it("turns a drawn circle into one closed curve within half a pixel of the true circle", () => {
    const result = vectorize(ink(DISC));

    expect(result.paths).toHaveLength(1);
    const [{ segments, holes }] = result.paths;
    expect(holes).toBe(0);
    expect(segments[0].type).toBe("M");
    expect(segments[segments.length - 1].type).toBe("Z");
    expect(segments.filter((s) => s.type === "M")).toHaveLength(1);
    expect(segments.some((s) => s.type === "C")).toBe(true);
    let worst = 0;
    walk(segments, (from, segment) => {
      const ends = segment.type === "Z" ? [] : [from, ...segment.points];
      for (let k = 0; k <= 40 && segment.type === "C"; k++) {
        const t = k / 40;
        const mt = 1 - t;
        const w = [mt * mt * mt, 3 * t * mt * mt, 3 * t * t * mt, t * t * t];
        const x = ends.reduce((sum, p, i) => sum + w[i] * p.x, 0);
        const y = ends.reduce((sum, p, i) => sum + w[i] * p.y, 0);
        worst = Math.max(worst, Math.abs(Math.hypot(x - CIRCLE.x, y - CIRCLE.y) - CIRCLE.r));
      }
      if (segment.type === "L") {
        const [end] = segment.points;
        for (let k = 0; k <= 40; k++) {
          const x = from.x + ((end.x - from.x) * k) / 40;
          const y = from.y + ((end.y - from.y) * k) / 40;
          worst = Math.max(worst, Math.abs(Math.hypot(x - CIRCLE.x, y - CIRCLE.y) - CIRCLE.r));
        }
      }
    });
    expect(worst).toBeLessThan(0.5);
  });

  it("turns a square into exactly its 4 corners without curves", () => {
    const { paths } = vectorize(ink(SQUARE), { curves: false });

    expect(paths).toHaveLength(1);
    const corners = paths[0].segments.filter((s) => s.type === "M" || s.type === "L");
    expect(corners.map((s) => s.points[0])).toEqual(
      expect.arrayContaining([
        { x: 20, y: 25 },
        { x: 70, y: 25 },
        { x: 70, y: 80 },
        { x: 20, y: 80 },
      ]),
    );
    expect(corners).toHaveLength(4);
    expect(paths[0].segments.map((s) => s.type).join("")).toBe("MLLLZ");
  });

  it("draws a square's sides as lines even with curves on", () => {
    const { paths } = vectorize(ink(SQUARE));

    expect(paths[0].segments.map((s) => s.type).join("")).toBe("MLLLZ");
  });

  it("keeps the hole of a ring, running the other way round", () => {
    const result = vectorize(ink(RING));

    expect(result.paths).toHaveLength(1);
    const [ring] = result.paths;
    expect(ring.holes).toBe(1);
    expect(ring.segments.filter((s) => s.type === "M")).toHaveLength(2);
    // Signed areas of the two subpaths' vertices: clockwise outline, anticlockwise hole.
    const areas: number[] = [];
    walk(ring.segments, (from, segment) => {
      if (segment.type === "Z") return;
      const to = segment.points[segment.points.length - 1];
      if (areas.length === 0 || from === ring.segments[0].points[0]) areas.push(0);
      areas[areas.length - 1] += from.x * to.y - to.x * from.y;
    });
    const subpaths = parseSvg(result.toSvg())[0].subpaths;
    const signed = subpaths.map((polygon) =>
      polygon.reduce((sum, p, i) => {
        const q = polygon[(i + 1) % polygon.length];
        return sum + p.x * q.y - q.x * p.y;
      }, 0),
    );
    expect(signed[0]).toBeGreaterThan(0);
    expect(signed[1]).toBeLessThan(0);
    // The centre is empty under the default non-zero rule.
    const filled = reraster(result);
    expect(filled[50 * 100 + 50]).toBe(0);
    expect(filled[50 * 100 + 18]).toBe(255);
  });

  it("keeps the counters of letter-like glyphs", () => {
    const result = vectorize(ink(GLYPHS));

    // Ordered by each outline's first top edge: the A's apex, the B's top, the O's top.
    expect(result.paths.map((path) => path.holes)).toEqual([1, 2, 1]);
    const filled = reraster(result);
    // Inside each counter: the O, the A, both bowls of the B.
    for (const [x, y] of [
      [35, 50],
      [105, 45],
      [168, 32],
      [170, 66],
    ]) {
      expect(filled[y * 200 + x], `${x},${y}`).toBe(0);
    }
    // The A becomes straight lines with sharp corners: 8 outside, 3 in its counter.
    expect(result.paths[0].segments.map((s) => s.type).join("")).toBe("MLLLLLLLZMLLZ");
  });

  it.each([
    ["circle", DISC],
    ["square", SQUARE],
    ["ring", RING],
    ["glyphs", GLYPHS],
  ])("writes an SVG of the %s that rasterises back to the source", (_, mask) => {
    for (const options of [{}, { curves: false }, { snapLines: true }]) {
      const result = vectorize(ink(mask), options);
      const svg = result.toSvg();

      expect(svg).toMatch(
        /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="\d+" height="\d+"/,
      );
      expect(svg.match(/<path /g)).toHaveLength(result.paths.length);
      expect(iou(reraster(result), mask.data), JSON.stringify(options)).toBeGreaterThan(0.98);
    }
  });

  it("snaps a slightly turned floor plan to straight walls with exact corners", () => {
    const turn = 0.05;
    const plan = drawMask(120, 100, (x0, y0) => {
      const x = (x0 - 60) * Math.cos(turn) + (y0 - 50) * Math.sin(turn) + 60;
      const y = -(x0 - 60) * Math.sin(turn) + (y0 - 50) * Math.cos(turn) + 50;
      const frame =
        x > 10 && x < 110 && y > 10 && y < 90 && !(x > 14 && x < 106 && y > 14 && y < 86);
      return (
        frame || (x > 58 && x < 62 && y > 10 && y < 70) || (y > 48 && y < 52 && x > 62 && x < 90)
      );
    });

    const snapped = vectorize(ink(plan), { snapLines: true });

    const types = snapped.paths[0].segments.map((s) => s.type).join("");
    // The frame's 4 corners, then the room: 12 corners round the frame and walls.
    expect(types).toBe("MLLLZMLLLLLLLLLLLZ");
    expect(iou(reraster(snapped), plan.data)).toBeGreaterThan(0.98);
  });

  it("snaps sides that meet at gentle angles, which curve fitting would round off", () => {
    // An octagon turns 45° at each corner, less than the 60° that stays sharp.
    const octagon = drawMask(100, 100, (x, y) => {
      const u = Math.abs(x - 50.3);
      const v = Math.abs(y - 49.7);
      return u < 38 && v < 38 && u + v < 54;
    });

    const plain = vectorize(ink(octagon));
    const snapped = vectorize(ink(octagon), { snapLines: true });

    expect(plain.paths[0].segments.some((s) => s.type === "C")).toBe(true);
    expect(snapped.paths[0].segments.map((s) => s.type).join("")).toBe("MLLLLLLLZ");
    expect(iou(reraster(snapped), octagon.data)).toBeGreaterThan(0.999);
    expect(snapped.toSvg().length).toBeLessThan(plain.toSvg().length / 2);
  });

  it("keeps the corners where a straight side meets a curve", () => {
    const half = drawMask(100, 100, (x, y) => Math.hypot(x - 50.3, y - 30.2) < 35 && y > 30.2);

    const result = vectorize(ink(half));

    const [{ segments }] = result.paths;
    expect(segments.map((s) => s.type).join("")).toMatch(/^ML?C+L?Z$/);
    // The two corners at the ends of the diameter, from (15.3, 30.2) to (85.3, 30.2).
    const ends = segments.flatMap((s) => s.points.slice(-1));
    for (const x of [15.3, 85.3]) {
      const corner = ends.find((p) => Math.abs(p.x - x) < 2)!;
      expect(Math.hypot(corner.x - x, corner.y - 30.2)).toBeLessThan(1.5);
    }
    expect(iou(reraster(result), half.data)).toBeGreaterThan(0.98);
  });

  it("leaves out shapes and holes the tolerance flattens to a line", () => {
    // A 1-pixel line, and a square with a 1-pixel slit in it.
    const line = drawMask(40, 20, (x, y) => x > 5 && x < 35 && y > 9 && y < 10);
    const slit = drawMask(40, 20, (x, y) => {
      const square = x > 2 && x < 38 && y > 2 && y < 18;
      return square && !(x > 8 && x < 32 && y > 9 && y < 10);
    });

    expect(vectorize(ink(line)).paths).toEqual([]);
    expect(vectorize(ink(line), { tolerance: 0.1 }).paths).toHaveLength(1);
    expect(vectorize(ink(slit)).paths.map((path) => path.holes)).toEqual([0]);
  });

  it("finds bright shapes with invert, and dark ones by default", () => {
    const light = createMatrix(40, 40);
    light.data.fill(30);
    for (let y = 10; y < 30; y++) light.data.fill(220, y * 40 + 10, y * 40 + 30);

    expect(vectorize(light, { invert: true }).paths[0].segments[0].points[0]).toEqual({
      x: 10,
      y: 10,
    });
    // Dark on light: the frame around the square, with the square as its hole.
    expect(vectorize(light).paths.map((path) => path.holes)).toEqual([1]);
  });

  it("takes a fixed level, and an adaptive one for line art under uneven light", () => {
    const ramp = createMatrix(60, 40);
    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 60; x++) ramp.data[y * 60 + x] = 90 + 2 * x;
    }
    // A dark stroke drawn across the ramp.
    for (let x = 5; x < 55; x++) for (let y = 18; y < 22; y++) ramp.data[y * 60 + x] -= 60;

    // A fixed level loses the stroke where the ramp brightens it: it ends at x = 16.
    const fixed = vectorize(ramp, { threshold: 60 });
    expect(fixed.paths).toHaveLength(1);
    expect(fixed.toSvg()).toContain('d="M5 18h11v4h-11z"');
    const adaptive = vectorize(ramp, { threshold: "adaptive" });
    expect(adaptive.paths).toHaveLength(1);
    expect(adaptive.toSvg()).toContain('d="M5 18h50v4h-50z"');
    expect(vectorize(ramp, { threshold: "adaptive", adaptive: { offset: 100 } }).paths).toEqual([]);
  });

  it("drops specks and fills pinholes smaller than minArea", () => {
    const mask = drawMask(40, 40, (x, y) => x > 5 && x < 35 && y > 5 && y < 35);
    mask.data[20 * 40 + 20] = 0; // a pinhole
    mask.data[2 * 40 + 2] = 255; // a speck

    expect(vectorize(ink(mask), { minArea: 0 }).paths.map((p) => p.holes)).toEqual([0, 1]);
    expect(vectorize(ink(mask)).paths.map((p) => p.holes)).toEqual([0]);
    expect(vectorize(ink(mask), { minArea: 2000 }).paths).toEqual([]);
  });

  it("reads RGB and RGBA images, with transparency as white", () => {
    const rgba = { width: 30, height: 30, data: new Uint8ClampedArray(30 * 30 * 4) };
    const rgb = createMatrix(30, 30, { channels: 3 });
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 30; x++) {
        const shape = x >= 10 && x < 20 && y >= 10 && y < 20;
        // Black everywhere; only the square is opaque.
        rgba.data[(y * 30 + x) * 4 + 3] = shape ? 255 : 0;
        rgb.data.fill(shape ? 0 : 255, (y * 30 + x) * 3, (y * 30 + x) * 3 + 3);
      }
    }

    for (const image of [rgba, rgb]) {
      const { paths } = vectorize(image);
      expect(paths).toHaveLength(1);
      expect(paths[0].segments[0].points[0]).toEqual({ x: 10, y: 10 });
    }
  });

  it("traces colours as stacked layers, largest first", () => {
    const image = { width: 60, height: 40, data: new Uint8ClampedArray(60 * 40 * 4) };
    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 60; x++) {
        const red = x >= 5 && x < 25 && y >= 5 && y < 35;
        const blue = Math.hypot(x - 42, y - 20) < 12;
        const colour = red ? [220, 30, 30] : blue ? [30, 60, 220] : [250, 250, 250];
        image.data.set([...colour, 255], (y * 60 + x) * 4);
      }
    }

    const result = vectorize(image, { colors: 3 });

    // White ground (about 1350 px), red rectangle (600), blue disc (about 450).
    // The red layer also covers the disc, but that part is hidden, so it's left out.

    expect(result.paths.map((path) => path.color)).toEqual(["#fafafa", "#dc1e1e", "#1e3cdc"]);
    // The background layer covers the whole image.
    expect(result.paths[0].segments.map((s) => s.type).join("")).toBe("MLLLZ");
    const svg = result.toSvg();
    expect(parseSvg(svg).map((path) => path.fill)).toEqual(["#fafafa", "#dc1e1e", "#1e3cdc"]);
    // Gray works too, and asking for more colours than there are gives what there is.
    const gray = ink(SQUARE);
    expect(vectorize(gray, { colors: 8 }).paths.map((p) => p.color)).toEqual([
      "#ebebeb",
      "#141414",
    ]);
  });

  it("writes compact SVG with the chosen precision and fill", () => {
    const result = vectorize(ink(SQUARE));

    expect(result.toSvg()).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M20 25h50v55h-50z"/></svg>',
    );
    expect(result.toSvg({ fill: "#1d4ed8" })).toContain('viewBox="0 0 100 100" fill="#1d4ed8">');
    expect(result.toSvg({ fill: 'url("#a")&<' })).toContain('fill="url(&quot;#a&quot;)&amp;&lt;"');
    expect(vectorize(ink(DISC)).toSvg({ precision: 0 })).not.toMatch(/\d\.\d/);
  });

  it("rejects options out of range", () => {
    const gray = ink(SQUARE);
    expect(() => vectorize(gray, { tolerance: 0 })).toThrow("tolerance must be above 0, got 0");
    expect(() => vectorize(gray, { corners: 200 })).toThrow(
      "corners must be at least 0 and at most 180, got 200",
    );
    expect(() => vectorize(gray, { minArea: -1 })).toThrow(RangeError);
    expect(() => vectorize(gray, { snapLines: { minLength: 0 } })).toThrow(RangeError);
    expect(vectorize(gray, { snapLines: {} }).paths).toHaveLength(1);
    expect(() => vectorize(gray, { colors: 1 })).toThrow(RangeError);
    expect(() => vectorize(gray, { colors: 2.5 })).toThrow(RangeError);
    expect(() => vectorize(gray, { colors: 65 })).toThrow(RangeError);
    expect(() => vectorize(createMatrix(4, 4, { type: "f32" }) as never)).toThrow(TypeError);
    expect(() => vectorize(createMatrix(4, 4, { channels: 2 }))).toThrow(RangeError);
    expect(() => vectorize(gray).toSvg({ precision: 7 })).toThrow(RangeError);
    expect(() => vectorize(gray).toSvg({ precision: 1.5 })).toThrow(RangeError);
  });

  it("handles empty and blank images", () => {
    expect(vectorize(createMatrix(0, 0)).paths).toEqual([]);
    const white = createMatrix(10, 10) as Matrix<"u8">;
    white.data.fill(255);
    expect(vectorize(white).paths).toEqual([]);
  });
});
