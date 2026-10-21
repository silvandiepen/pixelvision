import { createMatrix, equalizeHistogram } from "pixelvision";
import type { BbfCascade } from "pixelvision";
import { describe, expect, it } from "vitest";
import { bbfDetectRaw, bbfPyramid } from "../../pixelvision/src/detect/bbf";
import {
  expectIdentical,
  gray,
  jsfeatBbfWithoutDrift,
  loadCascade,
  standardFixtures,
  toJsfeat,
} from "../src";

/** The BBF face cascade, cut to its first stages so it fires on ordinary texture. */
const truncated = (stages: number): BbfCascade => {
  const full = loadCascade<BbfCascade>("bbf_face");
  return { ...full, stage_classifier: full.stage_classifier.slice(0, stages) };
};

/**
 * jsfeat keeps one shared pyramid and only resets its level 0 when the size
 * changes (a bug pixelvision fixes). Building a tiny pyramid first forces a
 * fresh one, so each comparison starts clean.
 */
const bbf = jsfeatBbfWithoutDrift();
const resetJsfeatPyramid = () => bbf.build_pyramid(toJsfeat(createMatrix(60, 60)), 24, 24, 1);

// Compared with jsfeat's own BBF source minus its row-offset drift (see jsfeatPatched.ts).
describe("bbfPyramid and bbfDetectRaw match jsfeat.bbf (without its offset drift)", () => {
  let compared = 0;
  for (const fixture of standardFixtures.filter((f) => f.width >= 90 && f.height >= 90)) {
    for (const [interval, stages] of [
      [4, 2],
      [2, 3],
      [4, 16],
    ] as const) {
      it(`interval ${interval}, ${stages} stages: ${fixture.name}`, () => {
        const image = equalizeHistogram(gray(fixture));
        const cascade = truncated(stages);
        const jsCascade = structuredClone(cascade) as unknown as object;
        bbf.prepare_cascade(jsCascade);
        resetJsfeatPyramid();
        const reference = bbf.build_pyramid(toJsfeat(image), 48, 48, interval);
        const raw = bbf.detect(reference, jsCascade);

        const pyramid = bbfPyramid(image, 48, 48, interval);
        pyramid.levels.forEach((level, k) => {
          if (level && k > 0)
            expectIdentical(level.data, reference.data[k].data, level.width * level.height);
        });
        const ours = bbfDetectRaw(pyramid, cascade);

        expect(ours.map((r) => [r.x, r.y, r.width, r.height, r.confidence])).toEqual(
          raw.map((r) => [r.x, r.y, r.width, r.height, r.confidence]),
        );
        compared += ours.length;
      });
    }
  }
  it("compared real detections", () => {
    expect(compared).toBeGreaterThan(0);
  });
});
