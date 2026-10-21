import type { Box } from "./geometry.model";
import type { GrayPixels, RobustSharpnessOptions } from "./sharpness.model";

/**
 * Scores how sharp an image (or a region of it) is: the variance of the
 * 4-neighbour Laplacian. Motion blur and defocus flatten edges and lower
 * the score, so among frames of the same scene the highest score is the
 * crispest. Scores of different scenes are not comparable.
 *
 * @param image - Gray pixels, one value per pixel.
 * @param region - Area to score, in pixels (default the whole image); clipped to the image.
 * @returns The score, 0 when the region is smaller than 3 × 3.
 *
 * @example
 * const gray = grayscale(frame);
 * const score = sharpness(gray, faceBox);
 */
export function sharpness(image: GrayPixels, region?: Box): number {
  const { width, height, data } = image;
  const area = region ?? { x: 0, y: 0, width, height };
  // Only interior pixels have four neighbours.
  const x0 = Math.max(1, Math.floor(area.x));
  const y0 = Math.max(1, Math.floor(area.y));
  const x1 = Math.min(width - 1, Math.ceil(area.x + area.width));
  const y1 = Math.min(height - 1, Math.ceil(area.y + area.height));
  let n = 0;
  let sum = 0;
  let sumSq = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * width + x;
      const lap = data[i - 1] + data[i + 1] + data[i - width] + data[i + width] - 4 * data[i];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

/** Largest magnitude of the 4-neighbour Laplacian of 8-bit levels: 4 × 255. */
const LAPLACIAN_RANGE = 1020;

/** Ratio of a normal distribution's standard deviation to its median absolute deviation. */
const MAD_TO_SIGMA = 1.4826;

/**
 * The bin holding the lower median of a histogram.
 *
 * @param counts - Counts per bin.
 * @param n - Total count, at least 1.
 * @returns The bin index.
 */
const medianBin = (counts: Uint32Array, n: number): number => {
  const target = (n - 1) >> 1;
  let seen = counts[0];
  let bin = 0;
  while (seen <= target) seen += counts[++bin];
  return bin;
};

/**
 * Scores how sharp an image is without counting sensor noise as detail:
 * the variance of the 4-neighbour Laplacian, minus the part of it that a
 * normal distribution of the same median absolute deviation would explain.
 *
 * Edges and fine features are sparse, so they give the Laplacian a few
 * large values that lie far outside its bulk. Sensor noise and blurred
 * shading give it a bell-shaped bulk, whose spread the median absolute
 * deviation measures without being pulled up by the edges. Removing that
 * part leaves the edges: a blurred frame with noise scores as low as a clean
 * blurred one, while a sharp frame keeps most of its score. Values are
 * binned to whole levels to find the medians, so it runs in linear time.
 *
 * @param image - Gray pixels, one value per pixel, 0–255.
 * @param options - `noiseWeight`: how much of the noise-like part to remove (default 1).
 * @returns The score, 0 or more; 0 when the image is smaller than 3 × 3.
 *
 * @example
 * const score = robustSharpness(medianBlur(region, 3));
 */
export function robustSharpness(image: GrayPixels, options: RobustSharpnessOptions = {}): number {
  const { noiseWeight = 1 } = options;
  const { width, height, data } = image;
  if (width < 3 || height < 3) return 0;
  const bins = 2 * LAPLACIAN_RANGE + 1;
  const counts = new Uint32Array(bins);
  let sum = 0;
  let sumSq = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap = data[i - 1] + data[i + 1] + data[i - width] + data[i + width] - 4 * data[i];
      sum += lap;
      sumSq += lap * lap;
      counts[
        Math.max(-LAPLACIAN_RANGE, Math.min(LAPLACIAN_RANGE, Math.round(lap))) + LAPLACIAN_RANGE
      ]++;
    }
  }
  const n = (width - 2) * (height - 2);
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const middle = medianBin(counts, n);
  const deviations = new Uint32Array(bins);
  for (let bin = 0; bin < bins; bin++) deviations[Math.abs(bin - middle)] += counts[bin];
  const spread = MAD_TO_SIGMA * medianBin(deviations, n);
  return Math.max(0, variance - noiseWeight * spread * spread);
}
