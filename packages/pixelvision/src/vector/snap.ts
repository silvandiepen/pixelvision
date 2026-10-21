import type { Matrix } from "../core/matrix.model";
import { houghLinesP } from "../imgproc/houghLinesP";
import type { LineSegment } from "../imgproc/houghLinesP.model";
import { erode } from "../imgproc/morphology";
import type { Point } from "../math/transforms.model";
import { fitLine, lineDistance, segmentDistance } from "./fit";
import type { StraightSpan } from "./fit.model";
import type { Run } from "./snap.model";

// Farthest an outline sample may be from a line to follow it, in pixels.
const NEAR = 1.5;
// Farthest an outline sample may be from a span's fitted line for the span to grow over it.
const GROW = 0.75;
// Fewest samples along one Hough line that seed a span.
const SEED = 4;
// Smallest |cos| between the outline's direction and a line for a sample to follow it (about 25°).
const PARALLEL = 0.9;

/**
 * Finds the straight lines along the boundaries of a mask: the probabilistic
 * Hough transform on its boundary pixels (shape pixels with a background
 * neighbour).
 *
 * @param mask - Single-channel `u8` matrix; non-zero pixels are shape.
 * @param minLength - Shortest line kept, in pixels.
 * @returns The lines, with ends at pixel centres in the outline's coordinates.
 */
export function detectLines(mask: Matrix<"u8">, minLength: number): LineSegment[] {
  const inner = erode(mask).data;
  const edges = { ...mask, data: mask.data.map((v, i) => (v !== 0 && inner[i] === 0 ? 255 : 0)) };
  const segments = houghLinesP(edges, {
    threshold: Math.max(8, Math.round(minLength / 4)),
    minLineLength: Math.max(8, Math.round(minLength / 2)),
    maxLineGap: 3,
  });
  // Pixel (x, y) covers x..x + 1 in outline coordinates, so its centre is half a pixel in.
  const centre = (p: Point) => ({ x: p.x + 0.5, y: p.y + 0.5 });
  return segments.map(({ from, to }) => ({ from: centre(from), to: centre(to) }));
}

/**
 * Finds the runs of a closed outline that follow one straight line: every
 * sample within a pixel of the line, the outline running along it in one
 * direction, for at least `minLength` samples.
 *
 * @param samples - The outline, closed, e.g. from {@link edgeMidpoints}.
 * @param lines - Lines from {@link detectLines}.
 * @param minLength - Shortest run kept, in samples (about pixels).
 * @returns The runs, in order along the outline.
 */
export function straightSpans(
  samples: readonly Point[],
  lines: readonly LineSegment[],
  minLength: number,
): StraightSpan[] {
  const n = samples.length;
  const at = (i: number) => samples[(i + n) % n];
  const xs = samples.map((p) => p.x);
  const ys = samples.map((p) => p.y);
  const [left, right] = [Math.min(...xs) - 1, Math.max(...xs) + 1];
  const [top, bottom] = [Math.min(...ys) - 1, Math.max(...ys) + 1];
  const nearby = lines.filter(
    ({ from, to }) =>
      Math.max(from.x, to.x) >= left &&
      Math.min(from.x, to.x) <= right &&
      Math.max(from.y, to.y) >= top &&
      Math.min(from.y, to.y) <= bottom,
  );
  // Hough often finds one edge as several overlapping pieces; collinear
  // pieces share a group, so a run along the edge isn't cut where they overlap.
  const groups = nearby.map(() => -1);
  nearby.forEach((segment, k) => {
    groups[k] = k;
    for (let g = 0; g < k; g++) {
      if (groups[g] === g && collinear(nearby[g], segment)) groups[k] = g;
    }
  });
  // Each sample's line group, times 2, plus 1 when the outline runs against the line's direction.
  const keys = samples.map((p, i) => {
    const way = sub(at(i + 2), at(i - 2));
    const length = Math.hypot(way.x, way.y);
    let key = -1;
    let best = NEAR;
    nearby.forEach(({ from, to }, k) => {
      const reference = nearby[groups[k]];
      const line = sub(reference.to, reference.from);
      const cos = (way.x * line.x + way.y * line.y) / (length * Math.hypot(line.x, line.y));
      const d = segmentDistance(p, from, to);
      if (Math.abs(cos) < PARALLEL || d > best) return;
      best = d;
      key = 2 * groups[k] + (cos > 0 ? 0 : 1);
    });
    return key;
  });
  // Start the walk where the key changes, so no run is cut in two by the wrap.
  const first = keys.findIndex((key, i) => key !== keys[(i + n - 1) % n]);
  if (first < 0) return [];
  const lineOf = ([from, to]: Run) =>
    fitLine(Array.from({ length: to - from + 1 }, (_, k) => at(from + k)));
  // Hough finds lines in pieces and ends them early, so each run along a line
  // only seeds a span: it grows both ways while the outline stays on its line.
  const grow = (run: Run): Run => {
    let [from, to] = run;
    for (let round = 0; round < 2; round++) {
      const line = lineOf([from, to]);
      while (to - from < n - 1 && lineDistance(at(to + 1), line) <= GROW) to++;
      while (to - from < n - 1 && lineDistance(at(from - 1), line) <= GROW) from--;
    }
    const shift = (((from % n) + n) % n) - from;
    return [from + shift, to + shift];
  };
  const runs: Run[] = [];
  let start = first;
  for (let i = first + 1; i <= first + n; i++) {
    if (i < first + n && keys[i % n] === keys[start % n]) continue;
    if (keys[start % n] >= 0 && i - 1 - start >= SEED) runs.push(grow([start, i - 1]));
    start = i;
  }
  runs.sort((a, b) => a[0] - b[0]);
  // Touching or overlapping runs merge when the outline along both stays on
  // one line; otherwise the overlap (a corner both lines pass near) stays
  // with the earlier run.
  const straight = (run: Run) => {
    const line = lineOf(run);
    return Array.from({ length: run[1] - run[0] + 1 }, (_, k) => at(run[0] + k)).every(
      (p) => lineDistance(p, line) <= GROW,
    );
  };
  const merged: Run[] = [];
  for (const run of runs) {
    const last = merged[merged.length - 1];
    if (last && run[0] <= last[1] + 1 && straight([last[0], Math.max(last[1], run[1])])) {
      last[1] = Math.max(last[1], run[1]);
    } else {
      merged.push(last && run[0] <= last[1] ? [last[1] + 1, run[1]] : run);
    }
  }
  // The same across the wrap, between the last run and the first.
  const head = merged[0];
  const tail = merged[merged.length - 1];
  if (merged.length > 1 && tail[1] + 1 >= head[0] + n) {
    if (straight([tail[0], Math.max(tail[1], head[1] + n)])) {
      tail[1] = Math.max(tail[1], head[1] + n);
      merged.shift();
    } else {
      head[0] = Math.max(head[0], tail[1] + 1 - n);
    }
  }
  return merged
    .filter(([from, to]) => to - from >= minLength)
    .map(([from, to]) => ({ start: from % n, length: Math.min(to - from, n - 1) }));
}

/**
 * Difference of two points.
 *
 * @param a - First point.
 * @param b - Second point.
 * @returns `a - b`.
 */
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });

/**
 * Whether two segments lie along the same straight line: within 3° of
 * parallel, with both ends of `b` close to the line through `a`.
 *
 * @param a - One segment.
 * @param b - The other.
 * @returns `true` when they're collinear.
 */
const collinear = (a: LineSegment, b: LineSegment): boolean => {
  const u = sub(a.to, a.from);
  const v = sub(b.to, b.from);
  const lu = Math.hypot(u.x, u.y);
  const sin = Math.abs(u.x * v.y - u.y * v.x) / (lu * Math.hypot(v.x, v.y));
  const off = (p: Point) => Math.abs(u.x * (p.y - a.from.y) - u.y * (p.x - a.from.x)) / lu;
  return sin < 0.05 && off(b.from) <= NEAR && off(b.to) <= NEAR;
};
