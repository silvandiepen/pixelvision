import { createMatrix } from "pixelvision";
import type { Matrix } from "pixelvision";
import { describe, expect, it } from "vitest";
import type { Box } from "./geometry.model";
import {
  DOCUMENT_MEASURE,
  DOCUMENT_QUALITY,
  FACE_MEASURE,
  FACE_QUALITY,
  assessRegion,
  checkQuality,
  documentRegion,
} from "./quality";
import type {
  QualityAssessment,
  QualityIssue,
  QualityMeasure,
  QualityThresholds,
} from "./quality.model";
import { blurred, documentScene, exposed, faceScene, hazed, noisy } from "./testScenes";

// The calibration behind the default thresholds; the numbers it measures are recorded next to
// FACE_QUALITY and DOCUMENT_QUALITY in quality.ts. Every degraded frame must get the expected
// verdict, and each threshold must sit clear of both sides it separates.

/** One degraded frame and the verdict it should get. */
interface Case {
  name: string;
  image: Matrix<"u8">;
  expected: QualityIssue | null;
}

/** A scene to degrade, the region a detector would report, and how to measure it. */
interface Subject {
  name: string;
  image: Matrix<"u8">;
  region: Box;
}

/**
 * Every degradation of one sharp frame.
 *
 * @param image - The sharp frame.
 * @param overexposed - Gains that must read as too bright.
 * @param brightened - Gains that must still pass.
 * @param blurs - Gaussian blur sigmas that must read as blurry.
 * @param noisyBlurs - Whether blurred frames with sensor noise must read as blurry too.
 * @returns The cases.
 */
const degrade = (
  image: Matrix<"u8">,
  overexposed: number[],
  brightened: number[],
  blurs: number[],
  noisyBlurs: boolean,
): Case[] => [
  { name: "sharp", image, expected: null },
  ...[4, 10].map((sigma) => ({
    name: `noise ${sigma}`,
    image: noisy(image, sigma),
    expected: null,
  })),
  ...[0.6, 0.75].map((k) => ({ name: `dimmed x${k}`, image: exposed(image, k), expected: null })),
  ...brightened.map((k) => ({
    name: `brightened x${k}`,
    image: exposed(image, k),
    expected: null,
  })),
  ...blurs.flatMap((sigma) => [
    { name: `blur ${sigma}`, image: blurred(image, sigma), expected: "blurry" as const },
    ...(noisyBlurs
      ? [
          {
            name: `blur ${sigma} + noise 4`,
            image: noisy(blurred(image, sigma), 4),
            expected: "blurry" as const,
          },
        ]
      : []),
  ]),
  ...[0.15, 0.25, 0.4].map((k) => ({
    name: `darkened x${k}`,
    image: exposed(image, k),
    expected: "dark" as const,
  })),
  ...overexposed.map((k) => ({
    name: `overexposed x${k}`,
    image: exposed(image, k),
    expected: "bright" as const,
  })),
  { name: "hazed", image: hazed(image, 0.3), expected: "flat" as const },
];

/**
 * Cuts a frame down to a region and a margin around it.
 *
 * @param image - The frame.
 * @param region - The region.
 * @param margin - Pixels kept on every side.
 * @returns The smaller frame and the region in its pixels.
 */
const cropAround = (image: Matrix<"u8">, region: Box, margin: number) => {
  const x0 = Math.max(0, Math.floor(region.x) - margin);
  const y0 = Math.max(0, Math.floor(region.y) - margin);
  const x1 = Math.min(image.width, Math.ceil(region.x + region.width) + margin);
  const y1 = Math.min(image.height, Math.ceil(region.y + region.height) + margin);
  const out = createMatrix(x1 - x0, y1 - y0);
  for (let y = y0; y < y1; y++) {
    out.data.set(
      image.data.subarray(y * image.width + x0, y * image.width + x1),
      (y - y0) * out.width,
    );
  }
  return { image: out, region: { ...region, x: region.x - x0, y: region.y - y0 } };
};

/**
 * Measures every case of every subject and checks the verdicts and margins.
 *
 * @param subjects - The scenes.
 * @param cases - Degradations of a scene's frame.
 * @param thresholds - The defaults under test.
 * @param measure - How to measure.
 * @returns The measurements by expected verdict, for the margin checks.
 */
const calibrate = (
  subjects: Subject[],
  cases: (image: Matrix<"u8">) => Case[],
  thresholds: QualityThresholds,
  measure: QualityMeasure,
) => {
  const measured = new Map<QualityIssue | "good", QualityAssessment[]>();
  const verdicts: string[] = [];
  for (const subject of subjects) {
    // Degrade only the region and a margin wider than the largest blur kernel's reach.
    const { image, region } = cropAround(subject.image, subject.region, 16);
    for (const c of cases(image)) {
      const assessment = assessRegion(c.image, region, measure);
      const { issue } = checkQuality(assessment, thresholds);
      if (issue !== c.expected) verdicts.push(`${subject.name} ${c.name}: ${issue}`);
      const key = c.expected ?? "good";
      measured.set(key, [...(measured.get(key) ?? []), assessment]);
    }
  }
  const of = (key: QualityIssue | "good", pick: (q: QualityAssessment) => number) =>
    measured.get(key)!.map(pick);
  if (process.env.QUALITY_REPORT) {
    const range = (values: number[]) =>
      `${Math.min(...values).toFixed(1)}-${Math.max(...values).toFixed(1)}`;
    const report = Object.fromEntries(
      [...measured.keys()].map((key) => [
        key,
        {
          sharpness: range(of(key, (q) => q.sharpness)),
          brightness: range(of(key, (q) => q.brightness)),
          contrast: range(of(key, (q) => q.contrast)),
        },
      ]),
    );
    console.log(JSON.stringify(report, null, 2));
  }
  return { verdicts, of };
};

describe("default thresholds", () => {
  // One test per subject size, so each gets the per-test time limit on slow CI runners.
  it.each([
    // A blur of sigma 2 frame pixels on the largest face (x1.6, 179 px wide) is about sigma 0.9
    // once the face is shrunk to the measuring size: as crisp as a sharp real face there, so
    // it can't be rejected without rejecting usable faces (see FACE_QUALITY).
    { scale: 0.8, blurs: [2, 3, 4] },
    { scale: 1.2, blurs: [2, 3, 4] },
    { scale: 1.6, blurs: [3, 4] },
  ])(
    "separate sharp, blurred (also with noise), dark, overexposed and hazed faces at x$scale",
    ({ scale, blurs }) => {
      const { image, box } = faceScene(480, 360, scale);
      const subjects = [{ name: `face x${scale}`, image, region: box }];
      const { verdicts, of } = calibrate(
        subjects,
        (image) => degrade(image, [1.6, 2.2, 3], [1.15, 1.25], blurs, true),
        FACE_QUALITY,
        FACE_MEASURE,
      );
      expect(verdicts).toEqual([]);

      const sharpness = (q: QualityAssessment) => q.sharpness;
      const brightness = (q: QualityAssessment) => q.brightness;
      const contrast = (q: QualityAssessment) => q.contrast;
      // Sharpness: a fifth clear of both sides.
      expect(Math.min(...of("good", sharpness))).toBeGreaterThan(FACE_QUALITY.minSharpness * 1.2);
      expect(Math.max(...of("blurry", sharpness))).toBeLessThan(FACE_QUALITY.minSharpness / 1.2);
      // Light and contrast: at least 6 gray levels clear of both sides.
      expect(Math.min(...of("good", brightness))).toBeGreaterThan(FACE_QUALITY.minBrightness + 6);
      expect(Math.max(...of("dark", brightness))).toBeLessThan(FACE_QUALITY.minBrightness - 6);
      expect(Math.max(...of("good", brightness))).toBeLessThan(FACE_QUALITY.maxBrightness - 6);
      expect(Math.min(...of("bright", brightness))).toBeGreaterThan(FACE_QUALITY.maxBrightness + 6);
      expect(Math.min(...of("good", contrast))).toBeGreaterThan(FACE_QUALITY.minContrast + 6);
      expect(Math.max(...of("flat", contrast))).toBeLessThan(FACE_QUALITY.minContrast - 6);
    },
  );

  it.each([320, 480, 640])(
    "separate sharp, blurred, dark, overexposed and hazed documents in %i px",
    (width) => {
      const { image, corners } = documentScene(width, (width * 3) / 4);
      const subjects = [{ name: `document in ${width}`, image, region: documentRegion(corners!) }];
      const { verdicts, of } = calibrate(
        subjects,
        (image) => degrade(image, [2.2, 3], [1.15, 1.25, 1.6], [1, 1.5, 2, 3, 4], true),
        DOCUMENT_QUALITY,
        DOCUMENT_MEASURE,
      );
      expect(verdicts).toEqual([]);

      const sharpness = (q: QualityAssessment) => q.sharpness;
      const brightness = (q: QualityAssessment) => q.brightness;
      const contrast = (q: QualityAssessment) => q.contrast;
      expect(Math.min(...of("good", sharpness))).toBeGreaterThan(
        DOCUMENT_QUALITY.minSharpness * 1.2,
      );
      expect(Math.max(...of("blurry", sharpness))).toBeLessThan(
        DOCUMENT_QUALITY.minSharpness / 1.2,
      );
      expect(Math.min(...of("good", brightness))).toBeGreaterThan(
        DOCUMENT_QUALITY.minBrightness + 6,
      );
      expect(Math.max(...of("dark", brightness))).toBeLessThan(DOCUMENT_QUALITY.minBrightness - 6);
      expect(Math.max(...of("good", brightness))).toBeLessThan(DOCUMENT_QUALITY.maxBrightness - 6);
      expect(Math.min(...of("bright", brightness))).toBeGreaterThan(
        DOCUMENT_QUALITY.maxBrightness + 4,
      );
      expect(Math.min(...of("good", contrast))).toBeGreaterThan(DOCUMENT_QUALITY.minContrast + 6);
      expect(Math.max(...of("flat", contrast))).toBeLessThan(DOCUMENT_QUALITY.minContrast - 6);
    },
  );
});
