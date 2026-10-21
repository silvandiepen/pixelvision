import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { gaussianBlur } from "../imgproc/gaussianBlur";
import { warpAffine } from "../imgproc/warp";
import { noiseImage, rectanglesImage } from "../test-images";
import { detectFast } from "./fast";
import { describeOrb, hammingDistance, keypointOrientation, matchDescriptors } from "./orb";

describe("keypointOrientation", () => {
  it("points towards the bright side", () => {
    const right = rectanglesImage(40, 40, [[20, 0, 40, 40, 255]]);
    const below = rectanglesImage(40, 40, [[0, 20, 40, 40, 255]]);

    expect(keypointOrientation(right, { x: 20, y: 20, score: 0 })).toBeCloseTo(0, 1);
    expect(keypointOrientation(below, { x: 20, y: 20, score: 0 })).toBeCloseTo(Math.PI / 2, 1);
  });

  it("skips pixels outside the image", () => {
    const angle = keypointOrientation(rectanglesImage(20, 20, [[10, 0, 20, 20, 255]]), {
      x: 1,
      y: 1,
      score: 0,
    });

    expect(Number.isFinite(angle)).toBe(true);
  });
});

describe("describeOrb", () => {
  const image = gaussianBlur(noiseImage(100, 100, 2), { kernelSize: 5 });

  it("returns 32 bytes per keypoint", () => {
    const descriptors = describeOrb(image, [
      { x: 50, y: 50, score: 0, angle: 0 },
      { x: 40, y: 60, score: 0 },
    ]);

    expect(descriptors).toMatchObject({ type: "u8", width: 32, height: 2 });
  });

  it("is the same for the same patch and differs for different patches", () => {
    const d = describeOrb(image, [
      { x: 50, y: 50, score: 0, angle: 0.3 },
      { x: 50, y: 50, score: 0, angle: 0.3 },
      { x: 30, y: 70, score: 0, angle: 0.3 },
    ]);

    expect(hammingDistance(d, 0, d, 1)).toBe(0);
    expect(hammingDistance(d, 0, d, 2)).toBeGreaterThan(60);
  });

  it("is rotation-invariant when orientation is computed", () => {
    const smooth = gaussianBlur(gaussianBlur(noiseImage(100, 100, 2), { kernelSize: 9 }), {
      kernelSize: 9,
    });
    // Output (x, y) reads input (y, 99 - x): a 90° rotation, so (x, y) moves to (99 - y, x).
    const rotated = warpAffine(smooth, [0, 1, 0, -1, 0, 99]);

    for (const [x, y] of [
      [60, 40],
      [45, 55],
      [35, 30],
    ]) {
      const angle = keypointOrientation(smooth, { x, y, score: 0 });
      const turned = keypointOrientation(rotated, { x: 99 - y, y: x, score: 0 });
      expect(turned - angle).toBeCloseTo(Math.PI / 2, 9);

      const a = describeOrb(smooth, [{ x, y, score: 0 }]);
      const b = describeOrb(rotated, [{ x: 99 - y, y: x, score: 0 }]);
      expect(hammingDistance(a, 0, b, 0)).toBeLessThanOrEqual(2);
    }
  });

  it("describes keypoints near the edge using a neutral fill", () => {
    expect(describeOrb(image, [{ x: 1, y: 1, score: 0, angle: 0 }]).height).toBe(1);
  });

  it("returns an empty matrix for no keypoints", () => {
    expect(describeOrb(image, []).height).toBe(0);
  });

  it("rejects colour and non-u8 input", () => {
    expect(() => describeOrb(createMatrix(4, 4, { channels: 3 }), [])).toThrow(RangeError);
    expect(() => describeOrb(createMatrix(4, 4, { type: "f32" }) as never, [])).toThrow(TypeError);
  });
});

describe("hammingDistance", () => {
  it("counts differing bits", () => {
    const a = createMatrix(2, 1, { data: new Uint8Array([0b1010_1010, 255]) });
    const b = createMatrix(2, 1, { data: new Uint8Array([0b0101_0101, 255]) });

    expect(hammingDistance(a, 0, b, 0)).toBe(8);
    expect(hammingDistance(a, 0, a, 0)).toBe(0);
  });
});

describe("matchDescriptors", () => {
  const scene = gaussianBlur(noiseImage(120, 120, 6), { kernelSize: 5 });
  const shifted = warpAffine(scene, [1, 0, 7, 0, 1, 3]); // output (x, y) reads input (x + 7, y + 3)
  const corners = detectFast(scene, { threshold: 12 }).filter(
    (c) => c.x > 30 && c.x < 80 && c.y > 30 && c.y < 80,
  );
  const a = describeOrb(scene, corners);
  const b = describeOrb(
    shifted,
    corners.map((c) => ({ ...c, x: c.x - 7, y: c.y - 3 })),
  );

  it("matches the same points in a shifted image", () => {
    const matches = matchDescriptors(a, b, { crossCheck: true });

    expect(matches.length).toBeGreaterThan(corners.length * 0.8);
    expect(matches.filter((m) => m.query === m.train).length).toBe(matches.length);
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i].distance).toBeGreaterThanOrEqual(matches[i - 1].distance);
    }
  });

  it("drops matches above the distance limit", () => {
    expect(matchDescriptors(a, b, { maxDistance: -1 })).toEqual([]);
  });

  it("drops ambiguous matches with the ratio test", () => {
    // The same descriptor twice in train: best and second best are equal.
    const twice = createMatrix(32, 2);
    twice.data.set(a.data.subarray(0, 32), 0);
    twice.data.set(a.data.subarray(0, 32), 32);
    const single = createMatrix(32, 1, { data: a.data.slice(0, 32) });

    expect(matchDescriptors(single, twice)).toHaveLength(1);
    expect(matchDescriptors(single, twice, { ratio: 0.8 })).toEqual([]);
  });

  it("finds nothing to match against an empty set", () => {
    expect(matchDescriptors(a, createMatrix(32, 0))).toEqual([]);
  });

  it("drops one-sided matches with cross-checking", () => {
    // Two identical rows in train: only one can be the reverse best match.
    const twice = createMatrix(32, 2);
    twice.data.set(a.data.subarray(0, 32), 0);
    twice.data.set(a.data.subarray(0, 32), 32);
    const single = createMatrix(32, 1, { data: a.data.slice(0, 32) });

    expect(matchDescriptors(twice, single, { crossCheck: true })).toHaveLength(1);
  });

  it("rejects descriptors of different widths", () => {
    expect(() => matchDescriptors(a, createMatrix(16, 1))).toThrow(RangeError);
  });
});
