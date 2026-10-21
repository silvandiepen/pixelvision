import { assertChannels } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import type { HoughLine, HoughLinesOptions } from "./houghLines.model";

/**
 * Finds straight lines in an edge image with the standard Hough
 * transform: every non-zero pixel votes for all lines through it, and
 * local maxima above the threshold are returned, strongest first.
 *
 * Follows OpenCV's `HoughLines`.
 *
 * @param edges - Single-channel matrix where non-zero pixels are edges, e.g. from {@link canny}.
 * @param options - Resolutions, vote threshold and line limit.
 * @returns Lines in normal form with their vote counts.
 * @throws {RangeError} When the image has more than one channel or a step isn't positive.
 *
 * @example
 * const lines = houghLines(canny(gray, { low: 30, high: 80 }), { threshold: 80 });
 */
export function houghLines(edges: Matrix, options: HoughLinesOptions = {}): HoughLine[] {
  assertChannels("houghLines", edges, 1);
  const rhoStep = options.rhoStep ?? 1;
  const thetaStep = options.thetaStep ?? Math.PI / 180;
  const threshold = options.threshold ?? 50;
  if (!(rhoStep > 0) || !(thetaStep > 0)) {
    throw new RangeError("houghLines: rhoStep and thetaStep must be positive");
  }
  const { width, height, data } = edges;
  const numAngle = Math.round(Math.PI / thetaStep);
  const numRho = Math.round(((width + height) * 2 + 1) / rhoStep);
  const offset = (numRho - 1) >> 1;
  const stride = numRho + 2;
  const accumulator = new Int32Array((numAngle + 2) * stride);
  const sin = new Float64Array(numAngle);
  const cos = new Float64Array(numAngle);
  for (let n = 0; n < numAngle; n++) {
    sin[n] = Math.sin(n * thetaStep) / rhoStep;
    cos[n] = Math.cos(n * thetaStep) / rhoStep;
  }

  for (let y = 0, i = 0; y < height; y++) {
    for (let x = 0; x < width; x++, i++) {
      if (data[i] === 0) continue;
      for (let n = 0; n < numAngle; n++) {
        const r = Math.round(x * cos[n] + y * sin[n]) + offset;
        accumulator[(n + 1) * stride + r + 1]++;
      }
    }
  }

  const peaks: number[] = [];
  for (let r = 0; r < numRho; r++) {
    for (let n = 0; n < numAngle; n++) {
      const base = (n + 1) * stride + r + 1;
      const votes = accumulator[base];
      if (
        votes > threshold &&
        votes > accumulator[base - 1] &&
        votes >= accumulator[base + 1] &&
        votes > accumulator[base - stride] &&
        votes >= accumulator[base + stride]
      ) {
        peaks.push(base);
      }
    }
  }
  peaks.sort((a, b) => accumulator[b] - accumulator[a] || a - b);

  const limit = Math.min(options.maxLines ?? peaks.length, peaks.length);
  const lines: HoughLine[] = [];
  for (let i = 0; i < limit; i++) {
    const base = peaks[i];
    const n = Math.floor(base / stride) - 1;
    const r = base - (n + 1) * stride - 1;
    lines.push({ rho: (r - offset) * rhoStep, theta: n * thetaStep, votes: accumulator[base] });
  }
  return lines;
}
