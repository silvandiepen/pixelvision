import { createMatrix } from "../core/matrix";
import { transformPoint } from "../math/transforms";
import type { Point } from "../math/transforms.model";
import { findContours } from "../shape/contours";
import { approxPolygon } from "../shape/polygon";
import type { FinderPattern } from "./qrCode.model";

/** A thresholded image: 1 for dark pixels. */
export interface Binary {
  width: number;
  height: number;
  data: Uint8Array;
}

/**
 * Whether five run lengths are in the finder pattern's 1:1:3:1:1 ratio.
 *
 * @param runs - Dark, light, dark, light, dark run lengths.
 * @param slack - Allowed deviation per module, as a fraction of the module size.
 * @returns `true` when they fit.
 */
const finderRatio = (runs: readonly number[], slack: number): boolean => {
  const total = runs[0] + runs[1] + runs[2] + runs[3] + runs[4];
  if (total < 7) return false;
  const module = total / 7;
  const tolerance = module * slack;
  return (
    Math.abs(module - runs[0]) < tolerance &&
    Math.abs(module - runs[1]) < tolerance &&
    Math.abs(3 * module - runs[2]) < 3 * tolerance &&
    Math.abs(module - runs[3]) < tolerance &&
    Math.abs(module - runs[4]) < tolerance
  );
};

/**
 * Measures the five runs of a finder pattern along a line through a point
 * on its centre square.
 *
 * @param image - Thresholded image.
 * @param x - Column of the point.
 * @param y - Row of the point.
 * @param dx - Step along the line, x.
 * @param dy - Step along the line, y.
 * @param maxRun - Longest outer run accepted.
 * @returns The run lengths and the centre run's middle as an offset along
 *   the line from the point, or `undefined` when the line doesn't cross a pattern.
 */
export const crossRuns = (
  image: Binary,
  x: number,
  y: number,
  dx: number,
  dy: number,
  maxRun: number,
): { runs: number[]; centre: number } | undefined => {
  const { width, height, data } = image;
  const dark = (k: number) => {
    const px = x + k * dx;
    const py = y + k * dy;
    return px >= 0 && py >= 0 && px < width && py < height ? data[py * width + px] : -1;
  };
  if (dark(0) !== 1) return undefined;
  const runs = [0, 0, 0, 0, 0];
  let back = 0;
  while (dark(-back - 1) === 1) back++;
  let forward = 0;
  while (dark(forward + 1) === 1) forward++;
  runs[2] = back + forward + 1;
  for (const [sign, start, index] of [
    [-1, back, 1],
    [1, forward, 3],
  ] as const) {
    let k = start + 1;
    for (const [run, colour] of [
      [index, 0],
      [index + sign * 1, 1],
    ] as const) {
      while (dark(sign * k) === colour && runs[run] <= maxRun) {
        runs[run]++;
        k++;
      }
      // The pattern must be bounded by the image and not run on.
      if (runs[run] === 0 || runs[run] > maxRun) return undefined;
    }
  }
  return { runs, centre: (forward - back) / 2 };
};

/**
 * Finds finder pattern candidates: rows are scanned for dark-light-dark-
 * light-dark runs in the ratio 1:1:3:1:1, and each hit is confirmed
 * vertically, horizontally again and diagonally (the ratio holds along any
 * line through the centre, so turned codes are found too). Hits on nearby
 * rows are merged.
 *
 * @param image - Thresholded image.
 * @returns Candidates, most confirmed first.
 */
export const findFinderPatterns = (image: Binary): FinderPattern[] => {
  const { width, height, data } = image;
  const found: FinderPattern[] = [];
  for (let y = 0; y < height; y++) {
    // Run lengths of the row, starting with its first colour.
    const starts: number[] = [];
    const colours: number[] = [];
    for (let x = 0; x < width; x++) {
      const v = data[y * width + x];
      if (x === 0 || v !== data[y * width + x - 1]) {
        starts.push(x);
        colours.push(v);
      }
    }
    starts.push(width);
    for (let r = 0; r + 5 < starts.length; r++) {
      if (colours[r] !== 1) continue;
      const runs = [0, 1, 2, 3, 4].map((k) => starts[r + k + 1] - starts[r + k]);
      if (!finderRatio(runs, 0.5)) continue;
      const total = runs.reduce((a, b) => a + b);
      const maxRun = Math.ceil(total / 2);
      // Vertical through the centre square, then horizontal again.
      let cx = Math.floor((starts[r + 2] + starts[r + 3]) / 2);
      const vertical = crossRuns(image, cx, y, 0, 1, maxRun);
      if (!vertical || !finderRatio(vertical.runs, 0.5)) continue;
      const verticalTotal = vertical.runs.reduce((a, b) => a + b);
      if (5 * Math.abs(verticalTotal - total) >= 2 * total) continue;
      const cy = Math.floor(y + 0.5 + vertical.centre);
      const horizontal = crossRuns(image, cx, cy, 1, 0, maxRun);
      if (!horizontal || !finderRatio(horizontal.runs, 0.5)) continue;
      const centreX = cx + 0.5 + horizontal.centre;
      cx = Math.floor(centreX);
      const vertical2 = crossRuns(image, cx, cy, 0, 1, maxRun);
      const diagonal = crossRuns(image, cx, cy, 1, 1, maxRun);
      if (!vertical2 || !diagonal || !finderRatio(diagonal.runs, 0.75)) continue;
      const centreY = cy + 0.5 + vertical2.centre;
      const moduleSize =
        (horizontal.runs.reduce((a, b) => a + b) + vertical2.runs.reduce((a, b) => a + b)) / 14;
      const near = found.find(
        (f) =>
          Math.abs(f.x - centreX) <= f.moduleSize &&
          Math.abs(f.y - centreY) <= f.moduleSize &&
          Math.abs(f.moduleSize - moduleSize) <= Math.max(1, f.moduleSize),
      );
      if (near) {
        const n = near.count;
        near.x = (near.x * n + centreX) / (n + 1);
        near.y = (near.y * n + centreY) / (n + 1);
        near.moduleSize = (near.moduleSize * n + moduleSize) / (n + 1);
        near.count++;
      } else {
        found.push({ x: centreX, y: centreY, moduleSize, count: 1 });
      }
    }
  }
  return found.sort((a, b) => b.count - a.count);
};

/**
 * Picks the three finder patterns that best form the corners of one code:
 * similar module sizes, two equal sides at a right angle. Orders them
 * top-left (at the right angle), top-right, bottom-left, so that the turn
 * from top-right to bottom-left is clockwise on screen.
 *
 * @param candidates - Finder pattern candidates, most confirmed first.
 * @returns The three patterns, best triples first.
 */
export const finderTriples = (candidates: readonly FinderPattern[]): FinderPattern[][] => {
  const pool = candidates.filter((c) => c.count >= 2).slice(0, 12);
  const scored: { score: number; triple: FinderPattern[] }[] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      for (let k = j + 1; k < pool.length; k++) {
        const p = [pool[i], pool[j], pool[k]];
        const sizes = p.map((f) => f.moduleSize);
        if (Math.max(...sizes) > 1.5 * Math.min(...sizes)) continue;
        // The corner at the right angle is opposite the longest side.
        const d = (a: FinderPattern, b: FinderPattern) => Math.hypot(a.x - b.x, a.y - b.y);
        const sides = [d(p[1], p[2]), d(p[0], p[2]), d(p[0], p[1])];
        const corner = sides.indexOf(Math.max(...sides));
        const [a, b] = sides.filter((_, s) => s !== corner);
        const c = sides[corner];
        // Too close for a code: at least 7 modules from centre to centre.
        if (Math.min(a, b) < 7 * Math.max(...sizes)) continue;
        const score = Math.abs(a - b) / Math.max(a, b) + Math.abs(a * a + b * b - c * c) / (c * c);
        if (score > 0.5) continue;
        const topLeft = p[corner];
        let [topRight, bottomLeft] = p.filter((_, s) => s !== corner);
        const cross =
          (topRight.x - topLeft.x) * (bottomLeft.y - topLeft.y) -
          (topRight.y - topLeft.y) * (bottomLeft.x - topLeft.x);
        if (cross < 0) [topRight, bottomLeft] = [bottomLeft, topRight];
        scored.push({ score, triple: [topLeft, topRight, bottomLeft] });
      }
    }
  }
  return scored.sort((x, y) => x.score - y.score).map((s) => s.triple);
};

/**
 * Width of a finder pattern along a line through its centre, in pixels:
 * from the centre, out to where its dark-light-dark rings end, both ways.
 * Measured along the line to another finder pattern it is 7 modules
 * whatever the code's rotation.
 *
 * @param image - Thresholded image.
 * @param from - The pattern's centre.
 * @param toward - A point giving the direction, e.g. another pattern's centre.
 * @returns The width, or `undefined` when the rings don't end within reach.
 */
export const patternWidth = (image: Binary, from: Point, toward: Point): number | undefined => {
  const { width, height, data } = image;
  const length = Math.hypot(toward.x - from.x, toward.y - from.y);
  const ux = (toward.x - from.x) / length;
  const uy = (toward.y - from.y) / length;
  let total = 0;
  for (const sign of [1, -1]) {
    // Dark centre, light ring, dark ring, then light: the pattern's edge.
    let state = 0;
    let t = 0;
    for (; state < 3 && t < length; t += 0.5) {
      const x = Math.floor(from.x + sign * t * ux);
      const y = Math.floor(from.y + sign * t * uy);
      const dark = x >= 0 && y >= 0 && x < width && y < height && data[y * width + x] === 1;
      if (dark === (state % 2 === 1)) state++;
    }
    if (state < 3) return undefined;
    total += t - 0.5;
  }
  return total;
};

/**
 * Looks for the alignment pattern (5 x 5 modules: a dark module in a light
 * ring in a dark ring) near where it is expected. Every dark pixel within
 * `radius` modules is tried as its centre: the 25 modules around it are
 * sampled along the code's own axes, and the best match (at least 22 of
 * 25, nearest the estimate on a tie) wins, refined to the middle of the
 * pixels that match as well.
 *
 * @param image - Thresholded image.
 * @param estimate - Expected centre.
 * @param right - One module along the code's rows, in pixels.
 * @param down - One module along the code's columns, in pixels.
 * @param radius - Search radius in modules.
 * @returns The centre, or `undefined` when none is found.
 */
export const findAlignmentPattern = (
  image: Binary,
  estimate: Point,
  right: Point,
  down: Point,
  radius: number,
): Point | undefined => {
  const { width, height, data } = image;
  const reach = Math.ceil(
    radius * Math.max(Math.hypot(right.x, right.y), Math.hypot(down.x, down.y)),
  );
  const x0 = Math.max(0, Math.floor(estimate.x) - reach);
  const x1 = Math.min(width - 1, Math.floor(estimate.x) + reach);
  const y0 = Math.max(0, Math.floor(estimate.y) - reach);
  const y1 = Math.min(height - 1, Math.floor(estimate.y) + reach);
  const dark = (x: number, y: number) => {
    const px = Math.floor(x);
    const py = Math.floor(y);
    return px >= 0 && py >= 0 && px < width && py < height && data[py * width + px] === 1;
  };
  let bestScore = 21;
  let matches: Point[] = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (data[y * width + x] !== 1) continue;
      let score = 0;
      for (let j = -2; j <= 2; j++) {
        for (let i = -2; i <= 2; i++) {
          const ring = Math.max(Math.abs(i), Math.abs(j));
          const sx = x + 0.5 + i * right.x + j * down.x;
          const sy = y + 0.5 + i * right.y + j * down.y;
          if (dark(sx, sy) === (ring !== 1)) score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        matches = [];
      }
      if (score === bestScore) matches.push({ x: x + 0.5, y: y + 0.5 });
    }
  }
  if (!matches.length) return undefined;
  // The best pixels can belong to several places; keep the cluster nearest the estimate.
  const distance = (p: Point) => Math.hypot(p.x - estimate.x, p.y - estimate.y);
  const nearest = matches.reduce((a, b) => (distance(b) < distance(a) ? b : a));
  const limit = Math.hypot(right.x, right.y);
  const cluster = matches.filter((p) => Math.hypot(p.x - nearest.x, p.y - nearest.y) <= limit);
  return {
    x: cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length,
    y: cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length,
  };
};

/**
 * Traces the outer ring of a finder pattern and returns its four outer
 * corners. The ring is isolated by the light separator and quiet zone, so
 * it is flood-filled from a point 3 modules out from the centre, its
 * outline traced and simplified to four corners.
 *
 * @param image - Thresholded image.
 * @param centre - The pattern's centre.
 * @param toward - A point giving a direction along the code's axes (another pattern's centre).
 * @param moduleSize - Module size in pixels.
 * @returns The four corners (on the ring's outer edge), or `undefined` when
 *   the ring can't be isolated.
 */
export const finderCorners = (
  image: Binary,
  centre: Point,
  toward: Point,
  moduleSize: number,
): Point[] | undefined => {
  const { width, height, data } = image;
  const length = Math.hypot(toward.x - centre.x, toward.y - centre.y);
  const ux = (toward.x - centre.x) / length;
  const uy = (toward.y - centre.y) / length;
  const dark = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height && data[y * width + x] === 1;
  // The outer ring lies 2.5 to 3.5 modules from the centre.
  let start: [number, number] | undefined;
  for (let t = 2.5 * moduleSize; t <= 3.5 * moduleSize && !start; t += 0.5) {
    const x = Math.floor(centre.x + t * ux);
    const y = Math.floor(centre.y + t * uy);
    if (dark(x, y)) start = [x, y];
  }
  if (!start) return undefined;
  // Flood-fill the ring within a box that holds the pattern at any rotation.
  const reach = Math.ceil(8 * moduleSize);
  const x0 = Math.floor(centre.x) - reach;
  const y0 = Math.floor(centre.y) - reach;
  const size = 2 * reach + 1;
  const ring = createMatrix(size, size);
  const stack = [start];
  ring.data[(start[1] - y0) * size + start[0] - x0] = 1;
  while (stack.length) {
    const [x, y] = stack.pop()!;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (!dark(nx, ny)) continue;
        const rx = nx - x0;
        const ry = ny - y0;
        // Reaching the box's or the image's edge: the ring touches other dark shapes or is cut.
        if (rx <= 0 || ry <= 0 || rx >= size - 1 || ry >= size - 1) return undefined;
        if (nx <= 0 || ny <= 0 || nx >= width - 1 || ny >= height - 1) return undefined;
        if (ring.data[ry * size + rx]) continue;
        ring.data[ry * size + rx] = 1;
        stack.push([nx, ny]);
      }
    }
  }
  const [outline] = findContours(ring);
  const quad = approxPolygon(outline, 0.05 * outline.length);
  if (quad.length !== 4) return undefined;
  // Fit a line to the middle of each side (pixel centres, moved half a pixel
  // out to the ring's edge) and intersect neighbouring sides: steadier than
  // the outline's corner pixels.
  const n = outline.length;
  const at = quad.map((p) => outline.indexOf(p));
  const lines = at.map((from, k) => {
    const span = (at[(k + 1) % 4] - from + n) % n;
    const trim = Math.floor(span * 0.15);
    let sx = 0;
    let sy = 0;
    let count = 0;
    const points: Point[] = [];
    for (let i = trim; i <= span - trim; i++) {
      const p = outline[(from + i) % n];
      points.push({ x: p.x + x0 + 0.5, y: p.y + y0 + 0.5 });
      sx += p.x + x0 + 0.5;
      sy += p.y + y0 + 0.5;
      count++;
    }
    const mx = sx / count;
    const my = sy / count;
    let xx = 0;
    let xy = 0;
    let yy = 0;
    for (const p of points) {
      xx += (p.x - mx) ** 2;
      xy += (p.x - mx) * (p.y - my);
      yy += (p.y - my) ** 2;
    }
    const angle = Math.atan2(2 * xy, xx - yy) / 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    // Normal pointing away from the centre.
    const outward = (mx - centre.x) * -dy + (my - centre.y) * dx > 0 ? 1 : -1;
    return { x: mx - dy * 0.5 * outward, y: my + dx * 0.5 * outward, dx, dy };
  });
  return lines.map((b, k) => {
    const a = lines[(k + 3) % 4];
    const det = a.dx * b.dy - a.dy * b.dx;
    const t = ((b.x - a.x) * b.dy - (b.y - a.y) * b.dx) / det;
    return { x: a.x + t * a.dx, y: a.y + t * a.dy };
  });
};

/**
 * Gives a finder pattern's traced corners their module coordinates: each
 * is 0 or 7 modules from the pattern's own top-left corner, whichever the
 * first estimate of the code's geometry puts it nearer.
 *
 * @param ring - The four corners, in the image.
 * @param toModules - Image-to-module homography (the first estimate).
 * @param origin - Module coordinates of the pattern's top-left corner.
 * @returns The module coordinates in the same order, or `undefined` when
 *   two corners land on the same one or a corner is over 2 modules from its place.
 */
export const ringModules = (
  ring: readonly Point[],
  toModules: ArrayLike<number>,
  origin: Point,
): Point[] | undefined => {
  const modules: Point[] = [];
  for (const p of ring) {
    const m = transformPoint(toModules, p);
    const snapped = {
      x: origin.x + (m.x - origin.x < 3.5 ? 0 : 7),
      y: origin.y + (m.y - origin.y < 3.5 ? 0 : 7),
    };
    if (Math.hypot(m.x - snapped.x, m.y - snapped.y) > 2) return undefined;
    modules.push(snapped);
  }
  return new Set(modules.map((m) => `${m.x},${m.y}`)).size === 4 ? modules : undefined;
};
