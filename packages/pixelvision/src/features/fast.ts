import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import type { FastOptions } from "./fast.model";
import type { Keypoint } from "./keypoint.model";

// The 16-pixel Bresenham circle of radius 3, as (dx, dy) pairs, clockwise from the top.
const CIRCLE = [
  0, 3, 1, 3, 2, 2, 3, 1, 3, 0, 3, -1, 2, -2, 1, -3, 0, -3, -1, -3, -2, -2, -3, -1, -3, 0, -3, 1,
  -2, 2, -1, 3,
];
const ARC = 9;

/**
 * Scores a corner: the largest threshold at which it would still be one
 * (Rosten's `cornerScore` for the 16-pixel circle).
 *
 * @param d - Centre minus each circle pixel, 25 values (the circle plus the first 9 again).
 * @param threshold - Detection threshold.
 * @returns The score.
 */
const cornerScore = (d: Int32Array, threshold: number): number => {
  let a0 = threshold;
  for (let k = 0; k < 16; k += 2) {
    let a = Math.min(d[k + 1], d[k + 2], d[k + 3]);
    if (a <= a0) continue;
    a = Math.min(a, d[k + 4], d[k + 5], d[k + 6], d[k + 7], d[k + 8]);
    a0 = Math.max(a0, Math.min(a, d[k]));
    a0 = Math.max(a0, Math.min(a, d[k + 9]));
  }
  let b0 = -a0;
  for (let k = 0; k < 16; k += 2) {
    let b = Math.max(d[k + 1], d[k + 2], d[k + 3], d[k + 4], d[k + 5]);
    if (b >= b0) continue;
    b = Math.max(b, d[k + 6], d[k + 7], d[k + 8]);
    b0 = Math.min(b0, Math.max(b, d[k]));
    b0 = Math.min(b0, Math.max(b, d[k + 9]));
  }
  return -b0 - 1;
};

/**
 * Finds corners with the FAST-9 detector (Rosten & Drummond): a pixel is a
 * corner when 9 contiguous pixels on the surrounding 16-pixel circle are
 * all brighter, or all darker, than it by more than `threshold`. Corners
 * are then thinned to strict 3x3 maxima of their score.
 *
 * Very fast; good for tracking and as input to {@link describeOrb}. Unlike
 * jsfeat, the last corner of each row is kept (jsfeat's candidate list was
 * off by one) and the bottom row next to the border is searched.
 *
 * @param image - Single-channel `u8` matrix (gray).
 * @param options - Threshold and border.
 * @returns Corners in row order, each with its score.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const corners = detectFast(gray, { threshold: 25 });
 */
export function detectFast(image: Matrix<"u8">, options: FastOptions = {}): Keypoint[] {
  assertType("detectFast", image, "u8");
  assertChannels("detectFast", image, 1);
  const threshold = Math.min(Math.max(options.threshold ?? 20, 0), 255);
  const border = Math.max(3, options.border ?? 3);
  const { width: w, height: h, data: img } = image;
  const offsets = new Int32Array(25);
  for (let k = 0; k < 16; k++) offsets[k] = CIRCLE[k * 2] + CIRCLE[k * 2 + 1] * w;
  for (let k = 16; k < 25; k++) offsets[k] = offsets[k - 16];

  const scores = new Uint8Array(w * h);
  const differences = new Int32Array(25);
  const candidates: number[] = [];
  for (let y = border; y < h - border; y++) {
    for (let x = border, p = y * w + border; x < w - border; x++, p++) {
      const v = img[p];
      for (const sign of [-1, 1]) {
        // sign -1: circle darker than centre; +1: brighter.
        let run = 0;
        for (let k = 0; k < 25; k++) {
          const difference = img[p + offsets[k]] - v;
          if (sign * difference > threshold) {
            if (++run >= ARC) break;
          } else {
            run = 0;
          }
        }
        if (run < ARC) continue;
        for (let k = 0; k < 25; k++) differences[k] = v - img[p + offsets[k]];
        scores[p] = cornerScore(differences, threshold);
        candidates.push(p);
        break;
      }
    }
  }

  const corners: Keypoint[] = [];
  for (const p of candidates) {
    const s = scores[p];
    if (
      s > scores[p - w - 1] &&
      s > scores[p - w] &&
      s > scores[p - w + 1] &&
      s > scores[p - 1] &&
      s > scores[p + 1] &&
      s > scores[p + w - 1] &&
      s > scores[p + w] &&
      s > scores[p + w + 1]
    ) {
      corners.push({ x: p % w, y: (p / w) | 0, score: s });
    }
  }
  return corners;
}
