import { assertChannels, assertInteger, assertType } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { roundHalfEven } from "../core/round";
import { cannyFromGradients } from "./canny";
import type { Circle, HoughCirclesOptions } from "./houghCircles.model";

const f = Math.fround;
// Fixed-point fraction bits used to step along a gradient.
const SHIFT = 10;
// Radius histogram bins per accumulator cell.
const BINS_PER_CELL = 10;

/**
 * 3x3 Sobel gradients, repeating the edge pixel at the border.
 *
 * @param image - Single-channel `u8` matrix.
 * @returns Interleaved `[gx, gy]` per pixel.
 */
const sobelReplicate = (image: Matrix<"u8">): Int32Array => {
  const { width, height, data } = image;
  const out = new Int32Array(width * height * 2);
  for (let y = 0; y < height; y++) {
    const up = Math.max(y - 1, 0) * width;
    const row = y * width;
    const down = Math.min(y + 1, height - 1) * width;
    for (let x = 0; x < width; x++) {
      const l = Math.max(x - 1, 0);
      const r = Math.min(x + 1, width - 1);
      out[(row + x) * 2] =
        data[up + r] -
        data[up + l] +
        2 * (data[row + r] - data[row + l]) +
        data[down + r] -
        data[down + l];
      out[(row + x) * 2 + 1] =
        data[down + l] -
        data[up + l] +
        2 * (data[down + x] - data[up + x]) +
        data[down + r] -
        data[up + r];
    }
  }
  return out;
};

/**
 * Finds circles in a gray image with the Hough gradient method, as
 * OpenCV's `HoughCircles` with `HOUGH_GRADIENT`.
 *
 * It finds edges with Canny, then every edge pixel votes for the centres
 * that lie along its gradient, between `minRadius` and `maxRadius` away in
 * both directions. Accumulator cells that are local maxima with more than
 * `accumulatorThreshold` votes are candidate centres. For each, the edge
 * pixels around it are binned by distance, and the radius with the most
 * support per unit of radius wins; centres with more than
 * `accumulatorThreshold` supporting pixels become circles. Circles are
 * sorted strongest first, and any whose centre lies closer than `minDist`
 * to a stronger one is dropped.
 *
 * Blur the image first (e.g. {@link gaussianBlur}) so noise doesn't add
 * edges. Centres and radii are single-precision values, as OpenCV's are.
 *
 * Candidate centres are identical to OpenCV's. The radius differs in two
 * places where OpenCV is off by one: it leaves out the distance bin just
 * below each window it scores, and it reports a window's radius half a bin
 * (`0.05 · dp`) below the window's middle. pixelvision counts every bin and
 * reports the middle, which makes radii slightly more accurate; a circle
 * whose support is right at `accumulatorThreshold` can be kept by one and
 * not the other.
 *
 * @param image - Single-channel `u8` matrix (gray).
 * @param options - Accumulator resolution, centre spacing, thresholds and radius range.
 * @returns Circles, strongest first.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel, `dp`, `minDist`, `cannyThreshold` or `accumulatorThreshold` isn't positive, or a radius isn't a whole number of 0 or more.
 *
 * @example
 * const circles = houghCircles(gaussianBlur(gray, { kernelSize: 5 }), {
 *   minDist: 20,
 *   cannyThreshold: 100,
 *   accumulatorThreshold: 30,
 *   minRadius: 10,
 *   maxRadius: 60,
 * });
 * for (const { x, y, radius } of circles) console.log(x, y, radius);
 */
export function houghCircles(image: Matrix<"u8">, options: HoughCirclesOptions = {}): Circle[] {
  assertType("houghCircles", image, "u8");
  assertChannels("houghCircles", image, 1);
  const { width, height } = image;
  const {
    dp: dpOption = 1,
    minDist: minDistOption = height / 8,
    cannyThreshold = 100,
    accumulatorThreshold = 100,
    minRadius = 0,
    maxRadius: maxRadiusOption = 0,
    maxCircles = Infinity,
  } = options;
  if (!(dpOption > 0 && minDistOption > 0 && cannyThreshold > 0 && accumulatorThreshold > 0)) {
    throw new RangeError(
      "houghCircles: dp, minDist, cannyThreshold and accumulatorThreshold must be positive",
    );
  }
  assertInteger("houghCircles", "minRadius", minRadius, 0);
  assertInteger("houghCircles", "maxRadius", maxRadiusOption, 0);
  const maxRadius =
    maxRadiusOption === 0
      ? Math.max(width, height)
      : maxRadiusOption <= minRadius
        ? minRadius + 2
        : maxRadiusOption;
  const dp = Math.max(f(dpOption), 1);
  const inverseDp = f(1 / dp);
  const minDist = f(minDistOption);
  const cannyHigh = roundHalfEven(cannyThreshold);
  const accThreshold = roundHalfEven(accumulatorThreshold);
  const cannyLow = Math.max(1, Math.floor(cannyHigh / 2));

  // Edges, and the gradients they were found with.
  const gradients = sobelReplicate(image);
  const edges = createMatrix(width, height);
  cannyFromGradients(
    gradients,
    width,
    height,
    Math.min(cannyLow, cannyHigh),
    Math.max(cannyLow, cannyHigh),
    edges,
  );

  // Every edge pixel votes along its gradient, both ways.
  const columns = Math.ceil(f(width * inverseDp));
  const rows = Math.ceil(f(height * inverseDp));
  const stride = columns + 2;
  const accumulator = new Int32Array((rows + 2) * stride);
  const isEdge = new Uint8Array(width * height);
  let edgeCount = 0;
  for (let y = 0, i = 0; y < height; y++) {
    for (let x = 0; x < width; x++, i++) {
      const vx = gradients[i * 2];
      const vy = gradients[i * 2 + 1];
      // Canny only marks pixels whose gradient is non-zero.
      if (edges.data[i] === 0) continue;
      isEdge[i] = 1;
      edgeCount++;
      const magnitude = f(Math.sqrt(vx * vx + vy * vy));
      let sx = roundHalfEven(f(f(f(vx * inverseDp) * 1024) / magnitude));
      let sy = roundHalfEven(f(f(f(vy * inverseDp) * 1024) / magnitude));
      const x0 = roundHalfEven(f(f(x * inverseDp) * 1024));
      const y0 = roundHalfEven(f(f(y * inverseDp) * 1024));
      for (let direction = 0; direction < 2; direction++) {
        for (
          let r = minRadius, x1 = x0 + minRadius * sx, y1 = y0 + minRadius * sy;
          r <= maxRadius;
          x1 += sx, y1 += sy, r++
        ) {
          const x2 = x1 >> SHIFT;
          const y2 = y1 >> SHIFT;
          if (x2 < 0 || x2 >= columns || y2 < 0 || y2 >= rows) break;
          accumulator[y2 * stride + x2]++;
        }
        sx = -sx;
        sy = -sy;
      }
    }
  }
  if (edgeCount === 0) return [];

  // Candidate centres: local maxima above the threshold, most votes first.
  const centres: number[] = [];
  for (let y = 1; y <= rows; y++) {
    for (let x = 1, base = y * stride + 1; x <= columns; x++, base++) {
      const votes = accumulator[base];
      if (
        votes > accThreshold &&
        votes > accumulator[base - 1] &&
        votes >= accumulator[base + 1] &&
        votes > accumulator[base - stride] &&
        votes >= accumulator[base + stride]
      ) {
        centres.push(base);
      }
    }
  }
  centres.sort((a, b) => accumulator[b] - accumulator[a] || a - b);

  // The best-supported radius of each centre.
  const minRadius2 = f(minRadius * minRadius);
  const maxRadius2 = f(maxRadius * maxRadius);
  const binCount = Math.max(1, roundHalfEven(f(f((maxRadius - minRadius) / dp) * BINS_PER_CELL)));
  const bins = new Int32Array(binCount);
  const reach = maxRadius + 1;
  const found: Circle[] = [];
  for (const centre of centres) {
    const cy = Math.floor(centre / stride);
    const cx = centre - cy * stride;
    const x = f(f(cx + 0.5) * dp);
    const y = f(f(cy + 0.5) * dp);
    bins.fill(0);
    const left = Math.max(Math.trunc(x - reach), 0);
    const right = Math.min(Math.trunc(x + reach), width);
    const top = Math.max(Math.trunc(y - reach), 0);
    const bottom = Math.min(Math.trunc(y + reach), height);
    for (let py = top; py < bottom; py++) {
      const dy = f(y - py);
      const dy2 = f(dy * dy);
      for (let px = left; px < right; px++) {
        if (isEdge[py * width + px] === 0) continue;
        const dx = f(x - px);
        const r2 = f(f(dx * dx) + dy2);
        if (minRadius2 <= r2 && r2 <= maxRadius2) {
          const distance = f(Math.sqrt(r2));
          const bin = roundHalfEven(f(f(f(distance - minRadius) / dp) * BINS_PER_CELL));
          bins[Math.max(0, Math.min(binCount - 1, bin))]++;
        }
      }
    }

    // Score windows of one accumulator cell (BINS_PER_CELL bins), each
    // starting at a non-empty bin, from the largest distance down; the
    // densest support per unit of radius wins.
    let best = 0;
    let bestRadius = 0;
    let j = binCount - 1;
    while (j > 0) {
      if (bins[j] === 0) {
        j--;
        continue;
      }
      const top = j;
      let count = 0;
      for (; j > top - BINS_PER_CELL && j >= 0; j--) count += bins[j];
      // The window holds bins j + 1 to top; j may start the next one.
      const radius = f(f(f(f((top + j + 1) / 2) / BINS_PER_CELL) * dp) + minRadius);
      // Compares count / radius with best / bestRadius without dividing;
      // radius is at least 0.05 · dp, so the first window always wins.
      if (f(count * bestRadius) >= f(best * radius)) {
        bestRadius = radius;
        best = count;
      }
    }
    if (best > accThreshold) found.push({ x, y, radius: bestRadius, votes: best });
  }

  // Strongest first, then drop circles too close to a stronger one.
  found.sort((a, b) => b.votes - a.votes || b.radius - a.radius || a.x - b.x || a.y - b.y);
  const minDist2 = f(minDist * minDist);
  const circles: Circle[] = [];
  for (const circle of found) {
    if (circles.length >= maxCircles) break;
    const isolated = circles.every((kept) => {
      const dx = f(circle.x - kept.x);
      const dy = f(circle.y - kept.y);
      return f(f(dx * dx) + f(dy * dy)) >= minDist2;
    });
    if (isolated) circles.push(circle);
  }
  return circles;
}
