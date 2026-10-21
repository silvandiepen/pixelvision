import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { scharrDerivatives } from "../imgproc/derivatives";
import type { Point } from "../math/transforms.model";
import type { FlowFrame, TrackedPoint, TrackPointsOptions } from "./opticalFlow.model";
import { buildPyramid } from "./pyramid";

// Fixed-point bilinear weights: 14 bits, as OpenCV's calcOpticalFlowPyrLK.
const W_BITS = 14;
const W_ONE = 1 << W_BITS;
const W_BITS_M5 = W_BITS - 5;
const W_HALF_M5 = 1 << (W_BITS_M5 - 1);
const W_HALF = 1 << (W_BITS - 1);
const FLT_SCALE = 1 / (1 << 20);
const FLT_EPSILON = 1.1920929e-7;

/**
 * Returns the pyramid for a frame, building one when an image is given.
 *
 * @param frame - Image or pyramid.
 * @param levels - Levels to build for an image.
 * @returns The pyramid.
 */
const pyramidOf = (frame: FlowFrame, levels: number): readonly Matrix<"u8">[] =>
  Array.isArray(frame) ? frame : buildPyramid(frame as Matrix<"u8">, levels);

/**
 * Bilinear weights for a fractional offset, in 14-bit fixed point.
 *
 * @param a - Horizontal fraction.
 * @param b - Vertical fraction.
 * @returns `[w00, w01, w10, w11]`, summing to 2^14.
 */
const weights = (a: number, b: number): [number, number, number, number] => {
  const w00 = ((1 - a) * (1 - b) * W_ONE + 0.5) | 0;
  const w01 = (a * (1 - b) * W_ONE + 0.5) | 0;
  const w10 = ((1 - a) * b * W_ONE + 0.5) | 0;
  return [w00, w01, w10, W_ONE - w00 - w01 - w10];
};

/**
 * Tracks points from one frame to the next with pyramidal Lucas-Kanade
 * optical flow (Bouguet's method, as OpenCV's `calcOpticalFlowPyrLK`):
 * each point's window is matched coarse-to-fine, solving for the shift
 * that best explains the brightness change.
 *
 * Pass gray images (pyramids are built with `levels`), or pyramids from
 * {@link buildPyramid} to reuse them across frames. Points whose window
 * leaves the image (it must stay at least one pixel inside) or lacks
 * texture are returned with `tracked: false`. Use a window that fits the
 * coarsest pyramid level comfortably.
 *
 * @param previous - Earlier frame (image or pyramid).
 * @param next - Later frame, same size and pyramid depth.
 * @param points - Points in the earlier frame.
 * @param options - Window size, pyramid depth, iteration limits.
 * @returns The new position of every point, in the same order.
 * @throws {RangeError} When the frames' sizes or pyramid depths differ.
 *
 * @example
 * const moved = trackPoints(previousGray, gray, corners, { windowSize: 21, levels: 4 });
 * const kept = moved.filter((p) => p.tracked);
 */
export function trackPoints(
  previous: FlowFrame,
  next: FlowFrame,
  points: readonly Point[],
  options: TrackPointsOptions = {},
): TrackedPoint[] {
  const {
    windowSize = 20,
    levels = 3,
    maxIterations = 30,
    epsilon = 0.01,
    minEigenvalue = 0.0001,
  } = options;
  const prevPyramid = pyramidOf(previous, levels);
  const nextPyramid = pyramidOf(next, levels);
  if (
    prevPyramid.length !== nextPyramid.length ||
    prevPyramid[0].width !== nextPyramid[0].width ||
    prevPyramid[0].height !== nextPyramid[0].height
  ) {
    throw new RangeError("trackPoints: frames must have the same size and pyramid depth");
  }
  const halfWindow = (windowSize - 1) * 0.5;
  const windowArea = windowSize * windowSize;
  const epsilonSquared = epsilon * epsilon;
  const patch = new Int32Array(windowArea);
  const patchGradients = new Int32Array(windowArea * 2);
  const gradients = createMatrix(0, 0, { type: "i32", channels: 2 });
  const count = points.length;
  const status = new Uint8Array(count).fill(1);
  const result = new Float64Array(count * 2);
  const maxLevel = prevPyramid.length - 1;

  for (let level = maxLevel; level >= 0; level--) {
    const scale = 1 / (1 << level);
    const { width: lw, height: lh, data: imgPrev } = prevPyramid[level];
    const imgNext = nextPyramid[level].data;
    const dstep = lw << 1;
    const right = lw - windowSize;
    const bottom = lh - windowSize;
    // The window must start at least one pixel inside and leave a pixel spare
    // for bilinear sampling on the far side.
    const outside = (x: number, y: number) => x < 1 || x >= right || y < 1 || y >= bottom;
    scharrDerivatives(prevPyramid[level], { out: gradients });
    const deriv = gradients.data;
    const lose = (id: number) => {
      if (level === 0) status[id] = 0;
    };

    for (let id = 0; id < count; id++) {
      const i = id * 2;
      let prevX = points[id].x * scale;
      let prevY = points[id].y * scale;
      let nextX = level === maxLevel ? prevX : result[i] * 2;
      let nextY = level === maxLevel ? prevY : result[i + 1] * 2;
      result[i] = nextX;
      result[i + 1] = nextY;
      prevX -= halfWindow;
      prevY -= halfWindow;
      const ipx = Math.floor(prevX);
      const ipy = Math.floor(prevY);
      if (outside(ipx, ipy)) {
        lose(id);
        continue;
      }
      let [w00, w01, w10, w11] = weights(prevX - ipx, prevY - ipy);
      let a11 = 0;
      let a12 = 0;
      let a22 = 0;
      for (let y = 0; y < windowSize; y++) {
        let src = (y + ipy) * lw + ipx;
        let dsrc = src << 1;
        for (let x = 0, p = y * windowSize; x < windowSize; x++, src++, p++, dsrc += 2) {
          const value =
            imgPrev[src] * w00 +
            imgPrev[src + 1] * w01 +
            imgPrev[src + lw] * w10 +
            imgPrev[src + lw + 1] * w11;
          const ix =
            deriv[dsrc] * w00 +
            deriv[dsrc + 2] * w01 +
            deriv[dsrc + dstep] * w10 +
            deriv[dsrc + dstep + 2] * w11;
          const iy =
            deriv[dsrc + 1] * w00 +
            deriv[dsrc + 3] * w01 +
            deriv[dsrc + dstep + 1] * w10 +
            deriv[dsrc + dstep + 3] * w11;
          const ixv = (ix + W_HALF) >> W_BITS;
          const iyv = (iy + W_HALF) >> W_BITS;
          patch[p] = (value + W_HALF_M5) >> W_BITS_M5;
          patchGradients[p * 2] = ixv;
          patchGradients[p * 2 + 1] = iyv;
          a11 += ixv * ixv;
          a12 += ixv * iyv;
          a22 += iyv * iyv;
        }
      }
      a11 *= FLT_SCALE;
      a12 *= FLT_SCALE;
      a22 *= FLT_SCALE;
      let d = a11 * a22 - a12 * a12;
      const minEig =
        (a22 + a11 - Math.sqrt((a11 - a22) * (a11 - a22) + 4 * a12 * a12)) / (windowArea * 2);
      if (minEig < minEigenvalue || d < FLT_EPSILON) {
        lose(id);
        continue;
      }
      d = 1 / d;
      nextX -= halfWindow;
      nextY -= halfWindow;
      let prevDeltaX = 0;
      let prevDeltaY = 0;
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        const inx = Math.floor(nextX);
        const iny = Math.floor(nextY);
        if (outside(inx, iny)) {
          lose(id);
          break;
        }
        [w00, w01, w10, w11] = weights(nextX - inx, nextY - iny);
        let b1 = 0;
        let b2 = 0;
        for (let y = 0; y < windowSize; y++) {
          let src = (y + iny) * lw + inx;
          for (let x = 0, p = y * windowSize; x < windowSize; x++, src++, p++) {
            const value =
              imgNext[src] * w00 +
              imgNext[src + 1] * w01 +
              imgNext[src + lw] * w10 +
              imgNext[src + lw + 1] * w11;
            const difference = ((value + W_HALF_M5) >> W_BITS_M5) - patch[p];
            b1 += difference * patchGradients[p * 2];
            b2 += difference * patchGradients[p * 2 + 1];
          }
        }
        b1 *= FLT_SCALE;
        b2 *= FLT_SCALE;
        const deltaX = (a12 * b2 - a22 * b1) * d;
        const deltaY = (a12 * b1 - a11 * b2) * d;
        nextX += deltaX;
        nextY += deltaY;
        result[i] = nextX + halfWindow;
        result[i + 1] = nextY + halfWindow;
        if (deltaX * deltaX + deltaY * deltaY <= epsilonSquared) break;
        if (
          iteration > 0 &&
          Math.abs(deltaX + prevDeltaX) < 0.01 &&
          Math.abs(deltaY + prevDeltaY) < 0.01
        ) {
          // Oscillating between two positions: settle in the middle.
          result[i] -= deltaX * 0.5;
          result[i + 1] -= deltaY * 0.5;
          break;
        }
        prevDeltaX = deltaX;
        prevDeltaY = deltaY;
      }
    }
  }
  return points.map((_, id) => ({
    x: result[id * 2],
    y: result[id * 2 + 1],
    tracked: status[id] === 1,
  }));
}
