import jsfeat from "jsfeat";
import { describeOrb, detectFast, detectYape06, gaussianBlur } from "pixelvision";
import type { Keypoint } from "pixelvision";
import { describe, expect, it } from "vitest";
import { yapeScores } from "../../pixelvision/src/features/yape";
import { expectIdentical, gray, jsfeatMatrix, standardFixtures, toJsfeat } from "../src";

const fixtures = standardFixtures.filter((f) => f.width >= 20 && f.height >= 20);

/** Allocates jsfeat's preallocated keypoint array. */
const keypointBuffer = (count: number) =>
  Array.from({ length: count }, () => new jsfeat.keypoint_t());

describe("detectFast matches jsfeat.fast_corners", () => {
  for (const threshold of [10, 20, 40]) {
    for (const fixture of fixtures) {
      it(`threshold ${threshold}: ${fixture.name}`, () => {
        const input = gaussianBlur(gray(fixture), { kernelSize: 3 });
        jsfeat.fast_corners.set_threshold(threshold);
        const buffer = keypointBuffer(input.width * input.height);
        const count = jsfeat.fast_corners.detect(toJsfeat(input), buffer, 3);
        const reference = buffer.slice(0, count).map(({ x, y, score }) => `${x},${y},${score}`);

        const ours = detectFast(input, { threshold });
        const keys = ours.map(({ x, y, score }) => `${x},${y},${score}`);

        // Every jsfeat corner is found with the same score, except next to the
        // row jsfeat never searched (h - 4): there a stronger neighbour on that
        // row correctly suppresses it.
        const found = new Set(keys);
        for (const key of reference) {
          if (found.has(key)) continue;
          const [x, y, score] = key.split(",").map(Number);
          expect(y, key).toBe(input.height - 5);
          const stronger = ours.some(
            (c) => c.y === input.height - 4 && Math.abs(c.x - x) <= 1 && c.score > score,
          );
          expect(stronger, key).toBe(true);
        }
        // The extra corners are what jsfeat's off-by-one dropped: the last
        // corner of a row (at most one per row), or the row it never searched.
        const known = new Set(reference);
        const extra = ours.filter((c) => !known.has(`${c.x},${c.y},${c.score}`));
        const byRow = new Map<number, Keypoint[]>();
        for (const c of extra) byRow.set(c.y, [...(byRow.get(c.y) ?? []), c]);
        for (const [y, corners] of byRow) {
          if (y === input.height - 4) continue;
          expect(corners.length, `row ${y}`).toBe(1);
          const rightmostInRow = Math.max(...ours.filter((c) => c.y === y).map((c) => c.x));
          expect(corners[0].x, `row ${y}`).toBe(rightmostInRow);
        }
      });
    }
  }
});

describe("detectYape06 matches jsfeat.yape06", () => {
  for (const [laplacian, eigen] of [
    [30, 25],
    [10, 10],
    [50, 40],
  ]) {
    for (const fixture of fixtures) {
      it(`thresholds ${laplacian}/${eigen}: ${fixture.name}`, () => {
        const input = gaussianBlur(gray(fixture), { kernelSize: 5 });
        jsfeat.yape06.laplacian_threshold = laplacian;
        jsfeat.yape06.min_eigen_value_threshold = eigen;
        const buffer = keypointBuffer(input.width * input.height);
        const count = jsfeat.yape06.detect(toJsfeat(input), buffer, 5);

        const ours = detectYape06(input, {
          laplacianThreshold: laplacian,
          minEigenvalueThreshold: eigen,
        });

        expect(ours.map(({ x, y, score }) => [x, y, score])).toEqual(
          buffer.slice(0, count).map(({ x, y, score }) => [x, y, score]),
        );
      });
    }
  }
});

describe("yapeScores matches jsfeat.yape's score map", () => {
  for (const radius of [3, 4, 5, 7]) {
    for (const tau of [5, 7, 15]) {
      for (const fixture of fixtures) {
        it(`radius ${radius}, tau ${tau}: ${fixture.name}`, () => {
          const input = gaussianBlur(gray(fixture), { kernelSize: 3 });
          jsfeat.yape.init(input.width, input.height, radius, 1);
          jsfeat.yape.tau = tau;
          jsfeat.yape.detect(toJsfeat(input), keypointBuffer(input.width * input.height), 4);
          const reference = jsfeat.yape.level_tables[0].scores;

          const { scores, sx, sy, ex, ey } = yapeScores(input, radius, tau, 4);

          const region = (data: ArrayLike<number>) => {
            const values: number[] = [];
            for (let y = sy; y < ey; y++)
              for (let x = sx; x < ex; x++) values.push(data[y * input.width + x]);
            return values;
          };
          const ourRegion = region(scores);
          expectIdentical(ourRegion, region(reference), ourRegion.length);
        });
      }
    }
  }
});

describe("describeOrb matches jsfeat.orb.describe away from the edges", () => {
  for (const fixture of fixtures.filter((f) => f.width >= 60 && f.height >= 60)) {
    it(fixture.name, () => {
      const input = gaussianBlur(gray(fixture), { kernelSize: 5 });
      // Keypoints whose rotated 32x32 patch stays inside the image.
      const margin = 24;
      const keypoints: Keypoint[] = [];
      for (let y = margin; y < input.height - margin; y += 7) {
        for (let x = margin; x < input.width - margin; x += 9) {
          keypoints.push({ x, y, score: 0, angle: ((x * 31 + y * 17) % 628) / 100 - 3.14 });
        }
      }
      const corners = keypoints.map((k) => new jsfeat.keypoint_t(k.x, k.y, 0, 0, k.angle));
      const reference = jsfeatMatrix(32, corners.length, "u8");
      jsfeat.orb.describe(toJsfeat(input), corners, corners.length, reference);

      const ours = describeOrb(input, keypoints);

      expectIdentical(ours.data, reference.data, 32 * keypoints.length);
    });
  }
});
