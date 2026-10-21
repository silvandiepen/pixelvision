import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { warpAffine } from "../imgproc/warp";
import { noiseImage } from "../test-images";
import { trackPoints } from "./opticalFlow";
import { buildPyramid } from "./pyramid";

/**
 * A scene with structure at several scales, like a real image: coarse
 * pyramid levels of plain blurred noise are featureless, so coarse-to-fine
 * tracking of large motion needs low-frequency content too.
 */
const scene = (() => {
  const fine = gaussianBlur(noiseImage(160, 120, 3), { kernelSize: 5 });
  const mid = gaussianBlur(noiseImage(160, 120, 5), { sigma: 2.5 });
  const coarse = gaussianBlur(noiseImage(160, 120, 8), { sigma: 6 });
  const image = createMatrix(160, 120);
  for (let i = 0; i < image.data.length; i++) {
    const value =
      128 + (fine.data[i] - 128) * 0.6 + (mid.data[i] - 128) * 2.5 + (coarse.data[i] - 128) * 6;
    image.data[i] = Math.max(0, Math.min(255, value));
  }
  return image;
})();
/** The scene with its content moved by (dx, dy). */
const moved = (dx: number, dy: number) => warpAffine(scene, [1, 0, -dx, 0, 1, -dy]);
const grid = () => {
  const points: Array<{ x: number; y: number }> = [];
  for (let y = 40; y <= 80; y += 10) for (let x = 40; x <= 120; x += 10) points.push({ x, y });
  return points;
};

describe("trackPoints", () => {
  it.each([
    [0, 0],
    [1.5, -0.75],
    [7, 5],
    [-12, 6],
    [-15, 8],
  ])("follows textured points moved by (%s, %s)", (dx, dy) => {
    const points = grid();

    const tracked = trackPoints(scene, moved(dx, dy), points, { windowSize: 15, levels: 3 });

    // Lucas-Kanade can lose a point on weak texture; nearly all must land within 0.2 px.
    const accurate = tracked.filter(
      (p, i) =>
        p.tracked &&
        Math.abs(p.x - (points[i].x + dx)) < 0.2 &&
        Math.abs(p.y - (points[i].y + dy)) < 0.2,
    );
    expect(accurate.length).toBeGreaterThanOrEqual(points.length * 0.9);
  });

  it("accepts prebuilt pyramids and gives the same result", () => {
    const next = moved(3, 2);
    const points = grid();

    expect(trackPoints(buildPyramid(scene, 3), buildPyramid(next, 3), points)).toEqual(
      trackPoints(scene, next, points),
    );
  });

  it("loses points near the edge and points without texture", () => {
    const flat = createMatrix(80, 80);
    flat.data.fill(100);

    const [edge] = trackPoints(scene, scene, [{ x: 2, y: 60 }]);
    const [blank] = trackPoints(flat, flat, [{ x: 40, y: 40 }]);

    expect(edge.tracked).toBe(false);
    expect(blank.tracked).toBe(false);
  });

  it("loses points whose window is carried out of the image", () => {
    // The window starts 2.5 px inside; the content moves 6 px left.
    const [p] = trackPoints(scene, moved(-6, 0), [{ x: 12, y: 60 }], { levels: 1 });

    expect(p.tracked).toBe(false);
  });

  it("stops early on oscillation and respects maxIterations", () => {
    const next = moved(2.3, 1.7);
    const one = trackPoints(scene, next, grid(), { maxIterations: 1, levels: 1 });
    const many = trackPoints(scene, next, grid(), { maxIterations: 30, levels: 1 });

    expect(one).not.toEqual(many);
  });

  it("returns nothing for no points", () => {
    expect(trackPoints(scene, scene, [])).toEqual([]);
  });

  it("rejects frames of different sizes or depths", () => {
    expect(() => trackPoints(scene, noiseImage(80, 60), [])).toThrow(RangeError);
    expect(() => trackPoints(buildPyramid(scene, 2), buildPyramid(scene, 3), [])).toThrow(
      RangeError,
    );
  });
});
