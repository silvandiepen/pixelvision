import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import type { Keypoint } from "./keypoint.model";
import type { YapeOptions } from "./yape.model";

/**
 * Lists the pixel offsets of a discrete circle of radius `r`, walked once
 * around, then the first two repeated (as EPFL's YAPE does).
 *
 * @param step - Row length of the image.
 * @param r - Radius.
 * @returns The offsets and the number of distinct circle pixels.
 */
const circleOffsets = (step: number, r: number): { dirs: Int32Array; count: number } => {
  const dirs = new Int32Array(1024);
  let i = 0;
  let x = r;
  let y: number;
  const at = (dx: number, dy: number) => {
    dirs[i++] = dx + step * dy;
  };
  for (y = 0; y < x; y++) {
    x = (Math.sqrt(r * r - y * y) + 0.5) | 0;
    at(x, y);
  }
  for (x--; x < y && x >= 0; x--) {
    y = (Math.sqrt(r * r - x * x) + 0.5) | 0;
    at(x, y);
  }
  for (; -x < y; x--) {
    y = (Math.sqrt(r * r - x * x) + 0.5) | 0;
    at(x, y);
  }
  for (y--; y >= 0; y--) {
    x = (-Math.sqrt(r * r - y * y) - 0.5) | 0;
    at(x, y);
  }
  for (; y > x; y--) {
    x = (-Math.sqrt(r * r - y * y) - 0.5) | 0;
    at(x, y);
  }
  for (x++; x <= 0; x++) {
    y = (-Math.sqrt(r * r - x * x) - 0.5) | 0;
    at(x, y);
  }
  for (; x < -y; x++) {
    y = (-Math.sqrt(r * r - x * x) - 0.5) | 0;
    at(x, y);
  }
  for (y++; y < 0; y++) {
    x = (Math.sqrt(r * r - y * y) + 0.5) | 0;
    at(x, y);
  }
  const count = i;
  dirs[i] = dirs[0];
  dirs[i + 1] = dirs[1];
  return { dirs, count };
};

/**
 * Scores one pixel with YAPE's state machine: walks pairs of opposite
 * circle pixels and rejects the pixel (score 0) as soon as the pattern
 * can't be a corner-like blob; otherwise sums the circle and centre.
 * Transcribed from EPFL's implementation.
 *
 * @param I - Image data.
 * @param x - Pixel index.
 * @param dirs - Circle offsets.
 * @param opposite - Half the circle length.
 * @param dirsCount - Circle length.
 * @param Im - Centre minus tau.
 * @param Ip - Centre plus tau.
 * @returns The score, or 0 when rejected.
 */
export const scorePixel = (
  I: ArrayLike<number>,
  x: number,
  dirs: Int32Array,
  opposite: number,
  dirsCount: number,
  Im: number,
  Ip: number,
): number => {
  let score = 0;
  let b = opposite - 1;
  let A = I[x + dirs[0]];
  let B0: number;
  let B1: number;
  let B2 = 0;
  let state: number;
  const next = () => I[x + dirs[++b]];

  if (A <= Ip) {
    if (A >= Im) {
      B0 = I[x + dirs[b]];
      if (B0 <= Ip) {
        if (B0 >= Im) return 0;
        B1 = next();
        if (B1 > Ip) {
          B2 = next();
          if (B2 > Ip) state = 3;
          else if (B2 < Im) state = 6;
          else return 0;
        } else {
          B2 = next();
          if (B2 > Ip) state = 7;
          else if (B2 < Im) state = 2;
          else return 0;
        }
      } else {
        B1 = next();
        if (B1 > Ip) {
          B2 = next();
          if (B2 > Ip) state = 3;
          else if (B2 < Im) state = 6;
          else return 0;
        } else if (B1 < Im) {
          B2 = next();
          if (B2 > Ip) state = 7;
          else if (B2 < Im) state = 2;
          else return 0;
        } else return 0;
      }
    } else {
      B0 = I[x + dirs[b]];
      if (B0 > Ip) return 0;
      B1 = next();
      if (B1 > Ip) return 0;
      B2 = next();
      if (B2 > Ip) return 0;
      state = 1;
    }
  } else {
    B0 = I[x + dirs[b]];
    if (B0 < Im) return 0;
    B1 = next();
    if (B1 < Im) return 0;
    B2 = next();
    if (B2 < Im) return 0;
    state = 0;
  }

  const advance = () => {
    B1 = B2;
    B2 = next();
  };
  for (let a = 1; a <= opposite; a++) {
    A = I[x + dirs[a]];
    switch (state) {
      case 0:
        if (A > Ip) {
          advance();
          if (B2 < Im) return 0;
          score -= A + B1;
          state = 0;
          break;
        }
        if (A < Im) {
          if (B1 > Ip || B2 > Ip) return 0;
          advance();
          if (B2 > Ip) return 0;
          score -= A + B1;
          state = 8;
          break;
        }
        if (B1 <= Ip || B2 <= Ip) return 0;
        advance();
        if (B2 > Ip) {
          score -= A + B1;
          state = 3;
          break;
        }
        if (B2 < Im) {
          score -= A + B1;
          state = 6;
          break;
        }
        return 0;
      case 1:
        if (A < Im) {
          advance();
          if (B2 > Ip) return 0;
          score -= A + B1;
          state = 1;
          break;
        }
        if (A > Ip) {
          if (B1 < Im || B2 < Im) return 0;
          advance();
          if (B2 < Im) return 0;
          score -= A + B1;
          state = 9;
          break;
        }
        if (B1 >= Im || B2 >= Im) return 0;
        advance();
        if (B2 < Im) {
          score -= A + B1;
          state = 2;
          break;
        }
        if (B2 > Ip) {
          score -= A + B1;
          state = 7;
          break;
        }
        return 0;
      case 2:
        if (A > Ip) return 0;
        advance();
        if (A < Im) {
          if (B2 > Ip) return 0;
          score -= A + B1;
          state = 4;
          break;
        }
        if (B2 > Ip) {
          score -= A + B1;
          state = 7;
          break;
        }
        if (B2 < Im) {
          score -= A + B1;
          state = 2;
          break;
        }
        return 0;
      case 3:
        if (A < Im) return 0;
        advance();
        if (A > Ip) {
          if (B2 < Im) return 0;
          score -= A + B1;
          state = 5;
          break;
        }
        if (B2 > Ip) {
          score -= A + B1;
          state = 3;
          break;
        }
        if (B2 < Im) {
          score -= A + B1;
          state = 6;
          break;
        }
        return 0;
      case 4:
        if (A > Ip) return 0;
        if (A < Im) {
          advance();
          if (B2 > Ip) return 0;
          score -= A + B1;
          state = 1;
          break;
        }
        if (B2 >= Im) return 0;
        advance();
        if (B2 < Im) {
          score -= A + B1;
          state = 2;
          break;
        }
        if (B2 > Ip) {
          score -= A + B1;
          state = 7;
          break;
        }
        return 0;
      case 5:
        if (A < Im) return 0;
        if (A > Ip) {
          advance();
          if (B2 < Im) return 0;
          score -= A + B1;
          state = 0;
          break;
        }
        if (B2 <= Ip) return 0;
        advance();
        if (B2 > Ip) {
          score -= A + B1;
          state = 3;
          break;
        }
        if (B2 < Im) {
          score -= A + B1;
          state = 6;
          break;
        }
        return 0;
      case 6:
        if (A > Ip || A < Im) return 0;
        advance();
        if (B2 < Im) {
          score -= A + B1;
          state = 2;
          break;
        }
        if (B2 > Ip) {
          score -= A + B1;
          state = 7;
          break;
        }
        return 0;
      case 7:
        if (A > Ip || A < Im) return 0;
        advance();
        if (B2 > Ip) {
          score -= A + B1;
          state = 3;
          break;
        }
        if (B2 < Im) {
          score -= A + B1;
          state = 6;
          break;
        }
        return 0;
      case 8:
        if (A > Ip) {
          if (B2 < Im) return 0;
          advance();
          if (B2 < Im) return 0;
          score -= A + B1;
          state = 9;
          break;
        }
        if (A < Im) {
          advance();
          if (B2 > Ip) return 0;
          score -= A + B1;
          state = 1;
          break;
        }
        return 0;
      case 9:
        if (A < Im) {
          if (B2 > Ip) return 0;
          advance();
          if (B2 > Ip) return 0;
          score -= A + B1;
          state = 8;
          break;
        }
        if (A > Ip) {
          advance();
          if (B2 < Im) return 0;
          score -= A + B1;
          state = 0;
          break;
        }
        return 0;
    }
  }
  return score + dirsCount * I[x];
};

/**
 * Computes YAPE scores for every pixel inside the border (0 outside, and
 * for rejected pixels).
 *
 * @param image - Single-channel `u8` matrix.
 * @param radius - Circle radius, already clamped to 3–7.
 * @param tau - Brightness tolerance.
 * @param border - Pixels to skip at each edge.
 * @returns The score map and the scanned region.
 */
export const yapeScores = (image: Matrix<"u8">, radius: number, tau: number, border: number) => {
  const { width: w, height: h, data: img } = image;
  const { dirs, count } = circleOffsets(w, radius);
  const opposite = count >> 1;
  const region = {
    sx: Math.max(radius + 1, border),
    sy: Math.max(radius + 1, border),
    ex: Math.min(w - radius - 2, w - border),
    ey: Math.min(h - radius - 2, h - border),
  };
  const scores = new Int32Array(w * h);
  for (let y = region.sy; y < region.ey; y++) {
    for (let x = region.sx, p = y * w + region.sx; x < region.ex; x++, p++) {
      const ip = img[p] + tau;
      const im = img[p] - tau;
      const flat =
        im < img[p + radius] &&
        img[p + radius] < ip &&
        im < img[p - radius] &&
        img[p - radius] < ip;
      scores[p] = flat ? 0 : scorePixel(img, p, dirs, opposite, count, im, ip);
    }
  }
  return { scores, ...region };
};

/**
 * Finds keypoints with YAPE (Yet Another Point Extractor, EPFL): pixels
 * whose surrounding circle of radius `radius` passes a fast state machine
 * test, scored by a Laplacian-like circle sum and kept when they are local
 * maxima within `radius`. Stable under rotation and moderate scale change.
 *
 * Every pixel is tested, so corners are found on both sides of a shape;
 * the local-maximum test compares each pixel with its true neighbours;
 * scores start clean on every call, so earlier frames never leak in; and
 * no `init` call or shared state is needed.
 *
 * @param image - Single-channel `u8` matrix (gray), ideally blurred.
 * @param options - Radius, tau and border.
 * @returns Keypoints in row order, scored by the absolute response.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const points = detectYape(gaussianBlur(gray, { kernelSize: 5 }), { radius: 5 });
 */
export function detectYape(image: Matrix<"u8">, options: YapeOptions = {}): Keypoint[] {
  assertType("detectYape", image, "u8");
  assertChannels("detectYape", image, 1);
  const radius = Math.min(Math.max(options.radius ?? 5, 3), 7);
  const w = image.width;
  const { scores, sx, sy, ex, ey } = yapeScores(
    image,
    radius,
    options.tau ?? 7,
    options.border ?? 4,
  );

  const isLocalExtremum = (p: number, v: number) => {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const n = scores[p + dy * w + dx];
        if (v > 0 ? n > v : n < v) return false;
      }
    }
    return true;
  };
  const nonZeroNeighbours = (p: number) =>
    [p + 1, p - 1, p + w, p + w + 1, p + w - 1, p - w, p - w + 1, p - w - 1].filter(
      (n) => scores[n] !== 0,
    ).length;

  const points: Keypoint[] = [];
  for (let y = sy; y < ey; y++) {
    for (let x = sx, p = y * w + sx; x < ex; x++, p++) {
      const score = scores[p];
      const magnitude = Math.abs(score);
      if (magnitude >= 5 && nonZeroNeighbours(p) >= 3 && isLocalExtremum(p, score)) {
        points.push({ x, y, score: magnitude });
        x += radius - 1;
        p += radius - 1;
      }
    }
  }
  return points;
}
