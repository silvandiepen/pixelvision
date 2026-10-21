import jsfeat from "jsfeat";
import { estimateAffine, estimateHomography, transformPoint } from "pixelvision";
import type { Point } from "pixelvision";
import { afterEach, describe, expect, it } from "vitest";
import { jsfeatMatrix, seededRandom } from "../src";

const originalRandom = Math.random;
afterEach(() => {
  Math.random = originalRandom;
});

const truths = {
  affine: Float64Array.of(0.9, -0.25, 12, 0.3, 1.05, -7, 0, 0, 1),
  homography: Float64Array.of(1.1, 0.05, -4, -0.08, 0.95, 6, 0.0009, -0.0006, 1),
};

/** Point pairs under a known transform, with noise and a share of outliers. */
const correspondences = (truth: Float64Array, count: number, outliers: number, seed: number) => {
  const random = seededRandom(seed);
  const from: Point[] = [];
  const to: Point[] = [];
  for (let i = 0; i < count; i++) {
    const p = { x: random() * 300, y: random() * 200 };
    const q = transformPoint(truth, p);
    const noisy = { x: q.x + (random() - 0.5) * 0.6, y: q.y + (random() - 0.5) * 0.6 };
    from.push(p);
    to.push(i < outliers ? { x: random() * 300, y: random() * 200 } : noisy);
  }
  return { from, to };
};

const run = (
  name: "affine" | "homography",
  method: "ransac" | "lmeds",
  count: number,
  outliers: number,
  seed: number,
) => {
  const { from, to } = correspondences(truths[name], count, outliers, seed);
  const size = name === "affine" ? 3 : 4;
  const kernel =
    name === "affine" ? new jsfeat.motion_model.affine2d() : new jsfeat.motion_model.homography2d();
  const params = new jsfeat.ransac_params_t(size, 3, 0.5, 0.99);
  const model = jsfeatMatrix(3, 3, "f32");
  const mask = jsfeatMatrix(count, 1, "u8");
  Math.random = seededRandom(seed * 7 + 1);
  const ok = jsfeat.motion_estimator[method](params, kernel, from, to, count, model, mask, 1000);
  Math.random = originalRandom;

  const estimateFn = name === "affine" ? estimateAffine : estimateHomography;
  const result = estimateFn(from, to, {
    method,
    threshold: 3,
    refine: false,
    random: seededRandom(seed * 7 + 1),
  });
  const refined = estimateFn(from, to, {
    method,
    threshold: 3,
    random: seededRandom(seed * 7 + 1),
  });
  return {
    ok,
    model: model.data,
    mask: Array.from(mask.data.subarray(0, count)),
    result,
    refined,
    from,
    to,
  };
};

describe("estimateAffine and estimateHomography match jsfeat.motion_estimator", () => {
  for (const name of ["affine", "homography"] as const) {
    for (const method of ["ransac", "lmeds"] as const) {
      for (const [count, outliers, seed] of [
        [30, 0, 1],
        [60, 15, 2],
        [100, 30, 3],
        [200, 60, 4],
      ]) {
        it(`${name} ${method}: ${count} points, ${outliers} outliers`, () => {
          const { ok, model, mask, result, refined, from } = run(
            name,
            method,
            count,
            outliers,
            seed,
          );

          expect(ok).toBe(true);
          expect(result).not.toBeNull();
          // Same random samples, same inliers.
          expect(result!.inliers.map(Number)).toEqual(mask);
          // Same model: jsfeat computes it in single precision, so compare
          // what the models do, mapping every point within 0.01 px of each other.
          for (const p of from) {
            const ours = transformPoint(result!.model, p);
            const theirs = transformPoint(model, p);
            expect(Math.hypot(ours.x - theirs.x, ours.y - theirs.y)).toBeLessThan(0.01);
          }
          // Refining on all inliers gets closer to the true transform.
          const meanError = (m: ArrayLike<number>) =>
            from.slice(outliers).reduce((sum, p) => {
              const a = transformPoint(m, p);
              const b = transformPoint(truths[name], p);
              return sum + Math.hypot(a.x - b.x, a.y - b.y);
            }, 0) /
            (from.length - outliers);
          expect(meanError(refined!.model)).toBeLessThan(0.3);
          expect(meanError(refined!.model)).toBeLessThanOrEqual(meanError(result!.model) + 1e-9);
        });
      }
    }
  }
});
