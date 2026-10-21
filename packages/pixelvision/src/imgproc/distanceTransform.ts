import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { roundHalfEven } from "../core/round";
import type { DistanceTransformOptions } from "./distanceTransform.model";

/** Step costs (straight, diagonal, knight) per metric and mask size, as OpenCV's. */
const MASKS = {
  c3: [1, 1],
  l13: [1, 2],
  l23: [0.955, 1.3693],
  l25: [1, 1.4, 2.1969],
} as const;

/** Distances are summed in fixed point with 16 fraction bits. */
const SHIFT = 16;
const UINT_MAX = 0xffffffff;

/**
 * Computes, for every non-zero pixel, the distance to the nearest zero
 * pixel, as OpenCV's `distanceTransform` with `DIST_MASK_3` or
 * `DIST_MASK_5`: two passes that propagate step costs from the neighbours
 * already visited. Its maximum is the centre of the thickest part of a
 * shape; thresholding it splits touching objects.
 *
 * Distances are summed in fixed point exactly as OpenCV sums them, so the
 * results match OpenCV exactly. The image edge is not a zero: a shape
 * touching the edge measures distance to its zero pixels only. Pixels with
 * no zero pixel in the image get a large value (about 65,500).
 *
 * @param image - Single-channel `u8` matrix; zero pixels are the background.
 * @param options - `metric` (`"l2"`, `"l1"` or `"c"`), `maskSize` (3 or 5, for `"l2"`) and `out`.
 * @returns An `f32` matrix of distances, 0 on background pixels.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it has more than one channel, or the metric or mask size is unknown.
 *
 * @example
 * const distance = distanceTransform(binary, { metric: "l2", maskSize: 5 });
 * // Pixels at least 10 px inside a shape:
 * const cores = distance.data.map((d) => (d >= 10 ? 255 : 0));
 */
export function distanceTransform(
  image: Matrix<"u8">,
  options: DistanceTransformOptions = {},
): Matrix<"f32"> {
  assertType("distanceTransform", image, "u8");
  assertChannels("distanceTransform", image, 1);
  const { metric = "l2", maskSize = 5 } = options;
  if (metric !== "l1" && metric !== "l2" && metric !== "c") {
    throw new RangeError(
      `distanceTransform: metric must be "l1", "l2" or "c", got ${String(metric)}`,
    );
  }
  if (maskSize !== 3 && maskSize !== 5) {
    throw new RangeError(`distanceTransform: maskSize must be 3 or 5, got ${String(maskSize)}`);
  }
  const costs =
    metric === "l2"
      ? maskSize === 5
        ? MASKS.l25
        : MASKS.l23
      : metric === "l1"
        ? MASKS.l13
        : MASKS.c3;
  const [hv, diag, knight] = costs.map((c) => roundHalfEven(Math.fround(c) * (1 << SHIFT)));
  const border = costs.length === 3 ? 2 : 1;
  const max = UINT_MAX - (knight ?? diag);

  const { width: w, height: h, data } = image;
  const out = prepareOutput(options.out, "f32", w, h, 1);
  // Working copy with a border that never wins (the image edge isn't background).
  const stride = w + 2 * border;
  const temp = new Float64Array(stride * (h + 2 * border)).fill(max);
  const at = (x: number, y: number) => (y + border) * stride + x + border;
  /**
   * Lowers `best` to `temp[index] + cost` when that is smaller.
   *
   * @param best - Current minimum.
   * @param index - Neighbour in `temp`.
   * @param cost - Step cost to it.
   * @returns The new minimum.
   */
  const relax = (best: number, index: number, cost: number) => Math.min(best, temp[index] + cost);

  // Forward pass: neighbours above and to the left.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = at(x, y);
      if (data[y * w + x] === 0) {
        temp[i] = 0;
        continue;
      }
      let best = UINT_MAX;
      if (border === 2) {
        best = relax(best, i - 2 * stride - 1, knight);
        best = relax(best, i - 2 * stride + 1, knight);
        best = relax(best, i - stride - 2, knight);
      }
      best = relax(best, i - stride - 1, diag);
      best = relax(best, i - stride, hv);
      best = relax(best, i - stride + 1, diag);
      if (border === 2) best = relax(best, i - stride + 2, knight);
      best = relax(best, i - 1, hv);
      temp[i] = Math.min(best, max);
    }
  }
  // Backward pass: neighbours below and to the right.
  const scale = 1 / (1 << SHIFT);
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = at(x, y);
      let best = temp[i];
      if (best > hv) {
        if (border === 2) {
          best = relax(best, i + 2 * stride + 1, knight);
          best = relax(best, i + 2 * stride - 1, knight);
          best = relax(best, i + stride + 2, knight);
        }
        best = relax(best, i + stride + 1, diag);
        best = relax(best, i + stride, hv);
        best = relax(best, i + stride - 1, diag);
        if (border === 2) best = relax(best, i + stride - 2, knight);
        best = relax(best, i + 1, hv);
        temp[i] = best;
      }
      // OpenCV converts the sum to single precision before scaling.
      out.data[y * w + x] = Math.fround(best) * scale;
    }
  }
  return out;
}
