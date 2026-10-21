import { describe, expect, it } from "vitest";
import { projectPoints } from "./projectPoints";
import type { Point3, RadialDistortion } from "./projectPoints.model";
import type { Vec3 } from "./rodrigues.model";
import { solvePnP } from "./solvePnP";

const camera = [800, 0, 320, 0, 780, 240, 0, 0, 1];
const marker: Point3[] = [
  { x: -0.05, y: -0.05, z: 0 },
  { x: 0.05, y: -0.05, z: 0 },
  { x: 0.05, y: 0.05, z: 0 },
  { x: -0.05, y: 0.05, z: 0 },
];
const cube: Point3[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
  x: i & 1 ? 0.5 : -0.5,
  y: i & 2 ? 0.5 : -0.5,
  z: i & 4 ? 0.5 : -0.5,
}));

/**
 * Projects points with a pose, solves for the pose and checks it comes back.
 *
 * @param points - Scene points.
 * @param rvec - True rotation.
 * @param tvec - True translation.
 * @param distortion - Lens distortion.
 */
const roundTrip = (points: Point3[], rvec: Vec3, tvec: Vec3, distortion?: RadialDistortion) => {
  const image = projectPoints(points, rvec, tvec, camera, { distortion });
  const result = solvePnP(points, image, camera, { distortion });
  for (let i = 0; i < 3; i++) {
    expect(Math.abs(result.rvec[i] - rvec[i])).toBeLessThan(1e-9);
    expect(Math.abs(result.tvec[i] - tvec[i])).toBeLessThan(1e-9);
  }
  expect(result.error).toBeLessThan(1e-6);
  return result;
};

describe("solvePnP", () => {
  it("recovers the pose of a planar marker", () => {
    roundTrip(marker, [0.3, -0.2, 0.1], [0.02, -0.01, 0.6]);
    roundTrip(marker, [Math.PI * 0.9, 0.1, 0], [0, 0, 0.4]);
  });

  it("recovers the pose of a plane that isn't z = 0", () => {
    const tilted = marker.map(({ x, y }) => ({ x: x + 1, y: 2 + 0.5 * y, z: 3 + y }));
    roundTrip(tilted, [-0.4, 0.5, 0.2], [-1, -2, 4]);
  });

  it("recovers the pose of a cube", () => {
    roundTrip(cube, [0.5, 0.6, -0.3], [0.2, -0.1, 6]);
    roundTrip(cube, [-1.5, 0.2, 2], [0, 0.3, 4]);
  });

  it("recovers many poses, whatever sign the linear estimate comes out with", () => {
    let seed = 7;
    /**
     * A small seeded generator (Park–Miller).
     *
     * @returns A number in (−0.5, 0.5).
     */
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647 - 0.5;
    };
    for (let k = 0; k < 24; k++) {
      const rvec: Vec3 = [random() * 3, random() * 3, random() * 3];
      const tvec: Vec3 = [random(), random(), 5 + random()];
      roundTrip(k % 2 ? cube : marker.map((p) => ({ ...p, x: p.x * 10, y: p.y * 10 })), rvec, tvec);
    }
  });

  it("stays at a converged noisy pose when solved again from it", () => {
    const image = projectPoints(cube, [0.4, 0.1, -0.2], [0.1, 0, 5], camera).map((p, i) => ({
      x: p.x + (i % 3) - 1,
      y: p.y + ((i * 2) % 3) - 1,
    }));
    const first = solvePnP(cube, image, camera, { maxIterations: 100 });
    const again = solvePnP(cube, image, camera, { guess: first, maxIterations: 100 });
    expect(again.error).toBeCloseTo(first.error, 9);
    for (let i = 0; i < 3; i++) expect(again.rvec[i]).toBeCloseTo(first.rvec[i], 9);
  });

  it("handles radial distortion", () => {
    roundTrip(marker, [0.3, 0.2, -0.1], [0.05, 0.05, 0.3], { k1: -0.25, k2: 0.08 });
    roundTrip(cube, [0.1, 0.2, 0.3], [0, 0, 5], { k1: 0.1 });
  });

  it("refines a guess, which also works from 3 points", () => {
    const rvec: Vec3 = [0.2, -0.3, 0.1];
    const tvec: Vec3 = [0.1, 0, 3];
    const points = cube.slice(0, 3);
    const image = projectPoints(points, rvec, tvec, camera);
    const result = solvePnP(points, image, camera, {
      guess: { rvec: [0.25, -0.25, 0.05], tvec: [0.12, 0.02, 3.1] },
    });
    expect(result.error).toBeLessThan(1e-6);
    expect(result.iterations).toBeGreaterThan(0);
  });

  it("returns the starting pose with maxIterations 0 and reports noisy fits", () => {
    const rvec: Vec3 = [0.1, 0.1, 0.1];
    const tvec: Vec3 = [0, 0, 5];
    const image = projectPoints(cube, rvec, tvec, camera);
    const guess = { rvec: [0, 0, 0] as Vec3, tvec: [0, 0, 4] as Vec3 };
    const still = solvePnP(cube, image, camera, { guess, maxIterations: 0 });
    expect(still.rvec).toEqual([0, 0, 0]);
    expect(still.iterations).toBe(0);
    expect(still.error).toBeGreaterThan(1);
    // One pixel of noise on one point: a small, non-zero residual.
    image[0] = { x: image[0].x + 1, y: image[0].y };
    const noisy = solvePnP(cube, image, camera, { maxIterations: 50 });
    expect(noisy.error).toBeGreaterThan(0.01);
    expect(noisy.error).toBeLessThan(1);
  });

  it("stops at once on a perfect guess", () => {
    const rvec: Vec3 = [0.1, -0.1, 0];
    const tvec: Vec3 = [0, 0, 2];
    const points = [{ x: 0, y: 0, z: 0 }, ...cube.slice(0, 3)];
    const image = projectPoints(points, rvec, tvec, camera);
    // An exact image of the origin and a pose that reprojects to it with zero error.
    const exact = solvePnP(points, image, camera, { guess: { rvec, tvec } });
    expect(exact.rvec).toEqual(rvec);
  });

  it("rejects bad input", () => {
    const image = projectPoints(cube, [0, 0, 0], [0, 0, 5], camera);
    expect(() => solvePnP(cube, image.slice(1), camera)).toThrow(RangeError);
    expect(() => solvePnP(marker.slice(0, 3), image.slice(0, 3), camera)).toThrow(RangeError);
    expect(() =>
      solvePnP(cube.slice(0, 2), image.slice(0, 2), camera, {
        guess: { rvec: [0, 0, 0], tvec: [0, 0, 1] },
      }),
    ).toThrow(RangeError);
    // Five corners of a cube aren't coplanar: a direct estimate needs six.
    expect(() => solvePnP(cube.slice(0, 5), image.slice(0, 5), camera)).toThrow(RangeError);
    const line = [0, 1, 2, 3].map((i) => ({ x: i, y: 2 * i, z: 0 }));
    expect(() => solvePnP(line, image.slice(0, 4), camera)).toThrow(RangeError);
    expect(() => solvePnP(cube, image, camera, { maxIterations: 1.5 })).toThrow(RangeError);
    expect(() => solvePnP(cube, image, [1, 2, 3])).toThrow(RangeError);
  });
});
