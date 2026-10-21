import { assertChannels, assertType } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { pyrDown, pyrDownPlane } from "../imgproc/pyrDown";
import { resample } from "../imgproc/resample";
import type { BbfCascade, BbfOptions } from "./bbf.model";
import { groupRectangles } from "./groupRectangles";
import type { Detection } from "./haar.model";

/** The BBF image pyramid: four slots per level (the level, then three half-pixel-offset variants). */
export interface BbfPyramid {
  levels: Matrix<"u8">[];
  /** Scale factor between consecutive levels. */
  scale: number;
  /** Levels per octave plus one: the index distance to the half-size level. */
  next: number;
  /** Number of scales searched. */
  scaleTo: number;
}

/**
 * Builds the pyramid BBF searches: `interval` resampled levels per octave,
 * repeated halvings, and for the coarsest levels three variants shifted by
 * one source pixel, so features can sample between pixels.
 *
 * @param image - Single-channel `u8` matrix.
 * @param minWidth - Smallest object width.
 * @param minHeight - Smallest object height.
 * @param interval - Scales per octave.
 * @returns The pyramid.
 */
export const bbfPyramid = (
  image: Matrix<"u8">,
  minWidth: number,
  minHeight: number,
  interval: number,
): BbfPyramid => {
  const { width: sw, height: sh } = image;
  const scale = Math.pow(2, 1 / (interval + 1));
  const next = interval + 1;
  const scaleTo = (Math.log(Math.min(sw / minWidth, sh / minHeight)) / Math.log(scale)) | 0;
  const levels: Matrix<"u8">[] = new Array((scaleTo + next * 2) * 4);
  levels[0] = image;
  for (let i = 1; i <= interval; i++) {
    levels[i << 2] = resample(image, {
      width: (sw / Math.pow(scale, i)) | 0,
      height: (sh / Math.pow(scale, i)) | 0,
    });
  }
  for (let i = next; i < scaleTo + next * 2; i++) {
    levels[i << 2] = pyrDown(levels[(i - next) << 2]);
  }
  for (let i = next * 2; i < scaleTo + next * 2; i++) {
    const source = levels[(i - next) << 2];
    const w = source.width >> 1;
    const h = source.height >> 1;
    for (const [slot, ox, oy] of [
      [1, 1, 0],
      [2, 0, 1],
      [3, 1, 1],
    ] as const) {
      const variant = createMatrix(w, h);
      pyrDownPlane(source.data, variant.data, source.width, source.height, ox, oy);
      levels[(i << 2) + slot] = variant;
    }
  }
  return { levels, scale, next, scaleTo };
};

/**
 * Runs a BBF cascade over a pyramid and returns raw detections.
 *
 * @param pyramid - From {@link bbfPyramid}.
 * @param cascade - The cascade.
 * @returns Raw detections, in input pixels.
 */
export const bbfDetectRaw = (pyramid: BbfPyramid, cascade: BbfCascade): Detection[] => {
  const { levels, scale, next, scaleTo } = pyramid;
  const dx = [0, 1, 0, 1];
  const dy = [0, 0, 1, 1];
  const found: Detection[] = [];
  let scaleXY = 1;
  for (let i = 0; i < scaleTo; i++) {
    const i4 = i << 2;
    const full = levels[i4];
    const half = levels[i4 + (next << 2)];
    const quarter = levels[i4 + (next << 3)];
    const qw = quarter.width - (cascade.width >> 2);
    const qh = quarter.height - (cascade.height >> 2);
    const step = [full.width, half.width, quarter.width];
    // Feature offsets for this level's row lengths.
    const features = cascade.stage_classifier.map((stage) =>
      stage.feature.map((f) => ({
        size: f.size,
        px: f.px.map((x, q) => x + f.py[q] * step[f.pz[q]]),
        pz: f.pz,
        nx: f.nx.map((x, q) => x + f.ny[q] * step[f.nz[q]]),
        nz: f.nz,
      })),
    );
    for (let q = 0; q < 4; q++) {
      const planes = [full.data, half.data, levels[i4 + (next << 3) + q].data];
      for (let y = 0; y < qh; y++) {
        for (let x = 0; x < qw; x++) {
          const offsets = [
            x * 4 + dx[q] * 2 + (y * 4 + dy[q] * 2) * full.width,
            x * 2 + dx[q] + (y * 2 + dy[q]) * half.width,
            x + y * quarter.width,
          ];
          const at = (level: number, offset: number) => planes[level][offsets[level] + offset];
          let passed = true;
          let sum = 0;
          for (let j = 0; j < cascade.stage_classifier.length; j++) {
            const stage = cascade.stage_classifier[j];
            sum = 0;
            for (let k = 0; k < stage.count; k++) {
              const f = features[j][k];
              let pmin = at(f.pz[0], f.px[0]);
              let nmax = at(f.nz[0], f.nx[0]);
              if (pmin <= nmax) {
                sum += stage.alpha[k << 1];
                continue;
              }
              let shortcut = true;
              for (let n = 1; n < f.size; n++) {
                if (f.pz[n] >= 0) {
                  const p = at(f.pz[n], f.px[n]);
                  if (p < pmin) {
                    if (p <= nmax) {
                      shortcut = false;
                      break;
                    }
                    pmin = p;
                  }
                }
                if (f.nz[n] >= 0) {
                  const v = at(f.nz[n], f.nx[n]);
                  if (v > nmax) {
                    if (pmin <= v) {
                      shortcut = false;
                      break;
                    }
                    nmax = v;
                  }
                }
              }
              sum += shortcut ? stage.alpha[(k << 1) + 1] : stage.alpha[k << 1];
            }
            if (sum < stage.threshold) {
              passed = false;
              break;
            }
          }
          if (passed) {
            found.push({
              x: (x * 4 + dx[q] * 2) * scaleXY,
              y: (y * 4 + dy[q] * 2) * scaleXY,
              width: cascade.width * scaleXY,
              height: cascade.height * scaleXY,
              neighbors: 1,
              confidence: sum,
            });
            // The next window overlaps this one; skip it.
            x++;
          }
        }
      }
    }
    scaleXY *= scale;
  }
  return found;
};

/**
 * Finds objects with a BBF (Brightness Binary Feature) cascade, libccv's
 * fast alternative to HAAR: features compare pixel brightness directly
 * across three pyramid levels, with no integral images. Ships with a face
 * cascade (`pixelvision/cascades/bbf-face`). Faster than HAAR, a little less
 * accurate; libccv has since deprecated BBF in favour of neural detectors.
 *
 * Each call builds its own pyramid and keeps no state between calls, so
 * consecutive frames never affect each other's results.
 *
 * @param image - Single-channel `u8` matrix (gray).
 * @param cascade - The cascade.
 * @param options - Scales per octave, smallest size, grouping.
 * @returns Detections in pixels, largest support first.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel or is smaller than `minSize`.
 *
 * @example
 * import { bbfFace } from "pixelvision/cascades/bbf-face";
 * const faces = detectBbf(gray, bbfFace, { minNeighbors: 1 });
 */
export function detectBbf(
  image: Matrix<"u8">,
  cascade: BbfCascade,
  options: BbfOptions = {},
): Detection[] {
  assertType("detectBbf", image, "u8");
  assertChannels("detectBbf", image, 1);
  const { interval = 4, minSize = cascade.width * 2, minNeighbors = 1 } = options;
  if (image.width < minSize || image.height < minSize) {
    throw new RangeError(`detectBbf: the image is smaller than minSize (${minSize})`);
  }
  const raw = bbfDetectRaw(bbfPyramid(image, minSize, minSize, interval), cascade);
  const grouped = minNeighbors > 0 ? groupRectangles(raw, minNeighbors) : raw;
  return grouped.sort((a, b) => b.neighbors - a.neighbors || b.confidence - a.confidence);
}
