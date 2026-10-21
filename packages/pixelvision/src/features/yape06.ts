import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import type { Keypoint } from "./keypoint.model";
import type { Yape06Options } from "./yape06.model";

/**
 * Finds blob-like keypoints with YAPE06 (Lepetit, EPFL): local extrema of a
 * coarse Laplacian (5-pixel steps) whose Hessian's smaller eigenvalue is
 * large enough to rule out edges. Scale-tolerant and fast.
 *
 * The border is at least 5 pixels so the 5-pixel Laplacian never reads
 * outside the image.
 *
 * @param image - Single-channel `u8` matrix (gray).
 * @param options - Thresholds and border.
 * @returns Keypoints in row order, scored by the smaller Hessian eigenvalue.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const points = detectYape06(gaussianBlur(gray, { kernelSize: 5 }));
 */
export function detectYape06(image: Matrix<"u8">, options: Yape06Options = {}): Keypoint[] {
  assertType("detectYape06", image, "u8");
  assertChannels("detectYape06", image, 1);
  const laplacianThreshold = options.laplacianThreshold ?? 30;
  const eigenThreshold = options.minEigenvalueThreshold ?? 25;
  const border = Math.max(5, options.border ?? 5);
  const { width: w, height: h, data: src } = image;
  const dxx = 5;
  const dyy = 5 * w;
  const dxy = 3 + 3 * w;
  const dyx = 3 - 3 * w;
  const sx = border;
  const sy = border;
  const ex = w - border;
  const ey = h - border;

  const laplacian = new Int32Array(w * h);
  for (let y = sy; y < ey; y++) {
    for (let x = sx, p = y * w + sx; x < ex; x++, p++) {
      laplacian[p] = -4 * src[p] + src[p + dxx] + src[p - dxx] + src[p + dyy] + src[p - dyy];
    }
  }

  const points: Keypoint[] = [];
  for (let y = sy; y < ey; y++) {
    for (let x = sx, p = y * w + sx; x < ex; x++, p++) {
      const lv = laplacian[p];
      const neighbours = [p - 1, p + 1, p - w, p + w, p - w - 1, p + w - 1, p - w + 1, p + w + 1];
      const isExtremum =
        (lv < -laplacianThreshold && neighbours.every((n) => lv < laplacian[n])) ||
        (lv > laplacianThreshold && neighbours.every((n) => lv > laplacian[n]));
      if (!isExtremum) continue;
      const ixx = -2 * src[p] + src[p + dxx] + src[p - dxx];
      const iyy = -2 * src[p] + src[p + dyy] + src[p - dyy];
      const ixy = src[p + dxy] + src[p - dxy] - src[p + dyx] - src[p - dyx];
      const sqrtDelta = Math.sqrt((ixx - iyy) * (ixx - iyy) + 4 * ixy * ixy) | 0;
      const minEigenvalue = Math.min(Math.abs(lv - sqrtDelta), Math.abs(-(lv + sqrtDelta)));
      if (minEigenvalue > eigenThreshold) {
        points.push({ x, y, score: minEigenvalue });
        // An extremum in 3x3: its right neighbour can't be one too.
        x++;
        p++;
      }
    }
  }
  return points;
}
