import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import { adaptiveThreshold } from "../imgproc/adaptiveThreshold";
import { otsuLevel } from "../imgproc/threshold";
import { perspectiveTransform, transformPoint } from "../math/transforms";
import { estimateHomography } from "../motion/estimate";
import type { Point } from "../math/transforms.model";
import type { FinderPattern, QrCode } from "./qrCode.model";
import { decodeModules } from "./qrDecode";
import type { Binary } from "./qrDetect";
import {
  findAlignmentPattern,
  finderTriples,
  findFinderPatterns,
  finderCorners,
  patternWidth,
  ringModules,
} from "./qrDetect";
import { MAX_QR_VERSION } from "./qrTables";

/**
 * A small seeded random source, so the homography fit is the same every time.
 *
 * @param seed - Seed.
 * @returns Numbers in [0, 1).
 */
const lcg = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

/**
 * Thresholds the image two ways, the second only when needed: at Otsu's
 * level (even light), then against the local mean (uneven light).
 *
 * @param image - Gray image.
 * @returns Functions that each make one thresholded image, 1 for dark.
 */
const binarizations = (image: Matrix<"u8">): (() => Binary)[] => {
  const { width, height, data } = image;
  return [
    () => {
      const level = otsuLevel(image);
      const dark = new Uint8Array(width * height);
      for (let i = 0; i < dark.length; i++) dark[i] = data[i] <= level ? 1 : 0;
      return { width, height, data: dark };
    },
    () => {
      const blockSize = Math.max(15, (Math.floor(Math.min(width, height) / 8) >> 1) * 2 + 1);
      const local = adaptiveThreshold(image, { blockSize, offset: 5, invert: true, max: 1 });
      return { width, height, data: local.data };
    },
  ];
};

/**
 * Fits the module-to-image homography to every known point by least
 * squares (RANSAC first, so a misplaced point can't pull it off), when
 * there are enough points beyond the four the first estimate used.
 *
 * @param from - Points in module coordinates.
 * @param to - The same points in the image.
 * @param fallback - The four-point estimate.
 * @param moduleSize - Module size in pixels, for the inlier threshold.
 * @returns The fitted homography, or `fallback`.
 */
export const refineTransform = (
  from: readonly Point[],
  to: readonly Point[],
  fallback: Float64Array,
  moduleSize: number,
): Float64Array => {
  if (from.length < 8) return fallback;
  const fit = estimateHomography(from, to, {
    threshold: Math.max(1.5, moduleSize / 2),
    random: lcg(1),
  });
  return fit ? fit.model : fallback;
};

/**
 * Samples and decodes the code that three finder patterns frame. Tries the
 * version the patterns' spacing suggests, then its neighbours. For version
 * 2 and up the alignment pattern near the bottom-right corner fixes the
 * perspective; without one the fourth corner is extrapolated.
 *
 * @param binary - Thresholded image.
 * @param finders - Top-left, top-right and bottom-left finder patterns.
 * @param finders.0 - Top-left.
 * @param finders.1 - Top-right.
 * @param finders.2 - Bottom-left.
 * @returns The code, or `null` when it can't be read.
 */
export const decodeFinders = (
  binary: Binary,
  [topLeft, topRight, bottomLeft]: FinderPattern[],
): QrCode | null => {
  // Module size along the code's own axes: each finder pattern is 7 modules
  // wide along the line to its neighbour.
  const widths = [
    patternWidth(binary, topLeft, topRight),
    patternWidth(binary, topRight, topLeft),
    patternWidth(binary, topLeft, bottomLeft),
    patternWidth(binary, bottomLeft, topLeft),
  ];
  if (widths.some((w) => w === undefined)) return null;
  const moduleSize = (widths as number[]).reduce((a, b) => a + b) / 28;
  const span =
    (Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y) +
      Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y)) /
    2 /
    moduleSize;
  const estimate = Math.round((span - 10) / 4);
  const { width, height, data } = binary;
  const rings = [
    finderCorners(binary, topLeft, topRight, moduleSize),
    finderCorners(binary, topRight, topLeft, moduleSize),
    finderCorners(binary, bottomLeft, topLeft, moduleSize),
  ];
  for (const version of [estimate, estimate - 1, estimate + 1]) {
    if (version < 1 || version > MAX_QR_VERSION) continue;
    const dim = 17 + 4 * version;
    // Where a fourth finder pattern would be, and the alignment pattern 3 modules in from it.
    const corner = {
      x: topRight.x - topLeft.x + bottomLeft.x,
      y: topRight.y - topLeft.y + bottomLeft.y,
    };
    let anchor: Point = corner;
    let anchorModule = dim - 3.5;
    if (version >= 2) {
      const inward = 1 - 3 / (dim - 7);
      const expected = {
        x: topLeft.x + inward * (corner.x - topLeft.x),
        y: topLeft.y + inward * (corner.y - topLeft.y),
      };
      const right = {
        x: (topRight.x - topLeft.x) / (dim - 7),
        y: (topRight.y - topLeft.y) / (dim - 7),
      };
      const down = {
        x: (bottomLeft.x - topLeft.x) / (dim - 7),
        y: (bottomLeft.y - topLeft.y) / (dim - 7),
      };
      // The search stays at least 8.5 modules from the line between the
      // top-right and bottom-left patterns, so the four points stay convex.
      const found = findAlignmentPattern(binary, expected, right, down, Math.min(8, 2 + version));
      if (found) {
        anchor = found;
        anchorModule = dim - 6.5;
      }
    }
    const moduleAnchors = [
      { x: 3.5, y: 3.5 },
      { x: dim - 3.5, y: 3.5 },
      { x: anchorModule, y: anchorModule },
      { x: 3.5, y: dim - 3.5 },
    ];
    const imageAnchors = [topLeft, topRight, anchor, bottomLeft];
    let transform = perspectiveTransform(moduleAnchors, imageAnchors);
    // Refine with the finder patterns' outer corners: twelve more points of
    // known position fix the perspective even without an alignment pattern.
    const from: Point[] = [
      { x: 3.5, y: 3.5 },
      { x: dim - 3.5, y: 3.5 },
      { x: 3.5, y: dim - 3.5 },
    ];
    const to: Point[] = [topLeft, topRight, bottomLeft];
    if (anchorModule === dim - 6.5) {
      from.push({ x: anchorModule, y: anchorModule });
      to.push(anchor);
    }
    const toModules = perspectiveTransform(imageAnchors, moduleAnchors);
    rings.forEach((ring, f) => {
      const origin = [
        { x: 0, y: 0 },
        { x: dim - 7, y: 0 },
        { x: 0, y: dim - 7 },
      ][f];
      const modules = ring && ringModules(ring, toModules, origin);
      if (!modules) return;
      from.push(...modules);
      to.push(...ring!);
    });
    transform = refineTransform(from, to, transform, moduleSize);
    const grid = new Uint8Array(dim * dim);
    for (let y = 0; y < dim; y++) {
      for (let x = 0; x < dim; x++) {
        const p = transformPoint(transform, { x: x + 0.5, y: y + 0.5 });
        const px = Math.floor(p.x);
        const py = Math.floor(p.y);
        if (px >= 0 && py >= 0 && px < width && py < height)
          grid[y * dim + x] = data[py * width + px];
      }
    }
    const content = decodeModules((x, y) => grid[y * dim + x], version);
    if (!content) continue;
    const corners = [
      { x: 0, y: 0 },
      { x: dim, y: 0 },
      { x: dim, y: dim },
      { x: 0, y: dim },
    ].map((p) => transformPoint(transform, p)) as QrCode["corners"];
    return { ...content, corners };
  }
  return null;
};

/**
 * Finds and decodes a QR code. The three finder patterns are located by
 * their 1:1:3:1:1 runs (at any rotation), the symbol is sampled through
 * the perspective fitted to them, their outer corners and the alignment
 * pattern, and the format and version information, data mask,
 * Reed–Solomon error correction and numeric, alphanumeric and byte
 * segments (with ECI) are decoded. The text matches OpenCV's
 * `QRCodeDetector`; the corners are fitted to the whole symbol.
 *
 * Reads versions 1 to 10 (up to 57 x 57 modules, 271 bytes) at every error
 * correction level. Kanji segments, mirrored symbols and Micro QR are not
 * supported, and only one code per image is returned.
 *
 * @param image - Single-channel `u8` matrix (gray). Give the code a quiet
 *   zone and at least 2 pixels per module.
 * @returns The text, bytes, corners, version and error correction level, or
 *   `null` when no code can be read.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const code = readQrCode(grayscale(frame));
 * if (code) console.log(code.text, code.corners);
 */
export function readQrCode(image: Matrix<"u8">): QrCode | null {
  assertType("readQrCode", image, "u8");
  assertChannels("readQrCode", image, 1);
  for (const binarize of binarizations(image)) {
    const binary = binarize();
    for (const triple of finderTriples(findFinderPatterns(binary)).slice(0, 4)) {
      const code = decodeFinders(binary, triple);
      if (code) return code;
    }
  }
  return null;
}
