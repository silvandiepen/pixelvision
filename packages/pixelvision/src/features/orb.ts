import { assertChannels, assertType } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { warpAffine } from "../imgproc/warp";
import type { Keypoint } from "./keypoint.model";
import type { DescriptorMatch, MatchOptions } from "./orb.model";
import { ORB_PATTERN } from "./orbPattern";

const DESCRIPTOR_BYTES = 32;
const PATCH = 32;
const PATCH_CENTRE = 16 * PATCH + 16;
const ORIENTATION_RADIUS = 15;

/**
 * Half-widths of the orientation disc per row offset, made symmetric under
 * 90° rotation as OpenCV's ORB does, so orientations rotate exactly with
 * the image.
 */
const DISC_SPANS = (() => {
  const r = ORIENTATION_RADIUS;
  const spans = new Int32Array(r + 2);
  const vmax = Math.floor((r * Math.SQRT2) / 2 + 1);
  const vmin = Math.ceil((r * Math.SQRT2) / 2);
  for (let v = 0; v <= vmax; v++) spans[v] = Math.round(Math.sqrt(r * r - v * v));
  for (let v = r, v0 = 0; v >= vmin; v--) {
    while (spans[v0] === spans[v0 + 1]) v0++;
    spans[v] = v0;
    v0++;
  }
  return spans;
})();

/**
 * Computes a keypoint's orientation from the intensity centroid of the
 * disc of radius 15 around it (as OpenCV's ORB, with its rotation-symmetric
 * disc): the angle of the vector
 * from the keypoint to the brightness-weighted centre. Pixels outside the
 * image are skipped.
 *
 * @param image - Single-channel `u8` matrix.
 * @param keypoint - The keypoint (`x`, `y` are rounded).
 * @returns The angle in radians, in `(-π, π]`.
 *
 * @example
 * const angle = keypointOrientation(gray, corners[0]);
 */
export function keypointOrientation(image: Matrix<"u8">, keypoint: Keypoint): number {
  const { width: w, height: h, data } = image;
  const cx = Math.round(keypoint.x);
  const cy = Math.round(keypoint.y);
  let m01 = 0;
  let m10 = 0;
  for (let dy = -ORIENTATION_RADIUS; dy <= ORIENTATION_RADIUS; dy++) {
    const y = cy + dy;
    if (y < 0 || y >= h) continue;
    const span = DISC_SPANS[Math.abs(dy)];
    for (let dx = -span; dx <= span; dx++) {
      const x = cx + dx;
      if (x < 0 || x >= w) continue;
      const v = data[y * w + x];
      m10 += dx * v;
      m01 += dy * v;
    }
  }
  return Math.atan2(m01, m10);
}

/**
 * Computes ORB descriptors (oriented BRIEF): for each keypoint, a 32x32
 * patch is sampled along the keypoint's orientation and 256 learned pixel
 * comparisons become 256 bits (32 bytes). Rotation-invariant and compared
 * by Hamming distance with {@link matchDescriptors}.
 *
 * Keypoints without an `angle` get one from {@link keypointOrientation},
 * so every descriptor is rotation-normalised. Patch pixels
 * outside the image read as 128.
 *
 * @param image - Single-channel `u8` matrix (gray), ideally blurred.
 * @param keypoints - Points to describe, e.g. from {@link detectFast}.
 * @returns A `u8` matrix, 32 columns by one row per keypoint.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const corners = detectFast(gray);
 * const descriptors = describeOrb(gaussianBlur(gray, { kernelSize: 5 }), corners);
 */
export function describeOrb(image: Matrix<"u8">, keypoints: readonly Keypoint[]): Matrix<"u8"> {
  assertType("describeOrb", image, "u8");
  assertChannels("describeOrb", image, 1);
  const descriptors = createMatrix(DESCRIPTOR_BYTES, keypoints.length);
  const patch = createMatrix(PATCH, PATCH);
  // Single precision, so patches sample identically to the parity reference.
  const transform = new Float32Array(9);
  keypoints.forEach((keypoint, i) => {
    const angle = keypoint.angle ?? keypointOrientation(image, keypoint);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const half = PATCH * 0.5;
    transform.set([
      cos,
      -sin,
      (-cos + sin) * half + keypoint.x,
      sin,
      cos,
      (-sin - cos) * half + keypoint.y,
    ]);
    warpAffine(image, transform, { width: PATCH, height: PATCH, fill: 128, out: patch });
    const p = patch.data;
    for (let byte = 0, k = 0; byte < DESCRIPTOR_BYTES; byte++) {
      let value = 0;
      for (let bit = 0; bit < 8; bit++, k += 4) {
        const t0 = p[PATCH_CENTRE + ORB_PATTERN[k + 1] * PATCH + ORB_PATTERN[k]];
        const t1 = p[PATCH_CENTRE + ORB_PATTERN[k + 3] * PATCH + ORB_PATTERN[k + 2]];
        if (t0 < t1) value |= 1 << bit;
      }
      descriptors.data[i * DESCRIPTOR_BYTES + byte] = value;
    }
  });
  return descriptors;
}

const BIT_COUNTS = Uint8Array.from({ length: 256 }, (_, v) => {
  let count = 0;
  for (let b = v; b; b >>= 1) count += b & 1;
  return count;
});

/**
 * Counts the differing bits between two binary descriptors.
 *
 * @param a - Descriptor matrix.
 * @param rowA - Row in `a`.
 * @param b - Descriptor matrix with the same width.
 * @param rowB - Row in `b`.
 * @returns The Hamming distance.
 *
 * @example
 * hammingDistance(descriptorsA, 0, descriptorsB, 3);
 */
export function hammingDistance(
  a: Matrix<"u8">,
  rowA: number,
  b: Matrix<"u8">,
  rowB: number,
): number {
  const width = a.width;
  let distance = 0;
  for (let i = 0, pa = rowA * width, pb = rowB * b.width; i < width; i++) {
    distance += BIT_COUNTS[a.data[pa + i] ^ b.data[pb + i]];
  }
  return distance;
}

/**
 * Finds the nearest descriptor in `train` for every descriptor in `query`
 * by brute force, filtered by distance, an optional ratio test and an
 * optional cross-check.
 *
 * @param query - Descriptors to match (e.g. from the current frame).
 * @param train - Descriptors to match against (e.g. from a reference image).
 * @param options - Filters.
 * @returns Matches sorted by distance, best first.
 * @throws {RangeError} When the descriptor widths differ.
 *
 * @example
 * const matches = matchDescriptors(frameDescriptors, referenceDescriptors, { ratio: 0.8 });
 */
export function matchDescriptors(
  query: Matrix<"u8">,
  train: Matrix<"u8">,
  options: MatchOptions = {},
): DescriptorMatch[] {
  if (query.width !== train.width) {
    throw new RangeError(`matchDescriptors: widths differ (${query.width} vs ${train.width})`);
  }
  const { maxDistance = 64, ratio = 1, crossCheck = false } = options;
  const nearest = (from: Matrix<"u8">, to: Matrix<"u8">, row: number) => {
    let best = -1;
    let bestDistance = Infinity;
    let secondDistance = Infinity;
    for (let j = 0; j < to.height; j++) {
      const d = hammingDistance(from, row, to, j);
      if (d < bestDistance) {
        secondDistance = bestDistance;
        bestDistance = d;
        best = j;
      } else if (d < secondDistance) {
        secondDistance = d;
      }
    }
    return { best, bestDistance, secondDistance };
  };
  const matches: DescriptorMatch[] = [];
  for (let i = 0; i < query.height; i++) {
    const { best, bestDistance, secondDistance } = nearest(query, train, i);
    if (best < 0 || bestDistance > maxDistance) continue;
    if (ratio < 1 && !(bestDistance < ratio * secondDistance)) continue;
    if (crossCheck && nearest(train, query, best).best !== i) continue;
    matches.push({ query: i, train: best, distance: bestDistance });
  }
  return matches.sort((a, b) => a.distance - b.distance || a.query - b.query);
}
