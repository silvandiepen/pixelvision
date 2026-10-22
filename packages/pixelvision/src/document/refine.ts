import type { Matrix } from "../core/matrix.model";
import { sobelDerivatives } from "../imgproc/derivatives";
import type { Point } from "../math/transforms.model";
import { isConvex } from "../shape/polygon";
import { orderCorners } from "./order";

/** A straight line through a point, with a unit direction. */
interface Line {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/**
 * Gradient strength (|gx| + |gy| of the Sobel derivatives) per pixel.
 *
 * @param gray - One-channel image.
 * @returns The strengths, row by row.
 */
export const gradientStrength = (gray: Matrix<"u8">): Float32Array => {
  const d = sobelDerivatives(gray);
  const n = gray.width * gray.height;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.abs(d.data[2 * i]) + Math.abs(d.data[2 * i + 1]);
  return out;
};

/**
 * The gradient strength below which a share of the pixels fall, so edge
 * thresholds follow the image's own contrast: a faint page on a pale table
 * gets low thresholds, a card on a dark desk high ones.
 *
 * @param strength - From {@link gradientStrength}.
 * @param share - 0–1, e.g. 0.9 for the 90th percentile.
 * @returns The strength.
 */
export const strengthPercentile = (strength: Float32Array, share: number): number => {
  // Sobel strengths of u8 images stay below 2 · 4 · 255 = 2040.
  const bins = new Uint32Array(2048);
  for (const s of strength) bins[Math.min(2047, Math.floor(s))]++;
  const target = share * strength.length;
  let seen = 0;
  let b = 0;
  for (; b < bins.length - 1; b++) {
    seen += bins[b];
    if (seen >= target) break;
  }
  return b;
};

/**
 * Otsu's level among the pixels on one side of a level: splits the bright
 * class (or the dark one) again, to separate a white page from a light
 * table or from glare.
 *
 * @param gray - One-channel image.
 * @param level - The first level.
 * @param above - Split the pixels above `level` (or those at or below it).
 * @returns The level, or null with too few pixels on that side.
 */
export const levelWithin = (gray: Matrix<"u8">, level: number, above: boolean): number | null => {
  const hist = new Float64Array(256);
  const n = gray.width * gray.height;
  for (let i = 0; i < n; i++) {
    const v = gray.data[i];
    if (above ? v > level : v <= level) hist[v]++;
  }
  const total = hist.reduce((a, b) => a + b, 0);
  if (total < 16) return null;
  let sum = 0;
  for (let v = 0; v < 256; v++) sum += v * hist[v];
  let weight = 0;
  let sumBelow = 0;
  let best = -1;
  let bestLevel = above ? level + 1 : 0;
  for (let v = 0; v < 256; v++) {
    weight += hist[v];
    if (weight === 0 || weight === total) continue;
    sumBelow += v * hist[v];
    const meanBelow = sumBelow / weight;
    const meanAbove = (sum - sumBelow) / (total - weight);
    const between = weight * (total - weight) * (meanBelow - meanAbove) ** 2;
    if (between > best) {
      best = between;
      bestLevel = v;
    }
  }
  return bestLevel;
};

/**
 * The share of a quad's outline that lies on set pixels of an edge mask: a
 * document's outline does, a quad that also takes in glare or a
 * neighbouring object doesn't.
 *
 * @param quad - Corners.
 * @param edges - Edge mask (any non-zero pixel counts).
 * @returns 0–1.
 */
export const outlineSupport = (quad: readonly Point[], edges: Matrix<"u8">): number => {
  let on = 0;
  let all = 0;
  for (let k = 0; k < 4; k++) {
    const a = quad[k];
    const b = quad[(k + 1) % 4];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    for (let t = 0; t <= length; t++) {
      const x = Math.round(a.x + ((b.x - a.x) * t) / length);
      const y = Math.round(a.y + ((b.y - a.y) * t) / length);
      if (x < 0 || y < 0 || x >= edges.width || y >= edges.height) continue;
      all++;
      if (edges.data[y * edges.width + x]) on++;
    }
  }
  return all > 0 ? on / all : 0;
};

/**
 * Fits a line through points (total least squares).
 *
 * @param points - At least two points.
 * @returns The line.
 */
const fitLine = (points: readonly Point[]): Line => {
  const x = points.reduce((s, p) => s + p.x, 0) / points.length;
  const y = points.reduce((s, p) => s + p.y, 0) / points.length;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const p of points) {
    sxx += (p.x - x) ** 2;
    sxy += (p.x - x) * (p.y - y);
    syy += (p.y - y) ** 2;
  }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { x, y, dx: Math.cos(angle), dy: Math.sin(angle) };
};

/**
 * Distance from a point to a line.
 *
 * @param p - The point.
 * @param line - The line.
 * @returns Pixels.
 */
const distanceTo = (p: Point, line: Line): number =>
  Math.abs((p.x - line.x) * line.dy - (p.y - line.y) * line.dx);

/**
 * Where two lines meet.
 *
 * @param a - One line.
 * @param b - The other.
 * @returns The point, or null for parallel lines.
 */
const intersect = (a: Line, b: Line): Point | null => {
  const det = a.dx * b.dy - a.dy * b.dx;
  if (Math.abs(det) < 1e-9) return null;
  const t = ((b.x - a.x) * b.dy - (b.y - a.y) * b.dx) / det;
  return { x: a.x + a.dx * t, y: a.y + a.dy * t };
};

/**
 * Moves each side of a quad onto the strongest edge nearby: samples points
 * along the middle 70% of the side, finds the largest gradient within
 * `reach` pixels across it, fits a line through those points (dropping the
 * worst third), and intersects neighbouring lines for the corners. A side
 * whose points don't line up (torn, curled, or not an edge at all) stays
 * where it was.
 *
 * Rounded corners come out where the straight edges meet, the corner a
 * perspective warp needs.
 *
 * @param quad - Corners in order (top-left, top-right, bottom-right, bottom-left).
 * @param strength - From {@link gradientStrength}, of an image `width` wide.
 * @param width - Image width.
 * @param height - Image height.
 * @param reach - How far across a side to search, in pixels.
 * @returns The refined corners, or null when the sides no longer form a quad.
 */
export const refineQuad = (
  quad: readonly Point[],
  strength: Float32Array,
  width: number,
  height: number,
  reach: number,
): Point[] | null => {
  const at = (x: number, y: number): number => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 1 || yi < 1 || xi >= width - 1 || yi >= height - 1) return -1;
    return strength[yi * width + xi];
  };
  const lines: Line[] = [];
  for (let k = 0; k < 4; k++) {
    const a = quad[k];
    const b = quad[(k + 1) % 4];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const ux = (b.x - a.x) / length;
    const uy = (b.y - a.y) / length;
    const side: Line = { x: a.x, y: a.y, dx: ux, dy: uy };
    const points: Point[] = [];
    const step = Math.max(1, length / 60);
    for (let t = length * 0.15; t <= length * 0.85; t += step) {
      let best = -1;
      let offset = 0;
      for (let o = -reach; o <= reach; o += 0.5) {
        const s = at(a.x + ux * t - uy * o, a.y + uy * t + ux * o);
        if (s > best) {
          best = s;
          offset = o;
        }
      }
      if (best > 0) points.push({ x: a.x + ux * t - uy * offset, y: a.y + uy * t + ux * offset });
    }
    if (points.length < 6) {
      lines.push(side);
      continue;
    }
    const first = fitLine(points);
    const kept = [...points]
      .sort((p, q) => distanceTo(p, first) - distanceTo(q, first))
      .slice(0, Math.ceil(points.length * (2 / 3)));
    const line = fitLine(kept);
    const spread = Math.sqrt(kept.reduce((s, p) => s + distanceTo(p, line) ** 2, 0) / kept.length);
    lines.push(spread > reach * 0.35 ? side : line);
  }
  const corners: Point[] = [];
  for (let k = 0; k < 4; k++) {
    const corner = intersect(lines[(k + 3) % 4], lines[k]);
    if (!corner) return null;
    corners.push(corner);
  }
  return corners;
};

/**
 * A candidate and its refinements: moved onto edges searching 4 working
 * pixels across each side, then again searching 1.5, on an image `toDetail`
 * times the working size. Stops at the first refinement that isn't a
 * convex quad.
 *
 * @param quad - Ordered corners, in working pixels.
 * @param strength - From {@link gradientStrength}, of the detail image.
 * @param width - Detail image width.
 * @param height - Detail image height.
 * @param toDetail - Detail size / working size.
 * @returns The candidate first, then each refinement, in working pixels.
 */
export const refinedVersions = (
  quad: readonly Point[],
  strength: Float32Array,
  width: number,
  height: number,
  toDetail: number,
): Point[][] => {
  const versions: Point[][] = [[...quad]];
  for (const reach of [4, 1.5]) {
    const from = versions[versions.length - 1].map((p) => ({
      x: p.x * toDetail,
      y: p.y * toDetail,
    }));
    const refined = refineQuad(from, strength, width, height, reach * toDetail);
    if (!refined || !isConvex(refined)) break;
    versions.push(orderCorners(refined.map((p) => ({ x: p.x / toDetail, y: p.y / toDetail }))));
  }
  return versions;
};
