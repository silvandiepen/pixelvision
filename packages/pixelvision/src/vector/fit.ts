import type { Point } from "../math/transforms.model";
import { approxPolygon } from "../shape/polygon";
import type { FitSettings, Line, StraightSpan } from "./fit.model";
import type { PathSegment } from "./vectorize.model";

// Reparameterisation rounds before a curve that still misses is split.
const MAX_ITERATIONS = 4;
// Passes of the [1 2 1] filter over the samples before fitting.
const SMOOTHING = 4;
// A curve whose handles lie within this share of the tolerance (and at least 0.25 px) of
// its chord is drawn as a line.
const STRAIGHT = 0.25;
// Polygon edges shorter than this many samples aren't sides of a corner.
const SIDE = 4;
// Outline samples each side of a corner starts from, before it grows along a straight side.
const CORNER_REACH = 8;
// Farthest an outline sample may be from a fitted line and still extend it, in pixels:
// a shallow line's pixel steps are a whole pixel apart, before the fit tilts to follow them.
const STRAIGHT_RUN = 1;
// How far a placed corner may be off its true position, in pixels.
const CORNER_ERROR = 0.25;
// Farthest a corner moves from the outline sample at its tip, in pixels: enough for the
// tip a sharp corner loses to the pixel grid, not for sides that only meet far away.
const CORNER_SHIFT = 2;
// How far the outline may stray from the corner where two straight spans meet, in pixels.
const CORNER_SLACK = 1.5;

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const scale = (a: Point, s: number): Point => ({ x: a.x * s, y: a.y * s });
const dot = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;
const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Scales a vector to length 1.
 *
 * @param v - A vector of non-zero length.
 * @returns The unit vector.
 */
const normalize = (v: Point): Point => scale(v, 1 / Math.hypot(v.x, v.y));

/**
 * Distance from a point to a line segment.
 *
 * @param p - The point.
 * @param a - One end.
 * @param b - The other end.
 * @returns The distance in pixels.
 */
export function segmentDistance(p: Point, a: Point, b: Point): number {
  const ab = sub(b, a);
  // Clamped projection; a zero-length segment projects everything onto `a`.
  const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / Math.max(dot(ab, ab), 1e-12)));
  return distance(p, add(a, scale(ab, t)));
}

/**
 * Fits a straight line through points by total least squares (it
 * minimises the perpendicular distances).
 *
 * @param points - At least two distinct points.
 * @returns The line through their centroid.
 */
export function fitLine(points: readonly Point[]): Line {
  let mx = 0;
  let my = 0;
  for (const p of points) {
    mx += p.x;
    my += p.y;
  }
  mx /= points.length;
  my /= points.length;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const p of points) {
    sxx += (p.x - mx) ** 2;
    sxy += (p.x - mx) * (p.y - my);
    syy += (p.y - my) ** 2;
  }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { point: { x: mx, y: my }, direction: { x: Math.cos(angle), y: Math.sin(angle) } };
}

/**
 * Where two lines cross.
 *
 * @param a - One line.
 * @param b - The other line.
 * @returns The crossing, or `null` when they're within about 6° of parallel.
 */
export function intersectLines(a: Line, b: Line): Point | null {
  const det = a.direction.x * b.direction.y - a.direction.y * b.direction.x;
  if (Math.abs(det) < 0.1) return null;
  const offset = sub(b.point, a.point);
  const t = (offset.x * b.direction.y - offset.y * b.direction.x) / det;
  return add(a.point, scale(a.direction, t));
}

/**
 * Distance from a point to a line.
 *
 * @param p - The point.
 * @param line - The line.
 * @returns The perpendicular distance in pixels.
 */
export function lineDistance(p: Point, line: Line): number {
  return Math.abs(
    (p.x - line.point.x) * line.direction.y - (p.y - line.point.y) * line.direction.x,
  );
}

/**
 * The point on a line nearest to a given point.
 *
 * @param p - The point.
 * @param line - The line.
 * @returns Its projection onto the line.
 */
export function projectOnLine(p: Point, line: Line): Point {
  return add(line.point, scale(line.direction, dot(sub(p, line.point), line.direction)));
}

/**
 * Finds the samples where a closed outline turns sharply. The outline is
 * simplified to a Douglas–Peucker polygon (at `epsilon`); edges shorter than
 * a few samples are merged away, since a corner cut in two by the pixel grid
 * would otherwise show as two gentle turns. Vertices whose edges then meet
 * at a turn of at least `angle` are corners, each moved to the sample that
 * sticks out furthest nearby (the later one on a tie).
 *
 * @param samples - The outline, closed.
 * @param angle - Smallest turn kept as a corner, in radians.
 * @param epsilon - Polygon tolerance in pixels; wobble below it isn't a corner.
 * @returns Sample indices of the corners, ascending.
 */
export function findCorners(samples: readonly Point[], angle: number, epsilon: number): number[] {
  const n = samples.length;
  const at = (i: number) => samples[((i % n) + n) % n];
  const index = new Map(samples.map((p, i) => [p, i]));
  const vertices = approxPolygon(samples, epsilon).map((p) => index.get(p)!);
  const neighbours = (j: number): [Point, Point] => {
    const m = vertices.length;
    return [samples[vertices[(j + m - 1) % m]], samples[vertices[(j + 1) % m]]];
  };
  const shortEdge = () =>
    vertices.findIndex((v, j) => (vertices[(j + 1) % vertices.length] - v + n) % n < SIDE);
  for (let j = shortEdge(); j >= 0 && vertices.length > 3; j = shortEdge()) {
    // Of the two ends of the short edge, keep the one further out.
    const k = (j + 1) % vertices.length;
    const [before] = neighbours(j);
    const [, after] = neighbours(k);
    const outJ = segmentDistance(samples[vertices[j]], before, after);
    const outK = segmentDistance(samples[vertices[k]], before, after);
    vertices.splice(outJ >= outK ? k : j, 1);
  }
  const corners: number[] = [];
  vertices.forEach((v, j) => {
    const [before, after] = neighbours(j);
    const incoming = sub(samples[v], before);
    const outgoing = sub(after, samples[v]);
    const cross = incoming.x * outgoing.y - incoming.y * outgoing.x;
    if (Math.atan2(Math.abs(cross), dot(incoming, outgoing)) < angle) return;
    // The tip: the sample nearby that sticks out furthest from a chord across
    // the corner, a few samples along each side (no further than the next vertex).
    const m = vertices.length;
    const back = Math.min(2 * SIDE, (v - vertices[(j + m - 1) % m] + n) % n);
    const ahead = Math.min(2 * SIDE, (vertices[(j + 1) % m] - v + n) % n);
    const [a, b] = [at(v - back), at(v + ahead)];
    let apex = v;
    for (let i = v - Math.min(SIDE, back) + 1; i < v + Math.min(SIDE, ahead); i++) {
      if (segmentDistance(at(i), a, b) >= segmentDistance(at(apex), a, b)) apex = i;
    }
    corners.push((apex + n) % n);
  });
  return corners.sort((a, b) => a - b);
}

/**
 * Places a corner where the straight sides on either side of it meet,
 * rather than at the pixel-edge sample nearest to it. Each side is a line
 * fitted to the samples just past the corner, grown along the outline for
 * as long as it stays straight, so a long side is measured over its whole
 * length and its pixel steps average out.
 *
 * @param at - Sample by (wrapping) index.
 * @param i - Index of the corner sample.
 * @param before - Samples back to the previous break in the outline.
 * @param after - Samples on to the next break.
 * @returns The corner position.
 */
export function refineCorner(
  at: (i: number) => Point,
  i: number,
  before: number,
  after: number,
): Point {
  const reach = Math.min(CORNER_REACH, Math.floor(before / 2), Math.floor(after / 2));
  if (reach < 2) return at(i);
  const side = (sign: number, limit: number) => {
    const run = (length: number) => Array.from({ length }, (_, k) => at(i + sign * (k + 2)));
    let length = reach;
    let line = fitLine(run(length));
    for (let round = 0; round < 2; round++) {
      while (length < limit && lineDistance(at(i + sign * (length + 2)), line) <= STRAIGHT_RUN) {
        length++;
      }
      line = fitLine(run(length));
    }
    return line;
  };
  const corner = intersectLines(side(-1, before - 2), side(1, after - 2));
  return corner && distance(corner, at(i)) <= CORNER_SHIFT ? corner : at(i);
}

/**
 * Smooths a run of samples with a few passes of a [1 2 1] filter, which
 * takes out the pixel staircase without moving the run.
 *
 * @param points - The samples.
 * @param closed - Whether the run wraps round; when open, its ends stay put.
 * @returns The smoothed samples.
 */
export function smooth(points: readonly Point[], closed: boolean): Point[] {
  const n = points.length;
  let current = [...points];
  for (let pass = 0; pass < SMOOTHING; pass++) {
    const source = current;
    current = source.map((p, i) => {
      if (!closed && (i === 0 || i === n - 1)) return p;
      const a = source[(i + n - 1) % n];
      const c = source[(i + 1) % n];
      return { x: (a.x + 2 * p.x + c.x) / 4, y: (a.y + 2 * p.y + c.y) / 4 };
    });
  }
  return current;
}

/**
 * Douglas–Peucker on an open run whose ends are fixed.
 *
 * @param points - The run.
 * @param tolerance - Largest distance between run and polyline.
 * @returns Indices of the kept points after the first, ascending; the last point is always kept.
 */
export function simplifyOpen(points: readonly Point[], tolerance: number): number[] {
  const last = points.length - 1;
  const kept = [last];
  const stack: [number, number][] = [[0, last]];
  while (stack.length) {
    const [from, to] = stack.pop()!;
    let farthest = 0;
    let split = from;
    for (let i = from + 1; i < to; i++) {
      const d = segmentDistance(points[i], points[from], points[to]);
      if (d > farthest) {
        farthest = d;
        split = i;
      }
    }
    if (farthest > tolerance) {
      kept.push(split);
      stack.push([from, split], [split, to]);
    }
  }
  return kept.sort((a, b) => a - b);
}

/**
 * Evaluates a cubic Bézier curve.
 *
 * @param b - Start, two control points, end.
 * @param t - Parameter, 0–1.
 * @returns The point on the curve.
 */
const bezierPoint = (b: readonly Point[], t: number): Point => {
  const mt = 1 - t;
  const w = [mt * mt * mt, 3 * t * mt * mt, 3 * t * t * mt, t * t * t];
  return { x: dotWeights(b, w, "x"), y: dotWeights(b, w, "y") };
};

/**
 * Weighted sum of one coordinate of some points.
 *
 * @param points - The points.
 * @param weights - One weight per point.
 * @param axis - Which coordinate.
 * @returns The sum.
 */
const dotWeights = (points: readonly Point[], weights: number[], axis: "x" | "y"): number =>
  points.reduce((sum, p, i) => sum + p[axis] * weights[i], 0);

/**
 * Improves the parameter of a point on a curve with one Newton–Raphson
 * step towards the nearest point.
 *
 * @param b - The curve.
 * @param p - The sample.
 * @param u - Its current parameter.
 * @returns The new parameter, kept within 0–1.
 */
const newtonStep = (b: readonly Point[], p: Point, u: number): number => {
  const d1 = [sub(b[1], b[0]), sub(b[2], b[1]), sub(b[3], b[2])].map((v) => scale(v, 3));
  const d2 = [sub(d1[1], d1[0]), sub(d1[2], d1[1])].map((v) => scale(v, 2));
  const mt = 1 - u;
  const w1 = [mt * mt, 2 * u * mt, u * u];
  const q = sub(bezierPoint(b, u), p);
  const q1 = { x: dotWeights(d1, w1, "x"), y: dotWeights(d1, w1, "y") };
  const q2 = { x: d2[0].x * mt + d2[1].x * u, y: d2[0].y * mt + d2[1].y * u };
  const next = u - dot(q, q1) / (dot(q1, q1) + dot(q, q2));
  return Math.min(1, Math.max(0, next));
};

/**
 * Least-squares cubic through a run of points with given end tangents
 * (Schneider's method): only the lengths of the two tangent handles are
 * solved for.
 *
 * @param d - The points.
 * @param first - Index of the first point.
 * @param last - Index of the last point.
 * @param u - Parameter of each point from `first` to `last`.
 * @param t1 - Unit tangent at the start, pointing into the run.
 * @param t2 - Unit tangent at the end, pointing back into the run.
 * @returns Start, two control points, end.
 */
const generateBezier = (
  d: readonly Point[],
  first: number,
  last: number,
  u: number[],
  t1: Point,
  t2: Point,
): Point[] => {
  const a = d[first];
  const b = d[last];
  let c00 = 0;
  let c01 = 0;
  let c11 = 0;
  let x0 = 0;
  let x1 = 0;
  for (let i = first; i <= last; i++) {
    const t = u[i - first];
    const mt = 1 - t;
    const a1 = scale(t1, 3 * t * mt * mt);
    const a2 = scale(t2, 3 * t * t * mt);
    const rest = sub(d[i], add(scale(a, mt * mt * (1 + 2 * t)), scale(b, t * t * (3 - 2 * t))));
    c00 += dot(a1, a1);
    c01 += dot(a1, a2);
    c11 += dot(a2, a2);
    x0 += dot(a1, rest);
    x1 += dot(a2, rest);
  }
  const det = c00 * c11 - c01 * c01;
  const length = distance(a, b);
  let alpha1 = det === 0 ? 0 : (x0 * c11 - x1 * c01) / det;
  let alpha2 = det === 0 ? 0 : (c00 * x1 - c01 * x0) / det;
  // A degenerate or backwards solution falls back to handles a third of the chord long.
  if (!(alpha1 > 1e-6 * length && alpha2 > 1e-6 * length)) alpha1 = alpha2 = length / 3;
  return [a, add(a, scale(t1, alpha1)), add(b, scale(t2, alpha2)), b];
};

/**
 * Fits the points from `first` to `last` with straight lines and cubic
 * curves, splitting where a single curve can't stay within the tolerance.
 *
 * @param d - The points.
 * @param first - Index of the first point.
 * @param last - Index of the last point.
 * @param t1 - Unit tangent at the start, pointing into the run.
 * @param t2 - Unit tangent at the end, pointing back into the run.
 * @param tolerance - Largest distance between a point and the curve.
 * @param out - Segments are appended here.
 */
const fitRange = (
  d: readonly Point[],
  first: number,
  last: number,
  t1: Point,
  t2: Point,
  tolerance: number,
  out: PathSegment[],
): void => {
  if (last - first === 1) {
    out.push({ type: "L", points: [d[last]] });
    return;
  }
  // Chord-length parameters, 0 at the first point and 1 at the last.
  const u = [0];
  for (let i = first + 1; i <= last; i++) u.push(u[u.length - 1] + distance(d[i], d[i - 1]));
  const total = u[u.length - 1];
  for (let i = 0; i < u.length; i++) u[i] /= total;
  const limit = tolerance * tolerance;
  let split = (first + last) >> 1;
  for (let iteration = 0; ; iteration++) {
    const bezier = generateBezier(d, first, last, u, t1, t2);
    let error = 0;
    for (let i = first + 1; i < last; i++) {
      const p = bezierPoint(bezier, u[i - first]);
      const e = (p.x - d[i].x) ** 2 + (p.y - d[i].y) ** 2;
      if (e > error) {
        error = e;
        split = i;
      }
    }
    if (error <= limit) {
      // A curve whose handles lie along its chord is drawn as the line it is.
      // Only then: a straight run between two curves would break their tangents.
      const flatness = Math.max(0.25, tolerance * STRAIGHT);
      const flat =
        segmentDistance(bezier[1], d[first], d[last]) <= flatness &&
        segmentDistance(bezier[2], d[first], d[last]) <= flatness;
      out.push(
        flat
          ? { type: "L", points: [d[last]] }
          : { type: "C", points: [bezier[1], bezier[2], bezier[3]] },
      );
      return;
    }
    // Only a near miss is worth reparameterising; anything else is split.
    if (error > 4 * limit || iteration === MAX_ITERATIONS) break;
    for (let i = first + 1; i < last; i++) u[i - first] = newtonStep(bezier, d[i], u[i - first]);
  }
  const center = normalize(sub(d[split - 1], d[split + 1]));
  fitRange(d, first, split, t1, center, tolerance, out);
  fitRange(d, split, last, scale(center, -1), t2, tolerance, out);
};

/**
 * Fits an open run with lines and cubic Bézier curves.
 *
 * @param points - The run; the first and last points are kept exactly.
 * @param t1 - Unit tangent at the start, pointing into the run.
 * @param t2 - Unit tangent at the end, pointing back into the run.
 * @param tolerance - Largest distance between a point and the curves.
 * @param out - Segments are appended here (the run's start is the current point).
 */
export function fitCubics(
  points: readonly Point[],
  t1: Point,
  t2: Point,
  tolerance: number,
  out: PathSegment[],
): void {
  fitRange(points, 0, points.length - 1, t1, t2, tolerance, out);
}

/**
 * Tangent at the start of a run: the direction of a line fitted through its
 * first few points, which steadies it against the pixel staircase.
 *
 * @param points - The run, at least two points.
 * @returns Unit tangent pointing into the run.
 */
const startTangent = (points: readonly Point[]): Point => {
  const k = Math.min(points.length - 1, 6);
  const { direction } = fitLine(points.slice(0, k + 1));
  return dot(direction, sub(points[k], points[0])) < 0 ? scale(direction, -1) : direction;
};

/**
 * Fits a closed outline that has no corners.
 *
 * @param samples - The outline.
 * @param settings - Tolerance and whether to fit curves.
 * @returns The subpath, from `M` to `Z`.
 */
const fitSmoothLoop = (samples: readonly Point[], settings: FitSettings): PathSegment[] => {
  const points = smooth(samples, true);
  const n = points.length;
  if (!settings.curves) {
    const polygon = approxPolygon(points, settings.tolerance);
    return [
      { type: "M", points: [polygon[0]] },
      ...polygon.slice(1).map((p): PathSegment => ({ type: "L", points: [p] })),
      { type: "Z", points: [] },
    ];
  }
  // Two halves, each with the loop's own tangent at both ends, so the seams are smooth.
  const half = n >> 1;
  const ring = [...points, points[0]];
  const tangent = (i: number) => normalize(sub(ring[i + 1], ring[(i + n - 1) % n]));
  const out: PathSegment[] = [{ type: "M", points: [points[0]] }];
  fitRange(ring, 0, half, tangent(0), scale(tangent(half), -1), settings.tolerance, out);
  fitRange(ring, half, n, tangent(half), scale(tangent(0), -1), settings.tolerance, out);
  out.push({ type: "Z", points: [] });
  return out;
};

/**
 * Turns a closed outline of pixel-edge samples into path segments: sharp
 * corners are found and placed where their sides meet, straight spans are
 * drawn as exact lines, and everything between is fitted with cubic Bézier
 * curves (or a polygon when curves are off).
 *
 * @param samples - The outline, closed, e.g. from {@link edgeMidpoints}.
 * @param settings - Tolerance, corner angle and whether to fit curves.
 * @param spans - Runs to draw as single straight lines.
 * @returns One subpath, from `M` to `Z`.
 */
export function fitLoop(
  samples: readonly Point[],
  settings: FitSettings,
  spans: readonly StraightSpan[] = [],
): PathSegment[] {
  const n = samples.length;
  const at = (i: number) => samples[((i % n) + n) % n];
  // Breaks in the outline, by sample index: `true` for a corner, `false` for the end of a span.
  const breaks = new Map<number, boolean>();
  const spanLines = new Map<number, Line>();
  for (const span of spans) {
    const run = Array.from({ length: span.length + 1 }, (_, k) => at(span.start + k));
    spanLines.set(span.start, fitLine(run));
    breaks.set(span.start, false);
    breaks.set((span.start + span.length) % n, false);
  }
  const insideSpan = (i: number) =>
    spans.some((span) => {
      const offset = (i - span.start + n) % n;
      return offset > 0 && offset < span.length;
    });
  for (const corner of findCorners(
    samples,
    settings.cornerAngle,
    Math.max(1, settings.tolerance),
  )) {
    if (!insideSpan(corner)) breaks.set(corner, true);
  }
  if (breaks.size === 0) return fitSmoothLoop(samples, settings);

  // Piece j runs from break j to break j + 1; the last one wraps round.
  const starts = [...breaks.keys()].sort((a, b) => a - b);
  const m = starts.length;
  const ends = starts.map((_, j) => (j + 1 < m ? starts[j + 1] : starts[0] + n));
  const lines = starts.map((start) => spanLines.get(start));
  const positions = starts.map((start, j) => {
    const before = lines[(j + m - 1) % m];
    const after = lines[j];
    if (before && after) return intersectLines(before, after) ?? at(start);
    if (before) return projectOnLine(at(start), before);
    if (after) return projectOnLine(at(start), after);
    return refineCorner(
      at,
      start,
      start - (j > 0 ? starts[j - 1] : starts[m - 1] - n),
      ends[j] - start,
    );
  });
  // Where the outline between two straight spans hugs the corner their lines
  // make, the spans are extended to meet there.
  const skipped = starts.map(() => false);
  for (let j = 0; j < m; j++) {
    if (!lines[j]) continue;
    let q = 1;
    while (!lines[(j + q) % m]) q++;
    const meet = q > 1 && q < m ? intersectLines(lines[j]!, lines[(j + q) % m]!) : null;
    if (!meet) continue;
    const from = positions[(j + 1) % m];
    const to = positions[(j + q) % m];
    let worst = 0;
    for (let p = 1; p < q; p++) {
      const k = (j + p) % m;
      for (let i = starts[k]; i <= ends[k]; i++) {
        const d = Math.min(segmentDistance(at(i), from, meet), segmentDistance(at(i), meet, to));
        worst = Math.max(worst, d);
      }
    }
    if (worst > CORNER_SLACK) continue;
    for (let p = 1; p <= q; p++) positions[(j + p) % m] = meet;
    for (let p = 1; p < q; p++) skipped[(j + p) % m] = true;
  }

  const out: PathSegment[] = [{ type: "M", points: [positions[0]] }];
  for (let j = 0; j < m; j++) {
    const start = positions[j];
    const end = positions[(j + 1) % m];
    if (skipped[j]) continue;
    if (lines[j]) {
      out.push({ type: "L", points: [end] });
      continue;
    }
    const inner = Array.from({ length: ends[j] - starts[j] - 1 }, (_, k) => at(starts[j] + k + 1));
    const points = smooth([start, ...inner, end], false);
    // Between two breaks there's no smoothness to keep: a run that is straight
    // within the tolerance is a line. A shallow line's pixel steps stay
    // half a pixel either side of it, and its corners may be a little off,
    // so a quarter pixel more is allowed.
    const slack = settings.tolerance + CORNER_ERROR;
    if (points.every((p) => segmentDistance(p, start, end) <= slack)) {
      out.push({ type: "L", points: [end] });
      continue;
    }
    if (!settings.curves) {
      for (const k of simplifyOpen(points, settings.tolerance)) {
        out.push({ type: "L", points: [points[k]] });
      }
      continue;
    }
    // Leaving a straight span without a corner, the curve continues in the span's direction.
    const previous = positions[(j + m - 1) % m];
    const next = positions[(j + 2) % m];
    const t1 =
      !breaks.get(starts[j]) && lines[(j + m - 1) % m]
        ? normalize(sub(start, previous))
        : startTangent(points);
    const t2 =
      !breaks.get(ends[j] % n) && lines[(j + 1) % m]
        ? normalize(sub(end, next))
        : startTangent([...points].reverse());
    fitCubics(points, t1, t2, settings.tolerance, out);
  }
  const last = out[out.length - 1];
  if (last.type === "L" && last.points[0] === positions[0]) out.pop();
  out.push({ type: "Z", points: [] });
  return out;
}
