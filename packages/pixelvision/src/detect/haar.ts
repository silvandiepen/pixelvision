import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import { canny } from "../imgproc/canny";
import { integralImage } from "../imgproc/integralImage";
import { groupRectangles } from "./groupRectangles";
import type { Detection, HaarCascade, HaarOptions } from "./haar.model";

/** Integral tables a HAAR pass reads; all `(width + 1) x (height + 1)`. */
export interface HaarIntegrals {
  sum: ArrayLike<number>;
  squares: ArrayLike<number>;
  tilted?: ArrayLike<number>;
  /** Integral of a Canny edge map, for pruning flat windows. */
  edges?: ArrayLike<number>;
}

/**
 * Runs a cascade over every window position at one scale.
 *
 * @param integrals - Integral tables of the image.
 * @param width - Image width.
 * @param height - Image height.
 * @param scale - Window scale relative to the cascade size.
 * @param cascade - The cascade.
 * @param edgeDensity - Fraction of edge pixels a window needs when `edges` is given.
 * @returns Raw detections at this scale.
 */
export const haarSingleScale = (
  integrals: HaarIntegrals,
  width: number,
  height: number,
  scale: number,
  cascade: HaarCascade,
  edgeDensity: number,
): Detection[] => {
  const { sum, squares, tilted, edges } = integrals;
  const winW = (cascade.size[0] * scale) | 0;
  const winH = (cascade.size[1] * scale) | 0;
  const step = (0.5 * scale + 1.5) | 0;
  const ex = width - winW;
  const ey = height - winH;
  const w1 = width + 1;
  const inverseArea = 1 / (winW * winH);
  const iiB = winW;
  const iiC = winH * w1;
  const iiD = iiC + winW;
  const edgesThreshold = (winW * winH * 0xff * edgeDensity) | 0;
  const rects: Detection[] = [];

  for (let y = 0; y < ey; y += step) {
    for (let x = 0, a = y * w1; x < ex; x += step, a += step) {
      if (edges) {
        const density = edges[a] - edges[a + iiB] - edges[a + iiC] + edges[a + iiD];
        if (density < edgesThreshold) {
          // Too flat for the object; the next window overlaps it mostly, skip it too.
          x += step;
          a += step;
          continue;
        }
      }
      const mean = (sum[a] - sum[a + iiB] - sum[a + iiC] + sum[a + iiD]) * inverseArea;
      const variance =
        (squares[a] - squares[a + iiB] - squares[a + iiC] + squares[a + iiD]) * inverseArea -
        mean * mean;
      const std = variance > 0 ? Math.sqrt(variance) : 1;

      let found = true;
      let stageSum = 0;
      for (const stage of cascade.complexClassifiers) {
        stageSum = 0;
        for (const tree of stage.simpleClassifiers) {
          let treeSum = 0;
          if (tree.tilted === 1) {
            for (const f of tree.features) {
              const fa = ~~(x + f[0] * scale) + ~~(y + f[1] * scale) * w1;
              const fw = ~~(f[2] * scale);
              const fh = ~~(f[3] * scale);
              const fb = fw * w1;
              const fc = fh * w1;
              const t = tilted!;
              treeSum +=
                (t[fa] - t[fa + fw + fb] - t[fa - fh + fc] + t[fa + fw - fh + fb + fc]) * f[4];
            }
          } else {
            for (const f of tree.features) {
              const fa = ~~(x + f[0] * scale) + ~~(y + f[1] * scale) * w1;
              const fw = ~~(f[2] * scale);
              const fc = ~~(f[3] * scale) * w1;
              treeSum += (sum[fa] - sum[fa + fw] - sum[fa + fc] + sum[fa + fc + fw]) * f[4];
            }
          }
          stageSum += treeSum * inverseArea < tree.threshold * std ? tree.left_val : tree.right_val;
        }
        if (stageSum < stage.threshold) {
          found = false;
          break;
        }
      }
      if (found) {
        rects.push({ x, y, width: winW, height: winH, neighbors: 1, confidence: stageSum });
        x += step;
        a += step;
      }
    }
  }
  return rects;
};

/**
 * Finds objects with a Viola-Jones (HAAR) cascade at every scale from
 * `minScale` up, then merges overlapping hits. Ships with cascades for
 * frontal and profile faces, eyes, mouths, upper bodies and hands (see the
 * `pixelvision/cascades/*` entry points).
 *
 * The integral images (and the Canny edge map used to skip flat windows)
 * are built for you; jsfeat left that to the caller.
 *
 * @param image - Single-channel `u8` matrix (gray); equalising its histogram first often helps.
 * @param cascade - The cascade to run.
 * @param options - Scale step, smallest scale, grouping and pruning.
 * @returns Detections in pixels, largest support first.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel or the scale factor is not above 1.
 *
 * @example
 * import { frontalFace } from "pixelvision/cascades/frontal-face";
 * const faces = detectHaar(equalizeHistogram(gray), frontalFace, { minNeighbors: 2 });
 */
export function detectHaar(
  image: Matrix<"u8">,
  cascade: HaarCascade,
  options: HaarOptions = {},
): Detection[] {
  assertType("detectHaar", image, "u8");
  assertChannels("detectHaar", image, 1);
  const { scaleFactor = 1.2, minScale = 1, minNeighbors = 1, edgeDensity = 0.07 } = options;
  if (!(scaleFactor > 1)) throw new RangeError("detectHaar: scaleFactor must be greater than 1");
  const { width, height } = image;
  const tables = integralImage(image, {
    sum: true,
    squares: true,
    tilted: cascade.tilted === true,
  });
  const integrals: HaarIntegrals = {
    sum: tables.sum!.data,
    squares: tables.squares!.data,
    tilted: tables.tilted?.data,
    edges:
      edgeDensity === false
        ? undefined
        : integralImage(canny(image, { low: 10, high: 50 })).sum!.data,
  };
  const raw: Detection[] = [];
  for (
    let scale = minScale;
    scale * cascade.size[0] < width && scale * cascade.size[1] < height;
    scale *= scaleFactor
  ) {
    raw.push(...haarSingleScale(integrals, width, height, scale, cascade, edgeDensity || 0));
  }
  const grouped = minNeighbors > 0 ? groupRectangles(raw, minNeighbors) : raw;
  return grouped.sort((a, b) => b.neighbors - a.neighbors || b.confidence - a.confidence);
}
