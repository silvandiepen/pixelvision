import type { Box } from "./geometry.model";
import type { GrayPixels } from "./sharpness.model";

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
