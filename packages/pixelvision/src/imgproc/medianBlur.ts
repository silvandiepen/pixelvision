import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { forEachChannel } from "./planes";

/**
 * Replaces every pixel by the median of its square neighbourhood, as
 * OpenCV's `medianBlur`: removes salt-and-pepper noise while keeping edges
 * sharp. Borders repeat the edge pixel.
 *
 * @param image - `u8` matrix with 1, 3 or 4 channels (each blurred separately).
 * @param size - Odd window size, 3 or more (default 3).
 * @param out - Optional output matrix.
 * @returns The filtered matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the size isn't odd and at least 3, or the channel count isn't 1, 3 or 4.
 *
 * @example
 * const clean = medianBlur(noisyScan, 5);
 */
export function medianBlur(image: Matrix<"u8">, size = 3, out?: Matrix<"u8">): Matrix<"u8"> {
  assertType("medianBlur", image, "u8");
  assertChannels("medianBlur", image, 1, 3, 4);
  if (!Number.isInteger(size) || size < 3 || size % 2 === 0) {
    throw new RangeError(`medianBlur: size must be an odd integer >= 3, got ${size}`);
  }
  const { width: w, height: h, channels } = image;
  const result = prepareOutput(out, "u8", w, h, channels);
  forEachChannel(image, result, (src, dst) => {
    if (size === 3) median3(src, dst, w, h);
    else slidingMedian(src, dst, w, h, size >> 1);
  });
  return result;
}

/**
 * 3×3 median through a fixed min/max network (Paeth's 19 exchanges), the
 * case nearly every caller uses.
 *
 * @param src - Source plane.
 * @param dst - Destination plane.
 * @param w - Plane width.
 * @param h - Plane height.
 */
function median3(src: ArrayLike<number>, dst: Uint8Array, w: number, h: number): void {
  const p = new Int32Array(9);
  for (let y = 0; y < h; y++) {
    const above = (y > 0 ? y - 1 : 0) * w;
    const row = y * w;
    const below = (y < h - 1 ? y + 1 : y) * w;
    for (let x = 0; x < w; x++) {
      const left = x > 0 ? x - 1 : 0;
      const right = x < w - 1 ? x + 1 : x;
      p[0] = src[above + left];
      p[1] = src[above + x];
      p[2] = src[above + right];
      p[3] = src[row + left];
      p[4] = src[row + x];
      p[5] = src[row + right];
      p[6] = src[below + left];
      p[7] = src[below + x];
      p[8] = src[below + right];
      sort2(p, 1, 2);
      sort2(p, 4, 5);
      sort2(p, 7, 8);
      sort2(p, 0, 1);
      sort2(p, 3, 4);
      sort2(p, 6, 7);
      sort2(p, 1, 2);
      sort2(p, 4, 5);
      sort2(p, 7, 8);
      sort2(p, 0, 3);
      sort2(p, 5, 8);
      sort2(p, 4, 7);
      sort2(p, 3, 6);
      sort2(p, 1, 4);
      sort2(p, 2, 5);
      sort2(p, 4, 7);
      sort2(p, 4, 2);
      sort2(p, 6, 4);
      sort2(p, 4, 2);
      dst[row + x] = p[4];
    }
  }
}

/**
 * Orders two entries of the network so the smaller comes first.
 *
 * @param p - Network values.
 * @param a - Index that receives the minimum.
 * @param b - Index that receives the maximum.
 */
function sort2(p: Int32Array, a: number, b: number): void {
  const lo = p[a];
  const hi = p[b];
  if (lo > hi) {
    p[a] = hi;
    p[b] = lo;
  }
}

/**
 * Median for larger windows with a histogram that slides along each row
 * (Huang's method): one column enters and one leaves per step, and the median
 * moves from its previous position instead of being searched from zero.
 *
 * @param src - Source plane.
 * @param dst - Destination plane.
 * @param w - Plane width.
 * @param h - Plane height.
 * @param r - Window radius.
 */
function slidingMedian(
  src: ArrayLike<number>,
  dst: Uint8Array,
  w: number,
  h: number,
  r: number,
): void {
  const histogram = new Int32Array(256);
  const rows = new Int32Array(2 * r + 1);
  const half = ((2 * r + 1) * (2 * r + 1)) >> 1;
  const column = (x: number) => (x < 0 ? 0 : x >= w ? w - 1 : x);
  for (let y = 0; y < h; y++) {
    for (let dy = -r; dy <= r; dy++) {
      const yy = y + dy;
      rows[dy + r] = (yy < 0 ? 0 : yy >= h ? h - 1 : yy) * w;
    }
    histogram.fill(0);
    for (let dx = -r; dx <= r; dx++) {
      const c = column(dx);
      for (let i = 0; i < rows.length; i++) histogram[src[rows[i] + c]]++;
    }
    // `below` counts the window values strictly under `median`.
    let median = 0;
    let below = 0;
    while (below + histogram[median] <= half) below += histogram[median++];
    dst[y * w] = median;
    for (let x = 1; x < w; x++) {
      const leaving = column(x - r - 1);
      const entering = column(x + r);
      for (let i = 0; i < rows.length; i++) {
        const out = src[rows[i] + leaving];
        const into = src[rows[i] + entering];
        histogram[out]--;
        histogram[into]++;
        if (out < median) below--;
        if (into < median) below++;
      }
      while (below > half) below -= histogram[--median];
      while (below + histogram[median] <= half) below += histogram[median++];
      dst[y * w + x] = median;
    }
  }
}
