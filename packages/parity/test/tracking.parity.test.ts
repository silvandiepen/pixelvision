import jsfeat from "jsfeat";
import type { Matrix } from "pixelvision";
import { buildPyramid, gaussianBlur, trackPoints, warpAffine } from "pixelvision";
import { describe, expect, it } from "vitest";
import { expectIdentical, gray, standardFixtures } from "../src";

/** Builds a jsfeat pyramid from a gray image. */
const jsfeatPyramid = (image: Matrix<"u8">, levels: number) => {
  const pyramid = new jsfeat.pyramid_t(levels);
  pyramid.allocate(image.width, image.height, jsfeat.U8C1_t);
  pyramid.data[0].data.set(image.data);
  pyramid.build(pyramid.data[0], true);
  return pyramid;
};

describe("buildPyramid matches jsfeat.pyramid_t", () => {
  for (const fixture of standardFixtures.filter((f) => f.width >= 16 && f.height >= 16)) {
    it(fixture.name, () => {
      const image = gray(fixture);
      const reference = jsfeatPyramid(image, 3);

      buildPyramid(image, 3).forEach((level, i) =>
        expectIdentical(level.data, reference.data[i].data, level.width * level.height),
      );
    });
  }
});

describe("trackPoints matches jsfeat.optical_flow_lk.track", () => {
  const shifts: Array<[number, number]> = [
    [0, 0],
    [2.5, -1.25],
    [6, 4],
    [-9.5, 3.75],
  ];
  const cases = [
    { windowSize: 9, levels: 3 },
    { windowSize: 15, levels: 2 },
    { windowSize: 21, levels: 3 },
  ];
  for (const fixture of standardFixtures.filter((f) => f.width >= 90 && f.height >= 70)) {
    for (const [dx, dy] of shifts) {
      for (const { windowSize, levels } of cases) {
        it(`${fixture.name}, shift (${dx}, ${dy}), window ${windowSize}, ${levels} levels`, () => {
          const previous = gaussianBlur(gray(fixture), { kernelSize: 5 });
          // Output (x, y) reads input (x - dx, y - dy): content moves by (dx, dy).
          const next = warpAffine(previous, [1, 0, -dx, 0, 1, -dy], { fill: 0 });
          // A grid inside the margin: textured and flat points alike (flat ones are lost).
          const margin = windowSize + 12;
          const points: Array<{ x: number; y: number }> = [];
          for (let y = margin; y < previous.height - margin; y += 6) {
            for (let x = margin; x < previous.width - margin; x += 7)
              points.push({ x: x + 0.3, y: y - 0.2 });
          }
          expect(points.length).toBeGreaterThan(3);

          const prevXY = Float64Array.from(points.flatMap((p) => [p.x, p.y]));
          const currXY = new Float64Array(prevXY.length);
          const status = new Uint8Array(points.length);
          jsfeat.optical_flow_lk.track(
            jsfeatPyramid(previous, levels),
            jsfeatPyramid(next, levels),
            prevXY,
            currXY,
            points.length,
            windowSize,
            30,
            status,
            0.01,
            0.0001,
          );

          const tracked = trackPoints(previous, next, points, { windowSize, levels });

          expectIdentical(
            tracked.flatMap((p) => [p.x, p.y]),
            currXY,
            currXY.length,
          );
          expect(tracked.map((p) => (p.tracked ? 1 : 0))).toEqual(Array.from(status));
        });
      }
    }
  }
});
