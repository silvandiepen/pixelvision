import { createMatrix, resample } from "pixelvision";
import type { Point } from "pixelvision";
import type { Box } from "./geometry.model";
import type { LabelKey } from "./labels.model";
import type {
  QualityAssessment,
  QualityCheck,
  QualityIssue,
  QualitySubject,
  QualityThresholds,
} from "./quality.model";
import { sharpness } from "./sharpness";
import type { GrayPixels } from "./sharpness.model";

/** Long side, in pixels, a face region is resampled to before it is measured. */
export const QUALITY_SIZE = 96;

/**
 * Long side, in pixels, a document region is resampled to: a document's
 * detail (text, edges) is finer than a face's, so it is measured larger.
 */
export const DOCUMENT_QUALITY_SIZE = 160;

/** Standard deviation, in gray levels, every region's sharpness is measured at. */
export const REFERENCE_CONTRAST = 50;

// Calibration (quality.calibration.test.ts; QUALITY_REPORT=1 prints the numbers). Drawn faces
// at the sizes the oval accepts in a 480 px detection frame (box 90-215 px wide) and a plain
// light document on a dark surface (region 180-360 px), each degraded. Should pass: the sharp frame, sensor noise sigma 4 and 10,
// dimmed x0.6 and x0.75, brightened x1.15 and x1.25 (documents: up to x1.6). Should fail:
// Gaussian blur sigma 1, 1.5, 2, 3 and 4 frame pixels (also with noise sigma 4) as blurry;
// darkened x0.15, x0.25 and x0.4 as dark; overexposed with clipping x1.6, x2.2 and x3
// (documents: x2.2 and x3) as bright; hazed, 30% of the frame over a flat gray (a smudged lens),
// as flat. Measured:
//
//   face       sharpness  good >= 710.8        (drawn; see real faces below)
//              brightness good 96.2-203.4      dark <= 65.0           -> minBrightness 80
//                                              overexposed >= 221.8   -> maxBrightness 212
//              contrast   good >= 30.8         hazed <= 15.5          -> minContrast 22
//   document   sharpness  good >= 304.2        blurred <= 171.5       -> minSharpness 230
//              brightness good 103.9-207.4     dark <= 69.3           -> minBrightness 85
//                                              overexposed >= 219.1   -> maxBrightness 214
//              contrast   good >= 44.0         hazed <= 22.2          -> minContrast 33
//
// The document's region includes some of the surface around it, so its brightness moves little
// until the whole scene is overexposed; the plain page itself clips at x1.15. Strong sensor
// noise (sigma 10) on a blurred frame raises the Laplacian variance past the sharpness
// threshold: noise reads as detail.
//
// Drawn faces have far crisper edges than real ones, so the face sharpness default comes from
// real photos instead: the 12 faces of 51-109 px in a group photo (measured with
// @pixelvision/face-neural boxes, not kept in the repository):
//
//   real face  sharpness  usable 122-619       blur sigma 1: 14-180   sigma 2: 7-44   sigma 3: 6-17
//                                                                     -> minSharpness 70
//
// 70 rejects a blur of sigma 2 or more on every face (1.6x below it) and passes every usable
// one (the softest is 1.7x above it). A sigma 1 blur overlaps soft but usable faces and is let through, and the Laplacian
// variance counts sensor noise as detail, so a blurred face with visible noise passes too. On
// the drawn faces the default rejects a clean blur from sigma 3 (at most 59.6). Check the defaults against footage from the
// cameras you support and adjust them with the `min-sharpness`, `min-brightness`,
// `max-brightness` and `min-contrast` attributes.

/** Default face thresholds; see the calibration notes above. */
export const FACE_QUALITY: QualityThresholds = {
  minSharpness: 70,
  minBrightness: 80,
  maxBrightness: 212,
  minContrast: 22,
};

/** Default document thresholds; see the calibration notes above. */
export const DOCUMENT_QUALITY: QualityThresholds = {
  minSharpness: 230,
  minBrightness: 85,
  maxBrightness: 214,
  minContrast: 33,
};

/**
 * Measures how sharp, bright and contrasty a region of a frame is. The
 * region is cut out and resampled so its long side is `size` pixels (area
 * averaging when shrinking, bilinear when enlarging), then measured:
 * brightness is the mean and contrast the standard deviation of the gray
 * levels, and sharpness the variance of the 4-neighbour Laplacian, scaled
 * to {@link REFERENCE_CONTRAST} (multiplied by `(50 / contrast)²`) so
 * that dimmer light doesn't read as blur. Because every region is
 * measured at the same size and contrast, one set of thresholds works
 * whatever the detection frame size, how close the face or document is,
 * and how bright the scene is.
 *
 * @param gray - Gray pixels of the detection frame, e.g. from `grayscale`.
 * @param box - The face or document region, in the frame's pixels; clipped to the frame.
 * @param size - Long side to measure at (default {@link QUALITY_SIZE}; documents use
 *   {@link DOCUMENT_QUALITY_SIZE}).
 * @returns The assessment; all zero when the region holds no pixels.
 *
 * @example
 * const quality = assessRegion(grayscale(frame), faceBox);
 * if (checkQuality(quality, FACE_QUALITY).ok) keep(frame);
 */
export function assessRegion(gray: GrayPixels, box: Box, size = QUALITY_SIZE): QualityAssessment {
  const x0 = Math.max(0, Math.floor(box.x));
  const y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.min(gray.width, Math.ceil(box.x + box.width));
  const y1 = Math.min(gray.height, Math.ceil(box.y + box.height));
  const width = x1 - x0;
  const height = y1 - y0;
  if (width <= 0 || height <= 0) return { sharpness: 0, brightness: 0, contrast: 0 };
  const crop = createMatrix(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++)
      crop.data[y * width + x] = gray.data[(y0 + y) * gray.width + x0 + x];
  }
  const scale = size / Math.max(width, height);
  const region = resample(crop, {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  });
  const { data } = region;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    sumSq += data[i] * data[i];
  }
  const brightness = sum / data.length;
  const contrast = Math.sqrt(Math.max(0, sumSq / data.length - brightness * brightness));
  // Laplacian variance grows with the square of the contrast: measure it as if the region had
  // the reference contrast, so a dim but steady frame doesn't read as a blurred one.
  const gain = contrast > 0 ? (REFERENCE_CONTRAST / contrast) ** 2 : 0;
  return { sharpness: sharpness(region) * gain, brightness, contrast };
}

/**
 * Checks an assessment against thresholds. Light is checked before
 * sharpness: a dark frame also measures soft, and more light is the fix.
 *
 * @param assessment - From {@link assessRegion}.
 * @param thresholds - The limits.
 * @returns Whether the frame is good, and the first issue when it isn't.
 *
 * @example
 * const { ok, issue } = checkQuality(assessRegion(gray, box), FACE_QUALITY);
 */
export function checkQuality(
  assessment: QualityAssessment,
  thresholds: QualityThresholds,
): QualityCheck {
  const issue: QualityIssue | null =
    assessment.brightness < thresholds.minBrightness
      ? "dark"
      : assessment.brightness > thresholds.maxBrightness
        ? "bright"
        : assessment.contrast < thresholds.minContrast
          ? "flat"
          : assessment.sharpness < thresholds.minSharpness
            ? "blurry"
            : null;
  return { ok: issue === null, issue };
}

const HINTS: Record<QualitySubject, Record<QualityIssue, LabelKey>> = {
  face: {
    dark: "faceTooDark",
    bright: "faceTooBright",
    flat: "faceLowContrast",
    blurry: "faceBlurry",
  },
  document: {
    dark: "docTooDark",
    bright: "docTooBright",
    flat: "docLowContrast",
    blurry: "docBlurry",
  },
};

/**
 * The hint that asks the person to fix a quality issue.
 *
 * @param issue - From {@link checkQuality}.
 * @param subject - Face or document: the wording differs.
 * @returns The label key, or undefined without an issue.
 *
 * @example
 * const key = qualityHint(checkQuality(quality, FACE_QUALITY).issue, "face");
 */
export function qualityHint(
  issue: QualityIssue | null | undefined,
  subject: QualitySubject,
): LabelKey | undefined {
  return issue ? HINTS[subject][issue] : undefined;
}

/**
 * The region to measure for a document: the bounding box of its corners,
 * grown by a margin on every side so the document's edges, which carry
 * most of its detail when the page itself is plain, fall inside it.
 *
 * @param corners - The document's corners.
 * @param margin - Margin as a fraction of the box's width and height (default 0.05).
 * @returns The region.
 *
 * @example
 * const quality = assessRegion(gray, documentRegion(found.corners));
 */
export function documentRegion(corners: readonly Point[], margin = 0.05): Box {
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;
  return {
    x: x - width * margin,
    y: y - height * margin,
    width: width * (1 + 2 * margin),
    height: height * (1 + 2 * margin),
  };
}

/**
 * A one-line summary of an assessment and its verdict, e.g. for a debug view.
 *
 * @param quality - The assessment, if any.
 * @param thresholds - The gate.
 * @returns Rounded sharpness, brightness and contrast and the issue (or "ok"); "-" without one.
 *
 * @example
 * describeQuality({ sharpness: 712.4, brightness: 150, contrast: 48 }, FACE_QUALITY);
 * // "s 712 b 150 c 48 ok"
 */
export function describeQuality(
  quality: QualityAssessment | undefined,
  thresholds: QualityThresholds,
): string {
  if (!quality) return "-";
  const { sharpness: s, brightness: b, contrast: c } = quality;
  const verdict = checkQuality(quality, thresholds).issue ?? "ok";
  return `s ${Math.round(s)} b ${Math.round(b)} c ${Math.round(c)} ${verdict}`;
}
