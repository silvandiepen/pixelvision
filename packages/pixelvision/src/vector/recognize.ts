import { luSolve } from "../math/linalg";
import { invert3x3, matrixFromRows } from "../math/matmath";
import type { Point } from "../math/transforms.model";
import { contourArea } from "../shape/polygon";
import { minAreaRect } from "../shape/shapes";
import { findCorners, fitLine, intersectLines, segmentDistance } from "./fit";
import type { RecognizeSettings, TracedOutline } from "./recognize.model";
import type {
  CircleShape,
  EllipseShape,
  PathSegment,
  PathShape,
  PolygonShape,
  PrimitiveShape,
  RectShape,
  VectorShape,
} from "./vectorize.model";

// Most corners a recognised polygon has.
const MAX_CORNERS = 8;
// Samples left out at each end of a polygon side when its line is fitted: they round the corner.
const TRIM = 2;
// Levenberg–Marquardt rounds of the geometric fits.
const ROUNDS = 20;
// Handle length of a cubic Bézier quarter circle, as a share of the radius.
const KAPPA = 0.5522847498307936;

/**
 * Sum of squares.
 *
 * @param values - The values.
 * @returns Their squares, added up.
 */
const sumSquares = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value * value, 0);

/**
 * Minimises the sum of squared residuals by Levenberg–Marquardt, with a
 * forward-difference Jacobian. A step is kept only when it lowers the sum,
 * so the result is never worse than the start.
 *
 * @param start - Starting parameters.
 * @param residuals - The residuals for some parameters.
 * @returns The fitted parameters.
 */
export function leastSquares(
  start: readonly number[],
  residuals: (params: readonly number[]) => number[],
): number[] {
  let params = [...start];
  let current = residuals(params);
  let cost = sumSquares(current);
  let damping = 1e-3;
  for (let round = 0; round < ROUNDS; round++) {
    const jacobian = params.map((value, k) => {
      const step = 1e-6 * Math.max(1, Math.abs(value));
      const moved = residuals(params.map((v, i) => (i === k ? v + step : v)));
      return moved.map((m, i) => (m - current[i]) / step);
    });
    const products = jacobian.map((a) =>
      jacobian.map((b) => a.reduce((sum, value, s) => sum + value * b[s], 0)),
    );
    // A parameter with no pull (a zero column) still gets a little damping, so the
    // system stays solvable: a share of the largest diagonal entry.
    const floor = 1e-9 * Math.max(...products.map((row, i) => row[i]));
    const rows = products.map((row, i) =>
      row.map((value, j) => (i === j ? value * (1 + damping) + floor : value)),
    );
    const gradient = jacobian.map((a) => -a.reduce((sum, value, s) => sum + value * current[s], 0));
    const step = luSolve(matrixFromRows(rows), gradient);
    const trial = params.map((value, k) => value + step[k]);
    const next = residuals(trial);
    const nextCost = sumSquares(next);
    if (nextCost < cost) {
      [params, current, cost] = [trial, next, nextCost];
      damping /= 10;
    } else {
      damping *= 10;
    }
  }
  return params;
}

/**
 * Fits a circle to points: Kåsa's algebraic fit (least squares on
 * `x² + y² + Dx + Ey + F`), refined geometrically, so the distances from
 * the circle are least squares.
 *
 * @param points - At least three points, not all on one line.
 * @returns Centre and radius.
 */
export function fitCircle(points: readonly Point[]): { cx: number; cy: number; r: number } {
  const n = points.length;
  const mx = points.reduce((sum, p) => sum + p.x, 0) / n;
  const my = points.reduce((sum, p) => sum + p.y, 0) / n;
  let [suu, suv, svv, su, sv, sz] = [0, 0, 0, 0, 0, 0];
  for (const p of points) {
    const u = p.x - mx;
    const v = p.y - my;
    const z = u * u + v * v;
    suu += u * u;
    suv += u * v;
    svv += v * v;
    su += z * u;
    sv += z * v;
    sz += z;
  }
  // Centred, the sums of u and v are 0, so F = -mean(z) and D, E solve a 2x2 system.
  const det = suu * svv - suv * suv;
  const d = (-su * svv + sv * suv) / det;
  const e = (-sv * suu + su * suv) / det;
  const start = [mx - d / 2, my - e / 2, Math.sqrt((d * d + e * e) / 4 + sz / n)];
  const [cx, cy, r] = leastSquares(start, ([x, y, radius]) =>
    points.map((p) => Math.hypot(p.x - x, p.y - y) - radius),
  );
  return { cx, cy, r };
}

/**
 * Real eigenvalues and eigenvectors of a 3x3 matrix whose eigenvalues are
 * all real: the roots of its characteristic cubic (trigonometric form),
 * each with the null vector of `M - λI` from the largest cross product of
 * two of its rows.
 *
 * @param m - The matrix, row by row.
 * @returns The three eigenvectors (not normalised).
 */
const eigenvectors3 = (m: readonly number[][]): number[][] => {
  const trace = m[0][0] + m[1][1] + m[2][2];
  const minors =
    m[0][0] * m[1][1] -
    m[0][1] * m[1][0] +
    m[0][0] * m[2][2] -
    m[0][2] * m[2][0] +
    m[1][1] * m[2][2] -
    m[1][2] * m[2][1];
  const det =
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  // λ = t + trace/3 turns λ³ - trace λ² + minors λ - det into t³ + p t + q.
  const p = Math.min(minors - (trace * trace) / 3, -Number.MIN_VALUE);
  const q = (-2 * trace ** 3) / 27 + (trace * minors) / 3 - det;
  const radius = 2 * Math.sqrt(-p / 3);
  const phi = Math.acos(Math.max(-1, Math.min(1, ((3 * q) / (2 * p)) * Math.sqrt(-3 / p)))) / 3;
  return [0, 1, 2].map((k) => {
    const lambda = radius * Math.cos(phi - (2 * Math.PI * k) / 3) + trace / 3;
    const rows = m.map((row, i) => row.map((value, j) => value - (i === j ? lambda : 0)));
    const cross = (a: number[], b: number[]) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    const candidates = [cross(rows[0], rows[1]), cross(rows[1], rows[2]), cross(rows[0], rows[2])];
    return candidates.reduce((best, v) => (sumSquares(v) > sumSquares(best) ? v : best));
  });
};

/**
 * Fits an ellipse to points by Fitzgibbon's direct least-squares method, in
 * the numerically stable form of Halíř and Flusser: the conic
 * `Ax² + Bxy + Cy² + Dx + Ey + F` nearest to the points under the
 * constraint `4AC - B² = 1`, which only an ellipse meets. The points are
 * centred and scaled first.
 *
 * @param points - At least five points, not all on one line.
 * @returns Centre, radii and rotation (radians); the method gives an ellipse for any points.
 */
export function fitEllipse(points: readonly Point[]): {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  angle: number;
} {
  const n = points.length;
  const mx = points.reduce((sum, p) => sum + p.x, 0) / n;
  const my = points.reduce((sum, p) => sum + p.y, 0) / n;
  const scale = Math.sqrt(
    points.reduce((sum, p) => sum + (p.x - mx) ** 2 + (p.y - my) ** 2, 0) / n,
  );
  const s1 = [0, 1, 2].map(() => [0, 0, 0]);
  const s2 = [0, 1, 2].map(() => [0, 0, 0]);
  const s3 = [0, 1, 2].map(() => [0, 0, 0]);
  for (const p of points) {
    const x = (p.x - mx) / scale;
    const y = (p.y - my) / scale;
    const quadratic = [x * x, x * y, y * y];
    const linear = [x, y, 1];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        s1[i][j] += quadratic[i] * quadratic[j];
        s2[i][j] += quadratic[i] * linear[j];
        s3[i][j] += linear[i] * linear[j];
      }
    }
  }
  // The linear part follows from the quadratic: [D E F] = T · [A B C], T = -S3⁻¹ S2ᵀ.
  const inverse = invert3x3(matrixFromRows(s3)).data;
  const t = [0, 1, 2].map((i) =>
    [0, 1, 2].map((j) => -[0, 1, 2].reduce((sum, k) => sum + inverse[i * 3 + k] * s2[j][k], 0)),
  );
  const reduced = s1.map((row, i) =>
    row.map((value, j) => value + [0, 1, 2].reduce((sum, k) => sum + s2[i][k] * t[k][j], 0)),
  );
  // Times the inverse of the constraint matrix.
  const m = [reduced[2].map((v) => v / 2), reduced[1].map((v) => -v), reduced[0].map((v) => v / 2)];
  // The ellipse is the eigenvector that meets the constraint 4AC - B² > 0.
  const vectors = eigenvectors3(m);
  const ratios = vectors.map((u) => (4 * u[0] * u[2] - u[1] * u[1]) / sumSquares(u));
  const [a, b, c] = vectors[ratios.indexOf(Math.max(...ratios))];
  const [d, e, f] = t.map((row) => row[0] * a + row[1] * b + row[2] * c);
  const det = 4 * a * c - b * b;
  const x0 = (b * e - 2 * c * d) / det;
  const y0 = (b * d - 2 * a * e) / det;
  const angle = Math.atan2(b, a - c) / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const along = a * cos * cos + b * cos * sin + c * sin * sin;
  const across = a * sin * sin - b * cos * sin + c * cos * cos;
  const level = f + (d * x0 + e * y0) / 2;
  return {
    cx: mx + x0 * scale,
    cy: my + y0 * scale,
    rx: Math.sqrt(-level / along) * scale,
    ry: Math.sqrt(-level / across) * scale,
    angle,
  };
}

/**
 * Distance from a point to an ellipse: Newton's method on the parameter of
 * the nearest point, in the quadrant the point is in.
 *
 * @param p - The point.
 * @param ellipse - Centre, radii and rotation in radians.
 * @returns The distance in pixels.
 */
export function ellipseDistance(
  p: Point,
  ellipse: { cx: number; cy: number; rx: number; ry: number; angle: number },
): number {
  const { cx, cy, rx, ry, angle } = ellipse;
  const dx = p.x - cx;
  const dy = p.y - cy;
  const x = Math.abs(dx * Math.cos(angle) + dy * Math.sin(angle));
  const y = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle));
  let t = Math.atan2(rx * y, ry * x);
  for (let round = 0; round < 8; round++) {
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const f = (rx * rx - ry * ry) * ct * st - x * rx * st + y * ry * ct;
    const slope = (rx * rx - ry * ry) * (ct * ct - st * st) - x * rx * ct - y * ry * st;
    t = Math.min(Math.PI / 2, Math.max(0, t - f / slope));
  }
  return Math.hypot(x - rx * Math.cos(t), y - ry * Math.sin(t));
}

/**
 * Signed distance from a point to a rectangle with rounded corners:
 * negative inside.
 *
 * @param p - The point.
 * @param params - Centre x and y, width, height, rotation (radians) and corner radius.
 * @returns The distance in pixels.
 */
export function rectDistance(p: Point, params: readonly number[]): number {
  const [cx, cy, width, height, angle, corner = 0] = params;
  const halfW = Math.abs(width) / 2;
  const halfH = Math.abs(height) / 2;
  const radius = Math.min(Math.max(corner, 0), halfW, halfH);
  const dx = p.x - cx;
  const dy = p.y - cy;
  const u = Math.abs(dx * Math.cos(angle) + dy * Math.sin(angle)) - (halfW - radius);
  const v = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle)) - (halfH - radius);
  return Math.hypot(Math.max(u, 0), Math.max(v, 0)) + Math.min(Math.max(u, v), 0) - radius;
}

/**
 * Fits a rectangle, optionally with rounded corners, to an outline: the
 * smallest rectangle round the points ({@link minAreaRect}) as the start,
 * the corner radius from how much area the corners leave out, then least
 * squares on the signed distances.
 *
 * @param points - The outline.
 * @param area - The area it encloses.
 * @param rounded - Whether to fit a corner radius; otherwise the corners stay sharp.
 * @returns The rectangle, its rotation within ±45°.
 */
export function fitRect(points: readonly Point[], area: number, rounded: boolean): RectShape {
  const seed = minAreaRect(points);
  const { width, height } = seed;
  const start = [seed.center.x, seed.center.y, width, height, (seed.angle * Math.PI) / 180];
  if (rounded) {
    // A rectangle with corners of radius r encloses w·h - (4 - π)·r².
    const radius = Math.sqrt(Math.max(0, (width * height - area) / (4 - Math.PI)));
    start.push(Math.min(radius, width / 2, height / 2));
  }
  const [cx, cy, w, h, angle, corner = 0] = leastSquares(start, (params) =>
    points.map((p) => rectDistance(p, params)),
  );
  // A quarter turn swaps the sides; turning back by whole quarters keeps it within ±45°.
  const quarters = Math.round(angle / (Math.PI / 2));
  const [across, down] = quarters % 2 === 0 ? [w, h] : [h, w];
  const [fullW, fullH] = [Math.abs(across), Math.abs(down)];
  return {
    kind: "rect",
    x: cx - fullW / 2,
    y: cy - fullH / 2,
    width: fullW,
    height: fullH,
    rx: Math.min(Math.max(corner, 0), fullW / 2, fullH / 2),
    angle: ((angle - (quarters * Math.PI) / 2) * 180) / Math.PI,
  };
}

/**
 * Fits a polygon to an outline with as few corners as keep it within
 * `tolerance`: the Douglas–Peucker vertices at `tolerance`, less any whose
 * removal keeps every point within it, each placed where straight lines
 * fitted to the two sides meeting there cross.
 *
 * @param points - The outline, closed.
 * @param tolerance - Polygon tolerance in pixels.
 * @returns The corners, in the outline's order, or `null` when it takes fewer than 3 or more than 8.
 */
export function fitPolygon(points: readonly Point[], tolerance: number): Point[] | null {
  const n = points.length;
  const place = (corners: readonly number[]): Point[] => {
    const m = corners.length;
    const sides = corners.map((from, j) => {
      const length = (corners[(j + 1) % m] - from + n) % n;
      const trim = Math.min(TRIM, length >> 2);
      return fitLine(
        Array.from({ length: length + 1 - 2 * trim }, (_, k) => points[(from + trim + k) % n]),
      );
    });
    return corners.map(
      (corner, j) => intersectLines(sides[(j + m - 1) % m], sides[j]) ?? points[corner],
    );
  };
  let corners = findCorners(points, 0, tolerance);
  // Many more vertices than a polygon has: a curve or a freeform outline.
  if (corners.length > 2 * MAX_CORNERS) return null;
  // Drop the corners the outline doesn't need, such as both ends of a tip the
  // pixel grid flattened: each time the one whose removal strays least, while
  // every point stays within the tolerance.
  while (corners.length > 3) {
    const options = corners.map((_, j) => corners.filter((_, k) => k !== j));
    const errors = options.map((option) => {
      const polygon = place(option);
      return Math.max(...points.map((p) => polygonDistance(p, polygon)));
    });
    const best = errors.indexOf(Math.min(...errors));
    if (errors[best] > tolerance) break;
    corners = options[best];
  }
  return corners.length >= 3 && corners.length <= MAX_CORNERS ? place(corners) : null;
}

/**
 * Distance from a point to a polygon's outline.
 *
 * @param p - The point.
 * @param polygon - The corners.
 * @returns The distance in pixels.
 */
const polygonDistance = (p: Point, polygon: readonly Point[]): number =>
  Math.min(...polygon.map((a, i) => segmentDistance(p, a, polygon[(i + 1) % polygon.length])));

/**
 * Matches one traced loop against the primitives, simplest first: circle,
 * ellipse, rectangle, rounded rectangle, polygon. The first one that every
 * sample lies within `tolerance` of, and whose area is within `tolerance`
 * of the loop's along its length, is it.
 *
 * @param outline - The loop's samples and area.
 * @param settings - Tolerance and which primitives to try.
 * @returns The primitive, or `null` when none fits.
 */
export function matchLoop(
  { samples, area }: TracedOutline,
  { tolerance, kinds }: RecognizeSettings,
): PrimitiveShape | null {
  const size = Math.abs(area);
  // The area check catches a primitive the samples only run along part of, like a thin arc.
  const fits = (distance: (p: Point) => number, shapeArea: number) =>
    Math.abs(shapeArea - size) <= (tolerance * samples.length) / 2 &&
    samples.every((p) => Math.abs(distance(p)) <= tolerance);
  if (kinds.has("circle")) {
    const { cx, cy, r } = fitCircle(samples);
    const shape: CircleShape = { kind: "circle", cx, cy, r };
    if (fits((p) => Math.hypot(p.x - cx, p.y - cy) - r, Math.PI * r * r)) return shape;
  }
  if (kinds.has("ellipse")) {
    const ellipse = fitEllipse(samples);
    if (fits((p) => ellipseDistance(p, ellipse), Math.PI * ellipse.rx * ellipse.ry)) {
      return ellipseShape(ellipse);
    }
  }
  if (kinds.has("rect")) {
    for (const rounded of [false, true]) {
      const rect = fitRect(samples, size, rounded);
      const params = rectParams(rect);
      const rectArea = rect.width * rect.height - (4 - Math.PI) * rect.rx * rect.rx;
      if (fits((p) => rectDistance(p, params), rectArea)) return rect;
    }
  }
  if (kinds.has("polygon")) {
    const points = fitPolygon(samples, tolerance);
    if (points && fits((p) => polygonDistance(p, points), Math.abs(contourArea(points)))) {
      const shape: PolygonShape = { kind: "polygon", points };
      return shape;
    }
  }
  return null;
}

/**
 * An ellipse as a shape, its rotation within ±45° (the radii swap when it
 * turns back by a quarter).
 *
 * @param ellipse - Centre, radii and rotation in radians.
 * @returns The shape.
 */
const ellipseShape = (ellipse: ReturnType<typeof fitEllipse>): EllipseShape => {
  const quarters = Math.round(ellipse.angle / (Math.PI / 2));
  const [rx, ry] = quarters % 2 === 0 ? [ellipse.rx, ellipse.ry] : [ellipse.ry, ellipse.rx];
  const angle = ((ellipse.angle - (quarters * Math.PI) / 2) * 180) / Math.PI;
  return { kind: "ellipse", cx: ellipse.cx, cy: ellipse.cy, rx, ry, angle };
};

/**
 * A rectangle's parameters for {@link rectDistance}.
 *
 * @param rect - The rectangle.
 * @returns Centre x and y, width, height, rotation in radians, corner radius.
 */
const rectParams = (rect: RectShape): number[] => [
  rect.x + rect.width / 2,
  rect.y + rect.height / 2,
  rect.width,
  rect.height,
  (rect.angle * Math.PI) / 180,
  rect.rx,
];

/**
 * Recognises a traced shape: its outline and holes are each matched with
 * {@link matchLoop}. A circle with one concentric circular hole is a ring,
 * one stroked circle; an outline and holes that are all primitives are one
 * path of those parts.
 *
 * @param loops - The outline first, then each hole.
 * @param settings - Tolerance and which primitives to try.
 * @returns The shape (without colour), or `null` when the outline or a hole matches no primitive.
 */
export function recognizeShape(
  loops: readonly TracedOutline[],
  settings: RecognizeSettings,
): VectorShape | null {
  const parts: PrimitiveShape[] = [];
  for (const loop of loops) {
    const part = matchLoop(loop, settings);
    if (!part) return null;
    parts.push(part);
  }
  const [outline, ...holes] = parts;
  if (holes.length === 0) return outline;
  const [inner] = holes;
  if (holes.length === 1 && outline.kind === "circle" && inner.kind === "circle") {
    const ring = fitRing(loops[0].samples, loops[1].samples, settings.tolerance);
    if (ring) return ring;
  }
  const shape: PathShape = { kind: "path", segments: [], holes: holes.length, parts };
  shape.segments = shapeSegments(shape).segments;
  return shape;
}

/**
 * Fits two concentric circles to a ring's outline and hole: one centre for
 * both (the circle fits' centres, weighted by their sample counts), each
 * radius the mean distance from it.
 *
 * @param outer - Samples of the outline.
 * @param inner - Samples of the hole.
 * @param tolerance - Largest distance of a sample from its circle.
 * @returns The ring as a stroked circle, or `null` when the circles aren't concentric.
 */
const fitRing = (
  outer: readonly Point[],
  inner: readonly Point[],
  tolerance: number,
): CircleShape | null => {
  const [a, b] = [fitCircle(outer), fitCircle(inner)];
  const total = outer.length + inner.length;
  const cx = (a.cx * outer.length + b.cx * inner.length) / total;
  const cy = (a.cy * outer.length + b.cy * inner.length) / total;
  const distances = [outer, inner].map((loop) => loop.map((p) => Math.hypot(p.x - cx, p.y - cy)));
  const [big, small] = distances.map((d) => d.reduce((sum, v) => sum + v, 0) / d.length);
  const concentric = distances.every((d, k) =>
    d.every((v) => Math.abs(v - [big, small][k]) <= tolerance),
  );
  return concentric
    ? { kind: "circle", cx, cy, r: (big + small) / 2, strokeWidth: big - small }
    : null;
};

/**
 * Turns points given about a centre, in a frame turned by `angle`, into
 * image coordinates.
 *
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param angle - Rotation in degrees, clockwise on screen.
 * @returns The transform.
 */
const frame = (cx: number, cy: number, angle: number) => {
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);
  return (u: number, v: number): Point => ({
    x: cx + u * cos - v * sin,
    y: cy + u * sin + v * cos,
  });
};

/**
 * Reverses a closed subpath (`M` … `Z`) of lines and cubic curves.
 *
 * @param segments - The subpath.
 * @returns The same outline, run the other way round.
 */
const reverseSubpath = (segments: readonly PathSegment[]): PathSegment[] => {
  const start = segments[0].points[0]!;
  const drawn = segments.slice(1, -1);
  const end = (i: number) => (i < 0 ? start : drawn[i].points[drawn[i].points.length - 1]!);
  const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
  const out: PathSegment[] = [{ type: "M", points: [start] }];
  // The line Z drew back to the start, now the first one drawn.
  if (!same(end(drawn.length - 1), start)) out.push({ type: "L", points: [end(drawn.length - 1)] });
  for (let i = drawn.length - 1; i >= 0; i--) {
    const segment = drawn[i];
    out.push(
      segment.type === "C"
        ? { type: "C", points: [segment.points[1], segment.points[0], end(i - 1)] }
        : { type: "L", points: [end(i - 1)] },
    );
  }
  // A last line back to the start is drawn by Z.
  if (out[out.length - 1].type === "L") out.pop();
  out.push({ type: "Z", points: [] });
  return out;
};

/**
 * The outline of a primitive as one closed subpath: a circle or ellipse as
 * four cubic quarter curves, a rectangle as lines with cubic quarter
 * circles at rounded corners, a polygon as lines. Circles, ellipses and
 * rectangles run clockwise on screen; a polygon keeps its corners' order.
 *
 * @param shape - The primitive.
 * @param radius - For a circle, the radius to draw instead of its own.
 * @returns The subpath, `M` … `Z`.
 */
const primitiveSubpath = (shape: PrimitiveShape, radius?: number): PathSegment[] => {
  if (shape.kind === "polygon") {
    const [first, ...rest] = shape.points;
    return [
      { type: "M", points: [first] },
      ...rest.map((p): PathSegment => ({ type: "L", points: [p] })),
      { type: "Z", points: [] },
    ];
  }
  if (shape.kind === "rect") {
    const { x, y, width, height, rx, angle } = shape;
    const at = frame(x + width / 2, y + height / 2, angle);
    const [w, h] = [width / 2, height / 2];
    const out: PathSegment[] = [{ type: "M", points: [at(-w + rx, -h)] }];
    // Corners clockwise from the top right: each as [sign x, sign y], entered along x or y.
    for (const [sx, sy, alongX] of [
      [1, -1, true],
      [1, 1, false],
      [-1, 1, true],
      [-1, -1, false],
    ] as const) {
      const enter = alongX ? at(sx * (w - rx), sy * h) : at(sx * w, sy * (h - rx));
      const leave = alongX ? at(sx * w, sy * (h - rx)) : at(sx * (w - rx), sy * h);
      out.push({ type: "L", points: [enter] });
      if (rx > 0) {
        const k = rx * (1 - KAPPA);
        const c1 = alongX ? at(sx * (w - k), sy * h) : at(sx * w, sy * (h - k));
        const c2 = alongX ? at(sx * w, sy * (h - k)) : at(sx * (w - k), sy * h);
        out.push({ type: "C", points: [c1, c2, leave] });
      }
    }
    // A sharp rectangle's last line runs back to the start, which `Z` draws.
    if (rx === 0) out.pop();
    out.push({ type: "Z", points: [] });
    return out;
  }
  const [rx, ry, angle] =
    shape.kind === "circle"
      ? [radius ?? shape.r, radius ?? shape.r, 0]
      : [shape.rx, shape.ry, shape.angle];
  const at = frame(shape.cx, shape.cy, angle);
  const quarter = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  const out: PathSegment[] = [{ type: "M", points: [at(rx, 0)] }];
  quarter.forEach(([u, v], i) => {
    const [nu, nv] = quarter[(i + 1) % 4];
    out.push({
      type: "C",
      points: [
        at(rx * (u + KAPPA * nu), ry * (v + KAPPA * nv)),
        at(rx * (nu + KAPPA * u), ry * (nv + KAPPA * v)),
        at(rx * nu, ry * nv),
      ],
    });
  });
  out.push({ type: "Z", points: [] });
  return out;
};

/**
 * Runs a subpath the given way round: clockwise on screen (positive area,
 * y down) for an outline, anticlockwise for a hole.
 *
 * @param subpath - The subpath.
 * @param clockwise - Which way it should run.
 * @returns The subpath, reversed if it ran the other way.
 */
const orient = (subpath: PathSegment[], clockwise: boolean): PathSegment[] => {
  const ends = subpath.slice(0, -1).map((s) => s.points[s.points.length - 1]);
  return contourArea(ends) > 0 === clockwise ? subpath : reverseSubpath(subpath);
};

/**
 * A shape as path segments: its outline running clockwise and each hole
 * anticlockwise, so either fill rule leaves the holes empty. A ring is its
 * outer and inner circle.
 *
 * @param shape - The shape.
 * @returns The segments and the number of holes.
 */
export function shapeSegments(shape: VectorShape): { segments: PathSegment[]; holes: number } {
  if (shape.kind === "path") {
    if (!shape.parts) return { segments: shape.segments, holes: shape.holes };
    const segments = shape.parts.flatMap((part, i) => orient(primitiveSubpath(part), i === 0));
    return { segments, holes: shape.parts.length - 1 };
  }
  if (shape.kind === "circle" && shape.strokeWidth !== undefined) {
    const half = shape.strokeWidth / 2;
    return {
      segments: [
        ...primitiveSubpath(shape, shape.r + half),
        ...orient(primitiveSubpath(shape, shape.r - half), false),
      ],
      holes: 1,
    };
  }
  return { segments: orient(primitiveSubpath(shape), true), holes: 0 };
}
