import { assertChannels } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import { createRng } from "../core/rng";
import { roundHalfEven } from "../core/round";
import type { HoughLinesPOptions, LineSegment } from "./houghLinesP.model";

const f = Math.fround;
// Fixed-point fraction bits used to step along a line.
const SHIFT = 16;

/**
 * Number of angles in `[0, π)` at a given step, leaving out a last angle
 * that would repeat the first.
 *
 * @param step - Angle step in radians.
 * @returns The number of angles.
 */
const angleCount = (step: number): number => {
  let count = Math.floor(Math.PI / step) + 1;
  if (count > 1 && Math.abs(Math.PI - (count - 1) * step) < step / 2) count--;
  return count;
};

/**
 * Finds straight line segments in an edge image with the progressive
 * probabilistic Hough transform. Edge pixels vote one at a time, in random
 * order; as soon as a line collects `threshold` votes, the segment through
 * the voting pixel is traced along the edge, bridging gaps of up to
 * `maxLineGap` pixels, and its pixels are removed so they can't vote again.
 * Far fewer pixels vote than in {@link houghLines}, and the result is end
 * points instead of infinite lines.
 *
 * The order comes from a seeded generator, so results are deterministic
 * per seed: the same image, options and seed always give the same
 * segments, in the same order. A different seed can split or end segments
 * differently where edges are ambiguous. The generator and its default
 * seed are OpenCV's, so with the default seed the segments are identical to
 * OpenCV's `HoughLinesP`.
 *
 * When a segment is kept, every pixel along it is subtracted from the
 * accumulator, including pixels that hadn't voted yet. That leaves the
 * accumulator low around a line already found, which keeps the pixels
 * just beside it from producing a near-duplicate segment.
 *
 * @param edges - Single-channel matrix where non-zero pixels are edges, e.g. from {@link canny}.
 * @param options - Resolutions, vote threshold, segment length and gap, limit and seed.
 * @returns Segments in the order they were found.
 * @throws {RangeError} When the image has more than one channel, a step isn't positive, or the seed is invalid.
 *
 * @example
 * const segments = houghLinesP(canny(gray, { low: 50, high: 150 }), {
 *   threshold: 40,
 *   minLineLength: 30,
 *   maxLineGap: 5,
 * });
 * for (const { from, to } of segments) console.log(from, to);
 */
export function houghLinesP(edges: Matrix, options: HoughLinesPOptions = {}): LineSegment[] {
  assertChannels("houghLinesP", edges, 1);
  // OpenCV takes both steps in single precision.
  const rho = f(options.rhoStep ?? 1);
  const theta = f(options.thetaStep ?? Math.PI / 180);
  if (!(rho > 0) || !(theta > 0)) {
    throw new RangeError("houghLinesP: rhoStep and thetaStep must be positive");
  }
  const threshold = options.threshold ?? 50;
  const minLineLength = options.minLineLength ?? 0;
  const maxLineGap = options.maxLineGap ?? 0;
  const maxLines = options.maxLines ?? Infinity;
  const rng = createRng(options.seed);
  const { width, height, data } = edges;
  const inverseRho = f(1 / rho);
  const numAngle = angleCount(theta);
  const numRho = roundHalfEven(f(((width + height) * 2 + 1) / rho));
  const rhoOffset = (numRho - 1) >> 1;
  const accumulator = new Int32Array(numAngle * numRho);
  const cos = new Float32Array(numAngle);
  const sin = new Float32Array(numAngle);
  for (let n = 0; n < numAngle; n++) {
    cos[n] = Math.cos(n * theta) * inverseRho;
    sin[n] = Math.sin(n * theta) * inverseRho;
  }

  /**
   * Adds (or with `-1` subtracts) the votes of one pixel.
   *
   * @param x - Column.
   * @param y - Row.
   * @param delta - `1` to vote, `-1` to subtract.
   * @returns The best line `[votes, angle index]` after voting.
   */
  const vote = (x: number, y: number, delta: number): [number, number] => {
    let best = threshold - 1;
    let bestAngle = 0;
    for (let n = 0, row = 0; n < numAngle; n++, row += numRho) {
      const r = roundHalfEven(f(f(x * cos[n]) + f(y * sin[n]))) + rhoOffset;
      const votes = (accumulator[row + r] += delta);
      if (best < votes) {
        best = votes;
        bestAngle = n;
      }
    }
    return [best, bestAngle];
  };

  // Stage 1: collect the edge pixels; `remaining` marks those not yet used.
  const remaining = new Uint8Array(width * height);
  const pending: number[] = [];
  for (let i = 0; i < width * height; i++) {
    if (data[i] !== 0) {
      remaining[i] = 1;
      pending.push(i);
    }
  }

  // Stage 2: let them vote in random order.
  const segments: LineSegment[] = [];
  const ends = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  for (let count = pending.length; count > 0; count--) {
    const pick = rng.uniform(count);
    const index = pending[pick];
    pending[pick] = pending[count - 1];
    // Already removed as part of an earlier segment.
    if (remaining[index] === 0) continue;

    const x0 = index % width;
    const y0 = (index - x0) / width;
    const [votes, angle] = vote(x0, y0, 1);
    if (votes < threshold) continue;

    // Walk along the line found, in both directions, in fixed point.
    const a = -sin[angle];
    const b = cos[angle];
    const xMajor = Math.abs(a) > Math.abs(b);
    let startX: number;
    let startY: number;
    let stepX: number;
    let stepY: number;
    if (xMajor) {
      // a = −sin θ, negative here since θ is in (0, π).
      stepX = -1;
      stepY = roundHalfEven(f(f(b * (1 << SHIFT)) / Math.abs(a)));
      startX = x0;
      startY = (y0 << SHIFT) + (1 << (SHIFT - 1));
    } else {
      stepY = b > 0 ? 1 : -1;
      stepX = roundHalfEven(f(f(a * (1 << SHIFT)) / Math.abs(b)));
      startX = (x0 << SHIFT) + (1 << (SHIFT - 1));
      startY = y0;
    }

    for (let k = 0; k < 2; k++) {
      const dx = k === 0 ? stepX : -stepX;
      const dy = k === 0 ? stepY : -stepY;
      let gap = 0;
      for (let x = startX, y = startY; ; x += dx, y += dy) {
        const px = xMajor ? x : x >> SHIFT;
        const py = xMajor ? y >> SHIFT : y;
        if (px < 0 || px >= width || py < 0 || py >= height) break;
        if (remaining[py * width + px] !== 0) {
          gap = 0;
          ends[k].x = px;
          ends[k].y = py;
        } else if (++gap > maxLineGap) {
          break;
        }
      }
    }

    // Remove the segment's pixels; a kept segment also subtracts their votes.
    const long =
      Math.abs(ends[1].x - ends[0].x) >= minLineLength ||
      Math.abs(ends[1].y - ends[0].y) >= minLineLength;
    for (let k = 0; k < 2; k++) {
      const dx = k === 0 ? stepX : -stepX;
      const dy = k === 0 ? stepY : -stepY;
      for (let x = startX, y = startY; ; x += dx, y += dy) {
        const px = xMajor ? x : x >> SHIFT;
        const py = xMajor ? y >> SHIFT : y;
        const at = py * width + px;
        if (remaining[at] !== 0) {
          if (long) vote(px, py, -1);
          remaining[at] = 0;
        }
        if (px === ends[k].x && py === ends[k].y) break;
      }
    }

    if (long) {
      segments.push({ from: { ...ends[0] }, to: { ...ends[1] } });
      if (segments.length >= maxLines) break;
    }
  }
  return segments;
}
