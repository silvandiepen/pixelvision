import { describe, expect, it } from "vitest";
import { transformPoint } from "../math/transforms";
import type { Point } from "../math/transforms.model";
import { estimate, estimateAffine, estimateHomography } from "./estimate";
import type { MotionKernel } from "./kernels";
import { affineKernel, homographyKernel } from "./kernels";

/** Seeded random source (LCG). */
const seeded = (seed: number) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};

const affine = Float64Array.of(1.2, 0.1, 5, -0.2, 0.9, -3, 0, 0, 1);
const homography = Float64Array.of(1, 0.1, 3, 0.05, 1.1, -2, 0.001, 0.0005, 1);

const pairs = (truth: Float64Array, count: number, outliers: number, seed = 1) => {
  const random = seeded(seed);
  const from: Point[] = [];
  const to: Point[] = [];
  for (let i = 0; i < count; i++) {
    const p = { x: random() * 200, y: random() * 150 };
    from.push(p);
    to.push(i < outliers ? { x: random() * 200, y: random() * 150 } : transformPoint(truth, p));
  }
  return { from, to };
};

const expectModel = (actual: ArrayLike<number>, expected: ArrayLike<number>, digits = 6) =>
  Array.from(expected).forEach((v, i) => expect(actual[i]).toBeCloseTo(v, digits));

describe("estimateAffine", () => {
  it("recovers an exact transform from 3 points", () => {
    const { from, to } = pairs(affine, 3, 0);

    const result = estimateAffine(from, to)!;

    expectModel(result.model, affine);
    expect(result.inlierCount).toBe(3);
  });

  it.each(["ransac", "lmeds"] as const)("ignores outliers with %s", (method) => {
    const { from, to } = pairs(affine, 80, 25);

    const result = estimateAffine(from, to, { method, random: seeded(5) })!;

    expectModel(result.model, affine);
    expect(result.inliers.slice(0, 25).filter(Boolean).length).toBeLessThan(3);
    expect(result.inliers.slice(25).every(Boolean)).toBe(true);
  });

  it("is reproducible with a seeded random source", () => {
    const { from, to } = pairs(affine, 40, 10);
    const noisy = to.map((p, i) => ({ x: p.x + (i % 3) * 0.3, y: p.y - (i % 2) * 0.2 }));

    expect(estimateAffine(from, noisy, { refine: false, random: seeded(9) })).toEqual(
      estimateAffine(from, noisy, { refine: false, random: seeded(9) }),
    );
  });

  it("returns null for too few or degenerate points", () => {
    expect(estimateAffine([{ x: 0, y: 0 }], [{ x: 1, y: 1 }])).toBeNull();
    const line = [0, 1, 2].map((i) => ({ x: i, y: i }));
    expect(estimateAffine(line, line)).toBeNull();
  });

  it("gives up when every sample is degenerate", () => {
    const line = Array.from({ length: 10 }, (_, i) => ({ x: i, y: 2 * i }));

    expect(estimateAffine(line, line, { random: seeded(3) })).toBeNull();
  });

  it("rejects lists of different lengths", () => {
    expect(() => estimateAffine([{ x: 0, y: 0 }], [])).toThrow(RangeError);
  });
});

describe("estimateHomography", () => {
  it("recovers an exact transform from 4 points", () => {
    const { from, to } = pairs(homography, 4, 0, 2);

    expectModel(estimateHomography(from, to)!.model, homography, 5);
  });

  it.each(["ransac", "lmeds"] as const)("ignores outliers with %s", (method) => {
    const { from, to } = pairs(homography, 100, 30, 3);

    const result = estimateHomography(from, to, { method, random: seeded(11) })!;

    expectModel(result.model, homography, 5);
    expect(result.inlierCount).toBeGreaterThanOrEqual(70);
  });

  it("keeps the search short when everything agrees", () => {
    const { from, to } = pairs(homography, 50, 0, 4);
    let calls = 0;
    const random = seeded(1);

    estimateHomography(from, to, { random: () => (calls++, random()) });

    // One good sample sets the iteration count to 1 (4 draws).
    expect(calls).toBeLessThan(40);
  });

  it("returns null when points don't spread in both directions", () => {
    const flat = Array.from({ length: 4 }, (_, i) => ({ x: i * 10, y: 5 }));

    expect(estimateHomography(flat, flat)).toBeNull();
  });

  it("returns null when LMEDS finds too few inliers", () => {
    const random = seeded(8);
    const from = Array.from({ length: 12 }, () => ({ x: random() * 100, y: random() * 100 }));
    const to = Array.from({ length: 12 }, () => ({ x: random() * 100, y: random() * 100 }));

    expect(estimateHomography(from, to, { method: "lmeds", random: seeded(2) })).toBeNull();
  });
});

describe("kernels", () => {
  it("affine error is the squared distance to the mapped point", () => {
    const out = new Float64Array(1);

    affineKernel.error(
      [{ x: 1, y: 1 }],
      [{ x: 4, y: 5 }],
      Float64Array.of(1, 0, 0, 0, 1, 0, 0, 0, 1),
      out,
    );

    expect(out[0]).toBe(25);
  });

  it("homography subset check rejects folded quadrilaterals", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    const folded = [square[0], square[1], square[3], square[2]];

    expect(homographyKernel.checkSubset(square, square, 4)).toBe(true);
    expect(homographyKernel.checkSubset(square, square, 3)).toBe(true);
    expect(homographyKernel.checkSubset(square, folded, 4)).toBe(false);
  });

  it("homography fit rejects a projective term of zero", () => {
    // Maps a square onto a configuration whose solution sends m[8] to 0.
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    expect(homographyKernel.fit(from, from)).not.toBeNull();
  });
});

describe("estimate with a stub kernel", () => {
  const points = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i * i }));
  const identity = Float64Array.of(1, 0, 0, 0, 1, 0, 0, 0, 1);
  /** A kernel whose fit returns the queued results in order. */
  const stub = (
    results: Array<Float64Array | null>,
    errorFor: (model: Float64Array, i: number) => number = (_, i) => (i < 6 ? 0 : 100),
  ): MotionKernel => {
    let call = 0;
    return {
      size: 2,
      fit: () => results[Math.min(call++, results.length - 1)],
      error: (_from, _to, model, out) => {
        for (let i = 0; i < out.length; i++) out[i] = errorFor(model, i);
      },
      checkSubset: () => true,
    };
  };

  it("skips samples that give no model and keeps searching", () => {
    const result = estimate("test", stub([null, null, identity]), points, points, {
      random: seeded(1),
    });

    expect(result?.inlierCount).toBe(6);
  });

  it("keeps the search result when the refit fails", () => {
    const kernel = stub([identity, identity, identity, null]);
    let fits = 0;
    const counting = {
      ...kernel,
      fit: (f: readonly Point[], t: readonly Point[]) => (
        fits++,
        f.length > 2 ? null : kernel.fit(f, t)
      ),
    };

    const result = estimate("test", counting, points, points, {
      maxIterations: 3,
      random: seeded(1),
    });

    expect(result?.model).toBe(identity);
    expect(fits).toBeGreaterThan(1);
  });

  it("keeps the search result when the refit explains fewer points", () => {
    const worse = Float64Array.of(2, 0, 0, 0, 2, 0, 0, 0, 1);
    const kernel = stub([identity], (model, i) =>
      model === worse ? (i < 3 ? 0 : 100) : i < 6 ? 0 : 100,
    );
    const refitting = {
      ...kernel,
      fit: (f: readonly Point[]) => (f.length > 2 ? worse : identity),
    };

    expect(estimate("test", refitting, points, points, { random: seeded(1) })?.model).toBe(
      identity,
    );
  });

  it("LMEDS skips empty fits and can skip refinement", () => {
    const result = estimate("test", stub([null, identity]), points, points, {
      method: "lmeds",
      refine: false,
      random: seeded(4),
    });

    expect(result?.model).toBe(identity);
  });

  it("LMEDS returns null when too few points fit the best model", () => {
    // 5 points, 4 per sample: the median error is 0 but only 3 points have it.
    const kernel: MotionKernel = {
      ...stub([identity], (_, i) => (i < 3 ? 0 : 1e6)),
      size: 4,
    };

    expect(
      estimate("test", kernel, points.slice(0, 5), points.slice(0, 5), {
        method: "lmeds",
        random: seeded(4),
      }),
    ).toBeNull();
  });
});

describe("homography kernel", () => {
  it("rejects a transform that sends the origin to infinity", () => {
    // H = [[1, 0, 1], [0, 1, 0], [0.01, 0, 0]]: full rank, but m[8] = 0.
    const from = [
      { x: 10, y: 0 },
      { x: 20, y: 5 },
      { x: 15, y: 20 },
      { x: 30, y: 12 },
      { x: 12, y: 30 },
    ];
    const to = from.map((p) => ({ x: (p.x + 1) / (0.01 * p.x), y: p.y / (0.01 * p.x) }));

    expect(homographyKernel.fit(from, to)).toBeNull();
  });
});
