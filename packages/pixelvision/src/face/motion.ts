import type { Matrix } from "../core/matrix.model";
import type { RegionPatch, RegionBox } from "./motion.model";

/**
 * Shrinks a region of a gray frame to `size` x `size` mean gray levels.
 *
 * @param gray - One-channel frame.
 * @param box - The region, in the frame's pixels; clipped to the frame.
 * @param size - Cells across and down (default 16).
 * @returns The patch, or undefined when the region is empty after clipping.
 */
export function regionPatch(
  gray: Matrix<"u8">,
  box: RegionBox,
  size = 16,
): RegionPatch | undefined {
  const x0 = Math.max(0, Math.floor(box.x));
  const y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.min(gray.width, Math.ceil(box.x + box.width));
  const y1 = Math.min(gray.height, Math.ceil(box.y + box.height));
  if (x1 - x0 < size || y1 - y0 < size) return undefined;
  const cells = new Float32Array(size * size);
  const counts = new Uint32Array(size * size);
  const { width, data } = gray;
  for (let y = y0; y < y1; y++) {
    const row = Math.min(size - 1, Math.floor(((y - y0) * size) / (y1 - y0)));
    for (let x = x0; x < x1; x++) {
      const cell = row * size + Math.min(size - 1, Math.floor(((x - x0) * size) / (x1 - x0)));
      cells[cell] += data[y * width + x];
      counts[cell]++;
    }
  }
  for (let i = 0; i < cells.length; i++) cells[i] /= counts[i];
  return { size, cells };
}

/**
 * How much a face region changed between two detections: the mean absolute
 * difference of their patches, 0–1. A frozen or repeated frame gives 0; a
 * live face, even one trying to keep still, gives a little from breathing,
 * blinking and sensor noise.
 *
 * @param previous - The earlier patch.
 * @param current - The later patch.
 * @returns 0–1, or undefined when either is missing or their sizes differ.
 *
 * @example
 * const patch = regionPatch(gray, faceBox);
 * challenge.update({ pose, motion: measureMotion(lastPatch, patch) });
 * lastPatch = patch;
 */
export function measureMotion(
  previous: RegionPatch | undefined,
  current: RegionPatch | undefined,
): number | undefined {
  if (!previous || !current || previous.size !== current.size) return undefined;
  let sum = 0;
  for (let i = 0; i < current.cells.length; i++) {
    sum += Math.abs(current.cells[i] - previous.cells[i]);
  }
  return sum / current.cells.length / 255;
}
