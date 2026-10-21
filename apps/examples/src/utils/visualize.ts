import { createMatrix } from "pixelvision";
import type { HoughLine, Matrix } from "pixelvision";
import type { Segment } from "../examples/example.model";

/**
 * Scales any single-channel values to 0–255 for display: the smallest
 * value becomes black, the largest white.
 *
 * @param values - Values row by row.
 * @param width - Columns.
 * @param height - Rows.
 * @returns A gray `u8` matrix.
 */
export function normalizeToGray(
  values: ArrayLike<number>,
  width: number,
  height: number,
): Matrix<"u8"> {
  const out = createMatrix(width, height);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < width * height; i++) {
    min = Math.min(min, values[i]);
    max = Math.max(max, values[i]);
  }
  const range = max - min || 1;
  for (let i = 0; i < width * height; i++) {
    out.data[i] = Math.round(((values[i] - min) / range) * 255);
  }
  return out;
}

/**
 * Shows a 2-channel gradient field (`[gx, gy]` per pixel) as colour: the
 * horizontal gradient in red and cyan, the vertical one in green and
 * magenta, flat areas mid-gray.
 *
 * @param gradients - Output of `sobelDerivatives` or `scharrDerivatives`.
 * @returns A 3-channel `u8` matrix.
 */
export function gradientsToColor(gradients: Matrix): Matrix<"u8"> {
  const { width, height, data } = gradients;
  let peak = 1;
  for (let i = 0; i < width * height * 2; i++) peak = Math.max(peak, Math.abs(data[i]));
  const out = createMatrix(width, height, { channels: 3 });
  for (let i = 0; i < width * height; i++) {
    const gx = data[i * 2] / peak;
    const gy = data[i * 2 + 1] / peak;
    out.data[i * 3] = Math.round(128 + gx * 127);
    out.data[i * 3 + 1] = Math.round(128 + gy * 127);
    out.data[i * 3 + 2] = Math.round(128 - (gx + gy) * 63);
  }
  return out;
}

/**
 * Shows the strength of a 2-channel gradient field as gray: `|gx| + |gy|`,
 * scaled so the strongest edge is white.
 *
 * @param gradients - Output of `sobelDerivatives` or `scharrDerivatives`.
 * @returns A gray `u8` matrix.
 */
export function gradientMagnitude(gradients: Matrix): Matrix<"u8"> {
  const { width, height, data } = gradients;
  const magnitude = new Float64Array(width * height);
  for (let i = 0; i < width * height; i++) {
    magnitude[i] = Math.abs(data[i * 2]) + Math.abs(data[i * 2 + 1]);
  }
  return normalizeToGray(magnitude, width, height);
}

/**
 * Clips a Hough line (`x cos θ + y sin θ = ρ`) to the image so it can be
 * drawn as a segment.
 *
 * @param line - The line.
 * @param width - Image width.
 * @param height - Image height.
 * @returns The visible segment, or `null` when the line misses the image.
 */
export function houghLineToSegment(line: HoughLine, width: number, height: number): Segment | null {
  const cos = Math.cos(line.theta);
  const sin = Math.sin(line.theta);
  const points: { x: number; y: number }[] = [];
  const add = (x: number, y: number) => {
    if (x >= -1e-9 && x <= width + 1e-9 && y >= -1e-9 && y <= height + 1e-9) {
      if (!points.some((p) => Math.abs(p.x - x) < 1e-6 && Math.abs(p.y - y) < 1e-6)) {
        points.push({ x, y });
      }
    }
  };
  if (Math.abs(sin) > 1e-9) {
    add(0, line.rho / sin);
    add(width, (line.rho - width * cos) / sin);
  }
  if (Math.abs(cos) > 1e-9) {
    add(line.rho / cos, 0);
    add((line.rho - height * sin) / cos, height);
  }
  if (points.length < 2) return null;
  return { from: points[0], to: points[1] };
}

/**
 * Creates a plain light-gray image to draw overlays (points, lines,
 * shapes) on for demos without an input image.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @returns A gray `u8` matrix.
 */
export function blankImage(width: number, height: number): Matrix<"u8"> {
  const image = createMatrix(width, height);
  image.data.fill(236);
  return image;
}
