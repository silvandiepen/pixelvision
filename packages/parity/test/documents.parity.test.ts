import { findDocument } from "pixelvision";
import { beforeAll, describe, expect, it } from "vitest";
import { loadOpenCv } from "../src";
import type { OpenCv } from "../src";
import { jscanifyCorners } from "../src/jscanify";
import { largestCornerError, loadPhoto, photoManifest } from "../src/photos";

// Corners count as found within this many pixels of the labels (1024 x 683
// photos): about 1.2% of the diagonal, a little more than a rounded card's
// corner radius.
const TOLERANCE = 15;

let cv: OpenCv;
beforeAll(async () => {
  ({ cv } = await loadOpenCv());
}, 60_000);

const { documents } = photoManifest();
const whole = documents.filter((photo) => !photo.cut);
const findable = whole.filter((photo) => !photo.expectedMiss);

/** Each detector's largest corner error on a photo, or null when it found nothing. */
const results = new Map<string, { pixelvision: number | null; jscanify: number | null }>();
const measure = (file: string) => {
  const cached = results.get(file);
  if (cached) return cached;
  const photo = documents.find((d) => d.file === file)!;
  const image = loadPhoto(file);
  const pv = findDocument(image)?.corners ?? null;
  const js = jscanifyCorners(cv, image);
  const result = {
    pixelvision: pv && largestCornerError(pv, photo.corners),
    jscanify: js && largestCornerError(js, photo.corners),
  };
  results.set(file, result);
  return result;
};

describe("findDocument against jscanify on labelled photos", () => {
  it.each(findable.map((photo) => [photo.file, photo.tolerance ?? TOLERANCE] as const))(
    "%s: pixelvision finds the corners within %d px",
    (file, tolerance) => {
      const { pixelvision } = measure(file);
      expect(pixelvision, "found nothing").not.toBeNull();
      expect(pixelvision!).toBeLessThanOrEqual(tolerance);
    },
    30_000,
  );

  it.each(whole.filter((photo) => photo.expectedMiss).map((photo) => [photo.file] as const))(
    "%s: a known miss, for both detectors",
    (file) => {
      const { pixelvision, jscanify } = measure(file);
      // When either starts finding it, update the manifest.
      expect(pixelvision === null || pixelvision > TOLERANCE).toBe(true);
      expect(jscanify === null || jscanify > TOLERANCE).toBe(true);
    },
    30_000,
  );

  it.each(whole.map((photo) => [photo.file] as const))(
    "%s: pixelvision is at least as close as jscanify",
    (file) => {
      const { pixelvision, jscanify } = measure(file);
      if (jscanify === null || jscanify > TOLERANCE) return;
      expect(pixelvision!).toBeLessThanOrEqual(Math.max(TOLERANCE, jscanify));
    },
    30_000,
  );

  it("reports a document that runs off the image as cut, or finds it whole", () => {
    for (const photo of documents.filter((d) => d.cut)) {
      const found = findDocument(loadPhoto(photo.file), { reportCut: true });
      expect(found, photo.file).not.toBeNull();
    }
  });

  it("summarises both detectors", () => {
    const rows = whole.map((photo) => {
      const { pixelvision, jscanify } = measure(photo.file);
      const show = (e: number | null) => (e === null ? "none" : `${e.toFixed(1)} px`);
      const miss = photo.expectedMiss ? "  (known miss)" : "";
      return `${photo.file.padEnd(22)} pixelvision ${show(pixelvision).padEnd(9)} jscanify ${show(jscanify)}${miss}`;
    });
    console.log(["Largest corner error per photo:", ...rows].join("\n"));
    expect(rows).toHaveLength(whole.length);
  }, 120_000);
});
