import jsfeat from "jsfeat";
import { canny, equalizeHistogram, groupRectangles, integralImage } from "pixelvision";
import type { HaarCascade } from "pixelvision";
import { describe, expect, it } from "vitest";
import { haarSingleScale } from "../../pixelvision/src/detect/haar";
import { gray, loadCascade, standardFixtures } from "../src";

const cascades = [
  "frontalface",
  "eye",
  "mouth",
  "profileface",
  "upperbody",
  "handfist",
  "handopen",
];

/** A cascade cut to its first stages, so it fires on ordinary textures. */
const truncated = (name: string, stages: number): HaarCascade => {
  const full = loadCascade<HaarCascade>(name);
  return { ...full, complexClassifiers: full.complexClassifiers.slice(0, stages) };
};

describe("haarSingleScale matches jsfeat.haar.detect_single_scale", () => {
  // Detections compared per cascade: smooth images may legitimately give none,
  // but every cascade must be exercised somewhere.
  const compared = new Map<string, number>();
  for (const name of cascades) {
    for (const fixture of standardFixtures.filter((f) => f.width >= 60 && f.height >= 60)) {
      for (const pruning of [false, true]) {
        it(`${name}, ${pruning ? "with" : "without"} edge pruning: ${fixture.name}`, () => {
          const image = equalizeHistogram(gray(fixture));
          const cascade = truncated(name, 3);
          const tables = integralImage(image, { sum: true, squares: true, tilted: true });
          const edges = integralImage(canny(image, { low: 10, high: 50 })).sum!.data;
          const sum = tables.sum!.data;
          const squares = tables.squares!.data;
          const tilted = tables.tilted!.data;
          jsfeat.haar.edges_density = 0.07;

          for (const scale of [1, 1.2, 1.728, 2.5]) {
            const reference = jsfeat.haar.detect_single_scale(
              sum,
              squares,
              tilted,
              pruning ? edges : null,
              image.width,
              image.height,
              scale,
              cascade,
            );
            const ours = haarSingleScale(
              { sum, squares, tilted, edges: pruning ? edges : undefined },
              image.width,
              image.height,
              scale,
              cascade,
              0.07,
            );
            expect(ours.map((r) => [r.x, r.y, r.width, r.height, r.confidence])).toEqual(
              reference.map((r) => [r.x, r.y, r.width, r.height, r.confidence]),
            );
            compared.set(name, (compared.get(name) ?? 0) + ours.length);
          }
        });
      }
    }
    it(`${name}: compared real detections`, () => {
      expect(compared.get(name)).toBeGreaterThan(0);
    });
  }
});

describe("groupRectangles matches jsfeat.haar.group_rectangles (rounded as OpenCV)", () => {
  for (const minNeighbors of [1, 2, 3]) {
    it(`min ${minNeighbors} neighbours`, () => {
      const image = equalizeHistogram(
        gray(standardFixtures.find((f) => f.name.startsWith("card 160"))!),
      );
      const cascade = truncated("frontalface", 2);
      const tables = integralImage(image, { sum: true, squares: true });
      const raw = [1, 1.2, 1.44, 1.728].flatMap((scale) =>
        haarSingleScale(
          { sum: tables.sum!.data, squares: tables.squares!.data },
          image.width,
          image.height,
          scale,
          cascade,
          0,
        ),
      );
      expect(raw.length).toBeGreaterThan(10);

      const reference = jsfeat.haar.group_rectangles(
        raw.map((r) => ({ ...r })),
        minNeighbors,
      );
      const ours = groupRectangles(raw, minNeighbors);

      // jsfeat averages as (sum * 2 + n) / (2n) without flooring; OpenCV floors.
      expect(ours).toEqual(
        reference.map((r) => ({
          x: Math.floor(r.x),
          y: Math.floor(r.y),
          width: Math.floor(r.width),
          height: Math.floor(r.height),
          neighbors: r.neighbors,
          confidence: r.confidence,
        })),
      );
    });
  }
});
