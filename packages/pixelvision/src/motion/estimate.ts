import type { Point } from "../math/transforms.model";
import { selectLowerMedian } from "../math/median";
import type { Estimate, EstimateOptions } from "./estimate.model";
import type { MotionKernel } from "./kernels";
import { affineKernel, homographyKernel } from "./kernels";

const MAX_SUBSET_TRIES = 1000;

/**
 * Updates the number of RANSAC iterations needed for the given confidence
 * now that the outlier ratio is known better.
 *
 * @param confidence - Desired probability of success.
 * @param outlierRatio - Current outlier ratio estimate.
 * @param size - Points per sample.
 * @param maxIterations - Current iteration limit.
 * @returns The new limit (never more than `maxIterations`).
 */
const iterationsFor = (
  confidence: number,
  outlierRatio: number,
  size: number,
  maxIterations: number,
) => {
  const num = Math.log(1 - confidence);
  const denom = Math.log(1 - Math.pow(1 - outlierRatio, size));
  return (
    (denom >= 0 || -num >= maxIterations * -denom ? maxIterations : Math.round(num / denom)) | 0
  );
};

/**
 * Draws `size` distinct random points the kernel accepts, the way jsfeat
 * does (one `random()` per draw, redrawing duplicates and rejected points).
 *
 * @param kernel - Model family.
 * @param from - Source points.
 * @param to - Target points.
 * @param random - Random source in [0, 1).
 * @returns The sample, or null after too many rejected draws.
 */
const drawSubset = (
  kernel: MotionKernel,
  from: readonly Point[],
  to: readonly Point[],
  random: () => number,
): { from: Point[]; to: Point[] } | null => {
  const indices: number[] = [];
  const subFrom: Point[] = [];
  const subTo: Point[] = [];
  let tries = 0;
  let i = 0;
  while (i < kernel.size && tries < MAX_SUBSET_TRIES) {
    let index: number;
    do {
      index = Math.floor(random() * from.length) | 0;
    } while (indices.slice(0, i).includes(index));
    indices[i] = index;
    subFrom[i] = from[index];
    subTo[i] = to[index];
    if (!kernel.checkSubset(subFrom, subTo, i + 1)) {
      tries++;
      continue;
    }
    i++;
  }
  return i === kernel.size && tries < MAX_SUBSET_TRIES ? { from: subFrom, to: subTo } : null;
};

/**
 * Marks the points whose squared error is within `threshold²`.
 *
 * @param kernel - Model family.
 * @param model - Fitted model.
 * @param from - Source points.
 * @param to - Target points.
 * @param threshold - Maximum distance.
 * @param errors - Scratch buffer for squared errors.
 * @returns The mask and count.
 */
const inliersOf = (
  kernel: MotionKernel,
  model: Float64Array,
  from: readonly Point[],
  to: readonly Point[],
  threshold: number,
  errors: Float64Array,
) => {
  kernel.error(from, to, model, errors);
  const limit = threshold * threshold;
  const inliers = Array.from(errors, (e) => e <= limit);
  return { inliers, inlierCount: inliers.filter(Boolean).length };
};

/**
 * Refits a model to all of its inliers and recounts them, keeping the
 * original when the refit fails or explains fewer points.
 *
 * @param kernel - Model family.
 * @param from - Source points.
 * @param to - Target points.
 * @param found - The model from the robust search.
 * @param threshold - Inlier distance.
 * @param errors - Scratch buffer.
 * @returns The refined estimate.
 */
const refined = (
  kernel: MotionKernel,
  from: readonly Point[],
  to: readonly Point[],
  found: Estimate,
  threshold: number,
  errors: Float64Array,
): Estimate => {
  const model = kernel.fit(
    from.filter((_, i) => found.inliers[i]),
    to.filter((_, i) => found.inliers[i]),
  );
  if (!model) return found;
  const { inliers, inlierCount } = inliersOf(kernel, model, from, to, threshold, errors);
  return inlierCount >= found.inlierCount ? { model, inliers, inlierCount } : found;
};

/**
 * Fits a model robustly with RANSAC or LMEDS.
 *
 * @param fn - Name of the calling function, for errors.
 * @param kernel - Model family.
 * @param from - Source points.
 * @param to - Matching target points.
 * @param options - Method and its parameters.
 * @returns The best model and its inliers, or null when none could be found.
 * @throws {RangeError} When the lists differ in length.
 */
export const estimate = (
  fn: string,
  kernel: MotionKernel,
  from: readonly Point[],
  to: readonly Point[],
  options: EstimateOptions,
): Estimate | null => {
  if (from.length !== to.length) {
    throw new RangeError(`${fn}: from and to must have the same length`);
  }
  const {
    method = "ransac",
    threshold = 3,
    confidence = 0.99,
    maxIterations = 1000,
    refine = true,
    random = Math.random,
  } = options;
  const count = from.length;
  if (count < kernel.size) return null;
  if (count === kernel.size) {
    const model = kernel.fit(from, to);
    return model ? { model, inliers: new Array(count).fill(true), inlierCount: count } : null;
  }

  const errors = new Float64Array(count);
  let best: Float64Array | null = null;
  if (method === "ransac") {
    let bestInliers = -1;
    let bestMask: boolean[] = [];
    let limit = maxIterations;
    for (let iteration = 0; iteration < limit; iteration++) {
      const subset = drawSubset(kernel, from, to, random);
      if (!subset) break;
      const model = kernel.fit(subset.from, subset.to);
      if (!model) continue;
      const { inliers, inlierCount } = inliersOf(kernel, model, from, to, threshold, errors);
      if (inlierCount > Math.max(bestInliers, kernel.size - 1)) {
        best = model;
        bestInliers = inlierCount;
        bestMask = inliers;
        limit = iterationsFor(confidence, (count - inlierCount) / count, kernel.size, limit);
      }
    }
    if (!best) return null;
    const found = { model: best, inliers: bestMask, inlierCount: bestInliers };
    return refine ? refined(kernel, from, to, found, threshold, errors) : found;
  }

  // LMEDS assumes at most ~45% outliers (jsfeat overwrote the caller's eps with this).
  const limit = iterationsFor(confidence, 0.45, kernel.size, maxIterations);
  let minMedian = 1e9;
  for (let iteration = 0; iteration < limit; iteration++) {
    const subset = drawSubset(kernel, from, to, random);
    if (!subset) break;
    const model = kernel.fit(subset.from, subset.to);
    if (!model) continue;
    kernel.error(from, to, model, errors);
    const median = selectLowerMedian(errors, 0, count - 1);
    if (median < minMedian) {
      minMedian = median;
      best = model;
    }
  }
  if (!best) return null;
  const sigma = Math.max(
    2.5 * 1.4826 * (1 + 5 / (count - kernel.size)) * Math.sqrt(minMedian),
    0.001,
  );
  const { inliers, inlierCount } = inliersOf(kernel, best, from, to, sigma, errors);
  if (inlierCount < kernel.size) return null;
  const found = { model: best, inliers, inlierCount };
  return refine ? refined(kernel, from, to, found, sigma, errors) : found;
};

/**
 * Finds the affine transform (rotation, scale, shear, translation) that
 * maps `from` onto `to`, ignoring outliers (wrong matches) with RANSAC or
 * LMEDS. Needs at least 3 point pairs.
 *
 * @param from - Points in the first image.
 * @param to - The matching points in the second image, same order.
 * @param options - Method, inlier threshold, confidence, iteration limit and random source.
 * @returns The model and inlier mask, or null when no model could be fitted.
 * @throws {RangeError} When the lists differ in length.
 *
 * @example
 * const result = estimateAffine(matchedA, matchedB, { threshold: 2 });
 * if (result) console.log(`${result.inlierCount} of ${matchedA.length} matches agree`);
 */
export function estimateAffine(
  from: readonly Point[],
  to: readonly Point[],
  options: EstimateOptions = {},
): Estimate | null {
  return estimate("estimateAffine", affineKernel, from, to, options);
}

/**
 * Finds the homography (perspective transform) that maps `from` onto
 * `to`, ignoring outliers (wrong matches) with RANSAC or LMEDS. Needs at
 * least 4 point pairs; with exactly 4 it's exact. Use it to find a known
 * flat object (a card, a page, a poster) in a photo.
 *
 * @param from - Points in the first image.
 * @param to - The matching points in the second image, same order.
 * @param options - Method, inlier threshold, confidence, iteration limit and random source.
 * @returns The model and inlier mask, or null when no model could be fitted.
 * @throws {RangeError} When the lists differ in length.
 *
 * @example
 * const result = estimateHomography(referencePoints, framePoints, { threshold: 3 });
 * if (result && result.inlierCount > 20) {
 *   const corners = referenceCorners.map((corner) => transformPoint(result.model, corner));
 * }
 */
export function estimateHomography(
  from: readonly Point[],
  to: readonly Point[],
  options: EstimateOptions = {},
): Estimate | null {
  return estimate("estimateHomography", homographyKernel, from, to, options);
}
