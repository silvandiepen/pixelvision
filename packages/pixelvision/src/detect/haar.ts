import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import { canny } from "../imgproc/canny";
import { integralImage } from "../imgproc/integralImage";
import { groupRectangles } from "./groupRectangles";
import type { Detection, HaarCascade, HaarOptions, HaarTree, ScaledHaarNode } from "./haar.model";

/** Integral tables a HAAR pass reads; all `(width + 1) x (height + 1)`. */
export interface HaarIntegrals {
  sum: ArrayLike<number>;
  squares: ArrayLike<number>;
  tilted?: ArrayLike<number>;
  /** Integral of a Canny edge map, for pruning flat windows. */
  edges?: ArrayLike<number>;
}

/**
 * Places a tree's rectangles at one scale: integral-table offsets relative
 * to a window's top-left cell, and their weights.
 *
 * @param tree - The tree (root split).
 * @param scale - Window scale relative to the cascade size.
 * @param w1 - Row stride of the integral tables (image width + 1).
 * @param rescale - Scale each weight by its rectangle's area before and after
 *   rounding, so the feature responds as it would on an image scaled down
 *   to the cascade's size (OpenCV's way of searching larger sizes).
 * @returns The scaled split and its subtrees.
 */
const scaleTree = (tree: HaarTree, scale: number, w1: number, rescale: boolean): ScaledHaarNode => {
  const tilted = tree.tilted === 1;
  const n = tree.features.length;
  const offsets = new Int32Array(n * 4);
  const weights = new Float64Array(n);
  tree.features.forEach((f, k) => {
    const a = ~~(f[0] * scale) + ~~(f[1] * scale) * w1;
    const fw = ~~(f[2] * scale);
    const fh = ~~(f[3] * scale);
    const o = k * 4;
    offsets[o] = a;
    if (tilted) {
      // Corners (x, y), (x + w, y + w), (x - h, y + h), (x + w - h, y + w + h).
      offsets[o + 1] = a + fw + fw * w1;
      offsets[o + 2] = a - fh + fh * w1;
      offsets[o + 3] = a + fw - fh + fw * w1 + fh * w1;
    } else {
      offsets[o + 1] = a + fw;
      offsets[o + 2] = a + fh * w1;
      offsets[o + 3] = a + fh * w1 + fw;
    }
    weights[k] = rescale ? (fw * fh > 0 ? (f[4] * f[2] * f[3]) / (fw * fh) : 0) : f[4];
  });
  return {
    tilted,
    offsets,
    weights,
    threshold: tree.threshold,
    left_val: tree.left_val,
    right_val: tree.right_val,
    left: tree.left && scaleTree(tree.left, scale, w1, rescale),
    right: tree.right && scaleTree(tree.right, scale, w1, rescale),
  };
};

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
  const opencv = cascade.opencvScoring === true;
  const winW = (cascade.size[0] * scale) | 0;
  const winH = (cascade.size[1] * scale) | 0;
  const step = (0.5 * scale + 1.5) | 0;
  const ex = width - winW;
  const ey = height - winH;
  const w1 = width + 1;
  const iiB = winW;
  const iiC = winH * w1;
  const iiD = iiC + winW;
  const edgesThreshold = (winW * winH * 0xff * edgeDensity) | 0;
  // The window's mean and deviation come from all of it, or (as OpenCV)
  // from the part inside a one-pixel border, scaled. OpenCV's feature
  // values are then per unit of that border area at the cascade's size.
  const inset = opencv ? Math.round(scale) : 0;
  const normW = opencv ? Math.round((cascade.size[0] - 2) * scale) : winW;
  const normH = opencv ? Math.round((cascade.size[1] - 2) * scale) : winH;
  const nA = inset + inset * w1;
  const nB = nA + normW;
  const nC = nA + normH * w1;
  const nD = nC + normW;
  const inverseArea = 1 / (normW * normH);
  const featureInverseArea = opencv
    ? 1 / ((cascade.size[0] - 2) * (cascade.size[1] - 2))
    : inverseArea;
  const stages = cascade.complexClassifiers.map((stage) => ({
    threshold: stage.threshold,
    trees: stage.simpleClassifiers.map((tree) => scaleTree(tree, scale, w1, opencv)),
  }));
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
      const mean = (sum[a + nA] - sum[a + nB] - sum[a + nC] + sum[a + nD]) * inverseArea;
      const variance =
        (squares[a + nA] - squares[a + nB] - squares[a + nC] + squares[a + nD]) * inverseArea -
        mean * mean;
      // A flat window: OpenCV divides by 1 instead of the deviation times the area.
      const std = variance > 0 ? Math.sqrt(variance) : opencv ? featureInverseArea : 1;

      let found = true;
      let stageSum = 0;
      for (const stage of stages) {
        stageSum = 0;
        for (const tree of stage.trees) {
          // Walk the tree from its root split to a score; most trees are a single split.
          let node = tree;
          for (;;) {
            const table = node.tilted ? tilted! : sum;
            const { offsets, weights } = node;
            let treeSum = 0;
            for (let k = 0, o = 0; k < weights.length; k++, o += 4) {
              treeSum +=
                (table[a + offsets[o]] -
                  table[a + offsets[o + 1]] -
                  table[a + offsets[o + 2]] +
                  table[a + offsets[o + 3]]) *
                weights[k];
            }
            const below = treeSum * featureInverseArea < node.threshold * std;
            const next = below ? node.left : node.right;
            if (next) {
              node = next;
              continue;
            }
            stageSum += below ? node.left_val : node.right_val;
            break;
          }
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
 * frontal and profile faces, eyes and upper bodies (see the
 * `pixelvision/cascades/*` entry points).
 *
 * The integral images (and the Canny edge map used to skip flat windows)
 * are built for you.
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
