import { assertChannels, assertType } from "../core/assert";
import { createMatrix, prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { saturateU8 } from "../core/round";
import type { Point } from "../math/transforms.model";
import type { ChannelValues, FloodFillOptions, FloodFillResult } from "./floodFill.model";

/**
 * Expands a single value or a per-channel list to one value per channel.
 *
 * @param name - Option name, for the error message.
 * @param value - The value or values.
 * @param channels - Channel count.
 * @returns One number per channel.
 * @throws {RangeError} When a list has the wrong length or a value isn't finite.
 */
function perChannel(name: string, value: ChannelValues, channels: number): number[] {
  const values = typeof value === "number" ? Array<number>(channels).fill(value) : [...value];
  if (values.length !== channels || !values.every(Number.isFinite)) {
    throw new RangeError(`floodFill: ${name} needs ${channels} finite value(s)`);
  }
  return values;
}

/**
 * Fills the connected region around a seed pixel with a new value, as
 * OpenCV's `floodFill`: the paint bucket. A neighbour joins when each
 * channel lies within `loDiff` below and `upDiff` above the pixel it is
 * reached from, or above and below the seed with `fixedRange`.
 *
 * This is OpenCV's scan-line algorithm, so the filled region, its area and
 * its bounding box match OpenCV exactly.
 *
 * @param image - `u8` matrix with 1 or 3 channels.
 * @param seed - Starting pixel.
 * @param value - New value: one per channel, or one for all.
 * @param options - Tolerances, `connectivity`, `fixedRange`, `maskOnly`, `mask`, `maskValue` and `out`.
 * @returns The filled image, the mask, the number of filled pixels and their bounding box.
 * @throws {TypeError} When the image or mask isn't `u8`.
 * @throws {RangeError} When the image doesn't have 1 or 3 channels, the seed lies outside it, a tolerance is negative, the connectivity isn't 4 or 8, the mask value isn't 1–255, or the mask doesn't match the image.
 *
 * @example
 * // Paint the region round (40, 30) red, joining colours within 20 levels.
 * const { image: painted, area } = floodFill(rgb, { x: 40, y: 30 }, [255, 0, 0], {
 *   loDiff: 20,
 *   upDiff: 20,
 * });
 */
export function floodFill(
  image: Matrix<"u8">,
  seed: Point,
  value: ChannelValues,
  options: FloodFillOptions = {},
): FloodFillResult {
  assertType("floodFill", image, "u8");
  assertChannels("floodFill", image, 1, 3);
  const { width: w, height: h, channels: cn } = image;
  const {
    connectivity = 4,
    fixedRange = false,
    maskOnly = false,
    maskValue = 255,
    loDiff = 0,
    upDiff = 0,
  } = options;
  if (connectivity !== 4 && connectivity !== 8) {
    throw new RangeError(`floodFill: connectivity must be 4 or 8, got ${String(connectivity)}`);
  }
  if (!Number.isInteger(maskValue) || maskValue < 1 || maskValue > 255) {
    throw new RangeError(`floodFill: maskValue must be an integer 1–255, got ${maskValue}`);
  }
  if (
    !(Number.isInteger(seed.x) && Number.isInteger(seed.y)) ||
    seed.x < 0 ||
    seed.y < 0 ||
    seed.x >= w ||
    seed.y >= h
  ) {
    throw new RangeError(`floodFill: seed (${seed.x}, ${seed.y}) is outside the ${w}x${h} image`);
  }
  const fill = perChannel("value", value, cn).map(saturateU8);
  const lows = perChannel("loDiff", loDiff, cn);
  const ups = perChannel("upDiff", upDiff, cn);
  if ([...lows, ...ups].some((d) => d < 0)) {
    throw new RangeError("floodFill: loDiff and upDiff must not be negative");
  }
  // Tolerances as whole levels, and the width of each accepted interval.
  const lo = lows.map((d) => Math.min(Math.floor(d), 255));
  const interval = ups.map((d, c) => lo[c] + Math.min(Math.floor(d), 255));

  const mask = options.mask ?? createMatrix(w, h);
  if (options.mask) {
    assertType("floodFill", mask, "u8");
    assertChannels("floodFill", mask, 1);
    if (mask.width !== w || mask.height !== h) {
      throw new RangeError(`floodFill: mask is ${mask.width}x${mask.height}, image is ${w}x${h}`);
    }
  }
  const out = prepareOutput(options.out, "u8", w, h, cn);
  if (out !== image) out.data.set(image.data.subarray(0, w * h * cn));
  const img = out.data;

  // Mask with a one-pixel frame of 1s, so the scan stops at the image edge.
  const pw = w + 2;
  const flags = new Uint8Array(pw * (h + 2)).fill(1);
  for (let y = 0; y < h; y++) flags.set(mask.data.subarray(y * w, (y + 1) * w), (y + 1) * pw + 1);
  const m = (x: number, y: number) => (y + 1) * pw + x + 1;
  const px = (x: number, y: number) => (y * w + x) * cn;

  /**
   * Whether pixel `a` may join given the reference value at index `b` of `ref`.
   *
   * @param a - Index of the candidate in the image.
   * @param ref - Array holding the reference.
   * @param b - Index of the reference in `ref`.
   * @returns `true` when every channel is within tolerance.
   */
  const accepts = (a: number, ref: ArrayLike<number>, b: number): boolean => {
    for (let c = 0; c < cn; c++) {
      const d = img[a + c] - ref[b + c] + lo[c];
      if (d < 0 || d > interval[c]) return false;
    }
    return true;
  };
  const near = (ax: number, ay: number, bx: number, by: number) =>
    accepts(px(ax, ay), img, px(bx, by));
  const seedValue = Array.from(img.subarray(px(seed.x, seed.y), px(seed.x, seed.y) + cn));
  const nearSeed = (x: number, y: number) => accepts(px(x, y), seedValue, 0);

  const rect = { x: 0, y: 0, width: 0, height: 0 };
  let L = seed.x;
  let R = seed.x;
  if (flags[m(L, seed.y)]) {
    return { image: out, mask: copyMask(flags, mask, w, h), area: 0, rect };
  }
  const y0 = seed.y;
  flags[m(L, y0)] = maskValue;
  if (fixedRange) {
    while (!flags[m(R + 1, y0)] && nearSeed(R + 1, y0)) flags[m(++R, y0)] = maskValue;
    while (!flags[m(L - 1, y0)] && nearSeed(L - 1, y0)) flags[m(--L, y0)] = maskValue;
  } else {
    while (!flags[m(R + 1, y0)] && near(R + 1, y0, R, y0)) flags[m(++R, y0)] = maskValue;
    while (!flags[m(L - 1, y0)] && near(L - 1, y0, L, y0)) flags[m(--L, y0)] = maskValue;
  }
  let xMin = L;
  let xMax = R;
  let yMin = y0;
  let yMax = y0;
  let area = 0;
  const eight = connectivity === 8 ? 1 : 0;
  // Segments to visit: row, span, the parent's span, and which way is new.
  const stack: number[] = [y0, L, R, R + 1, R, 1];

  while (stack.length > 0) {
    const dir0 = stack.pop() as number;
    const PR = stack.pop() as number;
    const PL = stack.pop() as number;
    R = stack.pop() as number;
    L = stack.pop() as number;
    const YC = stack.pop() as number;
    const length = R - L;
    area += length + 1;
    xMax = Math.max(xMax, R);
    xMin = Math.min(xMin, L);
    yMax = Math.max(yMax, YC);
    yMin = Math.min(yMin, YC);

    const scans = [
      [-dir0, L - eight, R + eight],
      [dir0, L - eight, PL - 1],
      [dir0, PR + 1, R + eight],
    ];
    for (const [dir, left, right] of scans) {
      const y = YC + dir;
      /**
       * Whether `i` on row `y` touches the current span at `YC` through an
       * acceptable 8-connected neighbour.
       *
       * @param i - Column on row `y`.
       * @returns `true` when one of the three pixels above or below joins.
       */
      const touches8 = (i: number): boolean => {
        for (let k = -1; k <= 1; k++) {
          const idx = i - L + k;
          if (idx >= 0 && idx <= length && near(i, y, i + k, YC)) return true;
        }
        return false;
      };
      for (let i = left; i <= right; i++) {
        let joins: boolean;
        if (flags[m(i, y)]) joins = false;
        else if (fixedRange) joins = nearSeed(i, y);
        else if (!eight) joins = near(i, y, i, YC);
        else joins = touches8(i);
        if (!joins) continue;
        let j = i;
        flags[m(i, y)] = maskValue;
        if (fixedRange) {
          while (!flags[m(--j, y)] && nearSeed(j, y)) flags[m(j, y)] = maskValue;
          while (!flags[m(++i, y)] && nearSeed(i, y)) flags[m(i, y)] = maskValue;
        } else {
          while (!flags[m(--j, y)] && near(j, y, j + 1, y)) flags[m(j, y)] = maskValue;
          while (
            !flags[m(++i, y)] &&
            (near(i, y, i - 1, y) || (eight ? touches8(i) : near(i, y, i, YC) && i <= R))
          ) {
            flags[m(i, y)] = maskValue;
          }
        }
        stack.push(y, j + 1, i - 1, L, R, -dir);
      }
    }
    if (!maskOnly) {
      for (let i = L; i <= R; i++) img.set(fill, px(i, YC));
    }
  }
  rect.x = xMin;
  rect.y = yMin;
  rect.width = xMax - xMin + 1;
  rect.height = yMax - yMin + 1;
  return { image: out, mask: copyMask(flags, mask, w, h), area, rect };
}

/**
 * Copies the inside of the framed working mask back into the caller's mask.
 *
 * @param flags - Working mask with a one-pixel frame.
 * @param mask - Mask the size of the image.
 * @param w - Image width.
 * @param h - Image height.
 * @returns `mask`.
 */
function copyMask(flags: Uint8Array, mask: Matrix<"u8">, w: number, h: number): Matrix<"u8"> {
  for (let y = 0; y < h; y++) {
    mask.data.set(flags.subarray((y + 1) * (w + 2) + 1, (y + 1) * (w + 2) + 1 + w), y * w);
  }
  return mask;
}
