import type { FittedSize } from "./captureSize.model";

/** Default pixel budget of a capture: 1920 × 1440, about 2.8 megapixels. */
export const DEFAULT_MAX_CAPTURE_PIXELS = 1920 * 1440;
/** Smallest pixel budget the `max-pixels` attribute accepts: 320 × 240. */
export const MIN_CAPTURE_PIXELS = 320 * 240;
/** Largest pixel budget the `max-pixels` attribute accepts: 4096 × 4096. */
export const MAX_CAPTURE_PIXELS = 4096 * 4096;

/**
 * Scales a size down, keeping its aspect ratio, until it has at most `maxPixels` pixels. Sizes
 * already within the budget are kept.
 *
 * @param width - Source width in pixels.
 * @param height - Source height in pixels.
 * @param maxPixels - The pixel budget.
 * @returns The bounded size and its scale.
 * @throws {RangeError} When a size or the budget isn't a finite positive number.
 *
 * @example
 * fitToPixels(7680, 4320, 1920 * 1080); // { width: 1920, height: 1080, scale: 0.25 }
 */
export function fitToPixels(width: number, height: number, maxPixels: number): FittedSize {
  for (const [name, value] of [
    ["width", width],
    ["height", height],
    ["maxPixels", maxPixels],
  ] as const) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`fitToPixels: ${name} must be a finite positive number, got ${value}`);
    }
  }
  const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)));
  if (scale === 1) return { width: Math.round(width), height: Math.round(height), scale };
  // Floor, so rounding never takes the result over the budget. A side clamped to one pixel
  // leaves the whole budget to the other.
  let fittedWidth = Math.max(1, Math.floor(width * scale));
  let fittedHeight = Math.max(1, Math.floor(height * scale));
  if (fittedHeight === 1) fittedWidth = Math.max(1, Math.min(fittedWidth, Math.floor(maxPixels)));
  if (fittedWidth === 1) fittedHeight = Math.max(1, Math.min(fittedHeight, Math.floor(maxPixels)));
  return { width: fittedWidth, height: fittedHeight, scale: fittedWidth / width };
}
