import {
  calcBackProject,
  calcHist,
  camShift,
  canny,
  createMatrix,
  gaussianBlur,
  houghCircles,
  houghLinesP,
  meanShift,
  projectPoints,
  rgbToHsv,
  rodrigues,
  solvePnP,
} from "pixelvision";
import type { Matrix, Point3, RadialDistortion, Rect, Vec3 } from "pixelvision";
import { beforeAll, describe, expect, it } from "vitest";

import {
  expectIdentical,
  gray,
  loadOpenCv,
  seededRandom,
  standardFixtures,
  toMat,
  withMats,
} from "../src";
import type { Fixture, OpenCv } from "../src";

let cv: OpenCv;
beforeAll(async () => {
  ({ cv } = await loadOpenCv());
}, 60_000);

const fixtures = standardFixtures.filter((f) => f.width >= 20 && f.height >= 20);

/**
 * Drops the alpha channel of a fixture.
 *
 * @param fixture - RGBA fixture.
 * @returns A 3-channel `u8` matrix in RGB order.
 */
const rgb = (fixture: Fixture): Matrix<"u8"> => {
  const out = createMatrix(fixture.width, fixture.height, { channels: 3 });
  for (let p = 0; p < fixture.width * fixture.height; p++) {
    out.data.set(fixture.data.subarray(p * 4, p * 4 + 3), p * 3);
  }
  return out;
};

/**
 * Draws a line of 255s with Bresenham's algorithm.
 *
 * @param image - Image to draw on.
 * @param segment - `[x0, y0, x1, y1]`.
 */
const drawLine = (image: Matrix<"u8">, [x0, y0, x1, y1]: number[]): void => {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    image.data[y0 * image.width + x0] = 255;
    if (x0 === x1 && y0 === y1) return;
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y0 += sy;
    }
  }
};

/**
 * Paints an anti-aliased disc: each pixel takes the share of its 4 x 4
 * samples that fall inside.
 *
 * @param image - Image to paint on.
 * @param disc - Centre and radius.
 * @param disc.x - Centre column (pixel centres at `.5`).
 * @param disc.y - Centre row.
 * @param disc.r - Radius.
 * @param value - Gray level inside.
 */
const drawDisc = (
  image: Matrix<"u8">,
  { x: cx, y: cy, r }: { x: number; y: number; r: number },
  value: number,
): void => {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      let hits = 0;
      for (let s = 0; s < 16; s++) {
        const px = x + ((s % 4) + 0.5) / 4 - cx;
        const py = y + ((s >> 2) + 0.5) / 4 - cy;
        if (px * px + py * py <= r * r) hits++;
      }
      const i = y * image.width + x;
      image.data[i] = Math.round(image.data[i] + ((value - image.data[i]) * hits) / 16);
    }
  }
};

/**
 * Segments of a `CV_32SC4` Mat.
 *
 * @param mat - OpenCV's lines.
 * @returns `[x1, y1, x2, y2]` per segment.
 */
const segmentsOf = (mat: OpenCv): number[][] =>
  Array.from({ length: mat.rows }, (_, i) => Array.from(mat.data32S.slice(i * 4, i * 4 + 4)));

/**
 * How far apart two segments are: the larger of their end-point distances,
 * pairing the ends whichever way is closer.
 *
 * @param a - `[x1, y1, x2, y2]`.
 * @param b - `[x1, y1, x2, y2]`.
 * @returns Distance in pixels.
 */
const segmentDistance = (a: number[], b: number[]): number =>
  Math.min(
    Math.max(Math.hypot(a[0] - b[0], a[1] - b[1]), Math.hypot(a[2] - b[2], a[3] - b[3])),
    Math.max(Math.hypot(a[0] - b[2], a[1] - b[3]), Math.hypot(a[2] - b[0], a[3] - b[1])),
  );

describe("houghLinesP matches cv.HoughLinesP", () => {
  // OpenCV's generator and default seed are ported, so with the default
  // seed every segment is identical, in the same order.
  const settings = [
    { threshold: 10, minLineLength: 0, maxLineGap: 0 },
    { threshold: 20, minLineLength: 10, maxLineGap: 3 },
    { threshold: 30, minLineLength: 30, maxLineGap: 10 },
    { threshold: 15, minLineLength: 5, maxLineGap: 2, rhoStep: 2, thetaStep: Math.PI / 90 },
  ];
  /**
   * Runs both libraries with every setting and expects identical segments.
   *
   * @param edges - Edge image.
   */
  const run = (edges: Matrix<"u8">) => {
    for (const s of settings) {
      const src = toMat(cv, edges);
      const lines = new cv.Mat();
      withMats([src, lines], () => {
        cv.HoughLinesP(
          src,
          lines,
          s.rhoStep ?? 1,
          s.thetaStep ?? Math.PI / 180,
          s.threshold,
          s.minLineLength,
          s.maxLineGap,
        );
        const ours = houghLinesP(edges, s).map(({ from, to }) => [from.x, from.y, to.x, to.y]);
        expect(ours, JSON.stringify(s)).toEqual(segmentsOf(lines));
      });
    }
  };

  for (const fixture of fixtures) {
    it(`identical with the default seed: ${fixture.name}`, () => {
      run(canny(gaussianBlur(gray(fixture), { kernelSize: 3 }), { low: 30, high: 90 }));
    });
  }

  it("identical with the default seed: crossing synthetic lines", () => {
    const edges = createMatrix(200, 150);
    for (const segment of [
      [10, 10, 190, 20],
      [30, 140, 120, 5],
      [5, 75, 195, 75],
      [100, 20, 100, 140],
    ]) {
      drawLine(edges, segment);
    }
    run(edges);
  });

  // Other seeds visit the pixels in another order. On clean lines (straight
  // edges along the accumulator's angles: horizontal, vertical, 45°) that
  // don't meet, that changes nothing that matters: every segment found with
  // any seed has a counterpart in OpenCV's within TOLERANCE pixels at both
  // ends, and the other way round, and both match the drawn lines. (On these
  // images the ends are in fact identical.) At other angles the walk along a
  // line found at 1° resolution drifts off its pixels, so where a segment
  // ends depends on which pixel voted first, for OpenCV as for any seed.
  const TOLERANCE = 2;
  it(`other seeds agree within ${TOLERANCE} px on clean, separate lines`, () => {
    const random = seededRandom(11);
    for (let k = 0; k < 40; k++) {
      // One line per cell of a 2 x 2 grid, none on a common line, so no two meet.
      const edges = createMatrix(240, 200);
      const drawn: number[][] = [];
      for (let cell = 0; cell < 4; cell++) {
        const angle = (Math.floor(random() * 4) * Math.PI) / 4;
        const half = Math.round(32 + random() * 8);
        const cx = (cell % 2) * 120 + 50 + cell * 7;
        const cy = Math.floor(cell / 2) * 100 + 45 + cell * 5;
        const segment = [
          Math.round(cx - half * Math.cos(angle)),
          Math.round(cy - half * Math.sin(angle)),
          Math.round(cx + half * Math.cos(angle)),
          Math.round(cy + half * Math.sin(angle)),
        ];
        drawLine(edges, segment);
        drawn.push(segment);
      }
      const src = toMat(cv, edges);
      const lines = new cv.Mat();
      withMats([src, lines], () => {
        cv.HoughLinesP(src, lines, 1, Math.PI / 180, 40, 30, 3);
        const theirs = segmentsOf(lines);
        for (const seed of [1, 7, 12345, 2 ** 40]) {
          const ours = houghLinesP(edges, {
            threshold: 40,
            minLineLength: 30,
            maxLineGap: 3,
            seed,
          }).map(({ from, to }) => [from.x, from.y, to.x, to.y]);
          const label = `image ${k}, seed ${seed}`;
          for (const [list, others, what] of [
            [theirs, ours, "OpenCV segment without a counterpart"],
            [ours, theirs, "segment without an OpenCV counterpart"],
            [drawn, ours, "drawn line not found"],
          ] as const) {
            for (const segment of list) {
              const nearest = Math.min(...others.map((other) => segmentDistance(segment, other)));
              expect(nearest, `${label}: ${what} ${segment}`).toBeLessThanOrEqual(TOLERANCE);
            }
          }
        }
      });
    }
  });
});

describe("houghCircles agrees with cv.HoughCircles on drawn circles", () => {
  // Candidate centres are computed exactly as OpenCV does. Radii differ
  // where OpenCV is off by one (it skips a distance bin per window and
  // reports a window half a bin low), by at most RADIUS_FROM_OPENCV here.
  // Both stay within RADIUS_FROM_TRUTH of the drawn radius; pixelvision's
  // mean error is lower (0.38 px against OpenCV's 0.43 px on 200 discs).
  const RADIUS_FROM_OPENCV = 1.5;
  const RADIUS_FROM_TRUTH = 1;
  // A centre sits in the middle of an accumulator cell of dp pixels, so up
  // to dp / √2 from the true centre, plus up to a pixel for where the
  // blurred edge lies.
  /**
   * Largest allowed distance of a centre from the true one.
   *
   * @param dp - Accumulator cell size.
   * @returns Pixels.
   */
  const centreFromTruth = (dp: number) => dp * Math.SQRT1_2 + 1;

  it("finds every drawn circle, near OpenCV's and the truth", () => {
    const random = seededRandom(17);
    for (let k = 0; k < 30; k++) {
      const image = createMatrix(200, 150);
      for (let i = 0; i < image.data.length; i++) {
        image.data[i] = 210 + Math.round((random() - 0.5) * 8);
      }
      const discs = [
        { x: 50 + random() * 10, y: 50 + random() * 20, r: 20 + random() * 15 },
        { x: 140 + random() * 10, y: 80 + random() * 10, r: 25 + random() * 20 },
      ];
      for (const disc of discs) drawDisc(image, disc, 60 + random() * 60);
      const blurred = gaussianBlur(image, { kernelSize: 5 });
      for (const dp of [1, 1.5, 2]) {
        const src = toMat(cv, blurred);
        const circles = new cv.Mat();
        withMats([src, circles], () => {
          cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT, dp, 40, 100, 25, 15, 50);
          const theirs = Array.from({ length: circles.cols }, (_, i) =>
            Array.from(circles.data32F.slice(i * 3, i * 3 + 3) as Float32Array),
          );
          const ours = houghCircles(blurred, {
            dp,
            minDist: 40,
            cannyThreshold: 100,
            accumulatorThreshold: 25,
            minRadius: 15,
            maxRadius: 50,
          });
          for (const disc of discs) {
            const label = `image ${k}, dp ${dp}, disc ${JSON.stringify(disc)}`;
            const mine = ours.find((c) => Math.hypot(c.x - disc.x, c.y - disc.y) < 3);
            const opencv = theirs.find((c) => Math.hypot(c[0] - disc.x, c[1] - disc.y) < 3);
            expect(mine, `${label}: pixelvision missed it`).toBeDefined();
            expect(opencv, `${label}: OpenCV missed it`).toBeDefined();
            const distance = Math.hypot(mine!.x - disc.x, mine!.y - disc.y);
            expect(distance, label).toBeLessThanOrEqual(centreFromTruth(dp));
            expect(
              Math.hypot(mine!.x - opencv![0], mine!.y - opencv![1]),
              label,
            ).toBeLessThanOrEqual(dp * Math.SQRT2);
            expect(Math.abs(mine!.radius - opencv![2]), label).toBeLessThanOrEqual(
              RADIUS_FROM_OPENCV,
            );
            expect(Math.abs(mine!.radius - disc.r), label).toBeLessThanOrEqual(RADIUS_FROM_TRUTH);
            expect(Math.abs(opencv![2] - disc.r), label).toBeLessThanOrEqual(RADIUS_FROM_TRUTH);
          }
        });
      }
    }
  });
});

describe("rodrigues, projectPoints and solvePnP match OpenCV", () => {
  const camera = [800, 0, 320, 0, 780, 240, 0, 0, 1];

  /**
   * Wraps three numbers in a 3 x 1 `CV_64F` Mat.
   *
   * @param v - The values.
   * @returns The Mat (caller deletes it).
   */
  const vecMat = (v: ArrayLike<number>): OpenCv => cv.matFromArray(3, 1, cv.CV_64F, Array.from(v));

  /**
   * A distortion Mat in OpenCV's `[k1, k2, p1, p2]` layout.
   *
   * @param distortion - Radial distortion, or none.
   * @returns The Mat (caller deletes it).
   */
  const distortionMat = (distortion?: RadialDistortion): OpenCv =>
    cv.matFromArray(1, 4, cv.CV_64F, [distortion?.k1 ?? 0, distortion?.k2 ?? 0, 0, 0]);

  it("rodrigues: both directions within 1e-12", () => {
    const random = seededRandom(31);
    for (let k = 0; k < 200; k++) {
      const v: Vec3 = [(random() - 0.5) * 4, (random() - 0.5) * 4, (random() - 0.5) * 4];
      if (Math.hypot(...v) > 3) continue;
      const src = vecMat(v);
      const matrix = new cv.Mat();
      const back = new cv.Mat();
      withMats([src, matrix, back], () => {
        cv.Rodrigues(src, matrix);
        const ours = rodrigues(v);
        for (let i = 0; i < 9; i++)
          expect(Math.abs(ours[i] - matrix.data64F[i])).toBeLessThan(1e-12);
        cv.Rodrigues(matrix, back);
        const vector = rodrigues(Float64Array.from(matrix.data64F as Float64Array));
        for (let i = 0; i < 3; i++)
          expect(Math.abs(vector[i] - back.data64F[i])).toBeLessThan(1e-12);
      });
    }
  });

  it("rodrigues: keeps rotations under 1e-5 rad, which OpenCV rounds to zero", () => {
    const v: Vec3 = [1e-6, -2e-6, 5e-7];
    const src = vecMat(v);
    const matrix = new cv.Mat();
    const back = new cv.Mat();
    withMats([src, matrix, back], () => {
      cv.Rodrigues(src, matrix);
      cv.Rodrigues(matrix, back);
      // OpenCV's bug: the rotation is lost.
      expect(Array.from(back.data64F as Float64Array)).toEqual([0, 0, 0]);
      const ours = rodrigues(Float64Array.from(matrix.data64F as Float64Array));
      for (let i = 0; i < 3; i++) expect(Math.abs(ours[i] - v[i])).toBeLessThan(1e-15);
    });
  });

  // Poses, points and distortion shared by the projection and pose tests.
  const random = seededRandom(3);
  const cases = Array.from({ length: 40 }, (_, k) => {
    const planar = k % 2 === 0;
    const count = (planar ? 4 : 6) + (k % 7);
    return {
      planar,
      rvec: [(random() - 0.5) * 2, (random() - 0.5) * 2, (random() - 0.5) * 2] as Vec3,
      tvec: [random() - 0.5, random() - 0.5, 4 + random() * 4] as Vec3,
      distortion: k % 3 === 0 ? { k1: -0.2, k2: 0.05 } : undefined,
      points: Array.from({ length: count }, () => ({
        x: random() - 0.5,
        y: random() - 0.5,
        z: planar ? 0 : random() - 0.5,
      })) as Point3[],
    };
  });

  /**
   * Wraps scene points in an `N x 1` `CV_64FC3` Mat.
   *
   * @param points - The points.
   * @returns The Mat (caller deletes it).
   */
  const objectMat = (points: Point3[]): OpenCv =>
    cv.matFromArray(
      points.length,
      1,
      cv.CV_64FC3,
      points.flatMap((p) => [p.x, p.y, p.z]),
    );

  it("projectPoints: within 1e-9 px, with and without distortion", () => {
    for (const c of cases) {
      const objects = objectMat(c.points);
      const r = vecMat(c.rvec);
      const t = vecMat(c.tvec);
      const K = cv.matFromArray(3, 3, cv.CV_64F, camera);
      const D = distortionMat(c.distortion);
      const image = new cv.Mat();
      const jacobian = new cv.Mat();
      withMats([objects, r, t, K, D, image, jacobian], () => {
        cv.projectPoints(objects, r, t, K, D, image, jacobian);
        projectPoints(c.points, c.rvec, c.tvec, camera, { distortion: c.distortion }).forEach(
          (p, i) => {
            expect(Math.abs(p.x - image.data64F[2 * i])).toBeLessThan(1e-9);
            expect(Math.abs(p.y - image.data64F[2 * i + 1])).toBeLessThan(1e-9);
          },
        );
      });
    }
  });

  /**
   * Solves a case with both libraries.
   *
   * @param c - The case.
   * @param image - Image points.
   * @returns pixelvision's result and OpenCV's rvec and tvec.
   */
  const solveBoth = (c: (typeof cases)[number], image: { x: number; y: number }[]) => {
    const objects = objectMat(c.points);
    const imageMat = cv.matFromArray(
      image.length,
      1,
      cv.CV_64FC2,
      image.flatMap((p) => [p.x, p.y]),
    );
    const K = cv.matFromArray(3, 3, cv.CV_64F, camera);
    const D = distortionMat(c.distortion);
    const r = new cv.Mat();
    const t = new cv.Mat();
    return withMats([objects, imageMat, K, D, r, t], () => {
      cv.solvePnP(objects, imageMat, K, D, r, t, false, cv.SOLVEPNP_ITERATIVE);
      return {
        ours: solvePnP(c.points, image, camera, { distortion: c.distortion }),
        rvec: Array.from(r.data64F as Float64Array),
        tvec: Array.from(t.data64F as Float64Array),
      };
    });
  };

  // OpenCV stops refining once a step is below single-precision epsilon, so
  // its pose is within about 1e-9 of the exact one; pixelvision's is within
  // 1e-13. Both agree within this tolerance (rad, and relative to |tvec|).
  const POSE_TOLERANCE = 1e-7;

  it(`solvePnP on exact data: recovers the pose, within ${POSE_TOLERANCE} of OpenCV`, () => {
    for (const c of cases) {
      const image = projectPoints(c.points, c.rvec, c.tvec, camera, {
        distortion: c.distortion,
      });
      const { ours, rvec, tvec } = solveBoth(c, image);
      const scale = Math.hypot(...c.tvec);
      for (let i = 0; i < 3; i++) {
        expect(Math.abs(ours.rvec[i] - rvec[i])).toBeLessThan(POSE_TOLERANCE);
        expect(Math.abs(ours.tvec[i] - tvec[i])).toBeLessThan(POSE_TOLERANCE * scale);
        expect(Math.abs(ours.rvec[i] - c.rvec[i])).toBeLessThan(1e-10);
        expect(Math.abs(ours.tvec[i] - c.tvec[i])).toBeLessThan(1e-10 * scale);
      }
      expect(ours.error).toBeLessThan(1e-6);
    }
  });

  it(`solvePnP on noisy data: the same least-squares pose as OpenCV, within ${POSE_TOLERANCE}`, () => {
    const noise = seededRandom(5);
    for (const c of cases) {
      const image = projectPoints(c.points, c.rvec, c.tvec, camera, {
        distortion: c.distortion,
      }).map((p) => ({ x: p.x + noise() - 0.5, y: p.y + noise() - 0.5 }));
      const { ours, rvec, tvec } = solveBoth(c, image);
      const scale = Math.hypot(...c.tvec);
      for (let i = 0; i < 3; i++) {
        expect(Math.abs(ours.rvec[i] - rvec[i])).toBeLessThan(POSE_TOLERANCE);
        expect(Math.abs(ours.tvec[i] - tvec[i])).toBeLessThan(POSE_TOLERANCE * scale);
      }
    }
  });
});

/**
 * Hue histograms and their back-projections of every fixture, plus
 * synthetic probability maps of rotated ellipses on sparse noise.
 *
 * @returns Probability images with a name.
 */
const probabilityImages = (): Array<[string, Matrix<"u8">]> => {
  const images: Array<[string, Matrix<"u8">]> = [];
  for (const fixture of fixtures) {
    const hsv = rgbToHsv(rgb(fixture));
    const hue = calcHist(hsv, { bins: 16, range: [0, 180] }).data.subarray(0, 16);
    const max = Math.max(...hue);
    images.push([fixture.name, calcBackProject(hsv, hue, { range: [0, 180], scale: 255 / max })]);
  }
  const random = seededRandom(4);
  for (let k = 0; k < 20; k++) {
    const image = createMatrix(160, 120);
    for (let i = 0; i < image.data.length; i++) {
      image.data[i] = random() < 0.05 ? Math.floor(random() * 80) : 0;
    }
    const cx = 30 + random() * 100;
    const cy = 30 + random() * 60;
    const a = 10 + random() * 25;
    const b = 5 + random() * 15;
    const t = random() * Math.PI;
    for (let y = 0; y < 120; y++) {
      for (let x = 0; x < 160; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const u = dx * Math.cos(t) + dy * Math.sin(t);
        const v = -dx * Math.sin(t) + dy * Math.cos(t);
        if ((u / a) ** 2 + (v / b) ** 2 <= 1)
          image.data[y * 160 + x] = 200 + Math.floor(random() * 55);
      }
    }
    images.push([`ellipse #${k}`, image]);
  }
  return images;
};

describe("calcBackProject matches cv.calcBackProject", () => {
  const settings: Array<{ bins: number; range: [number, number]; channel: number }> = [
    { bins: 16, range: [0, 180], channel: 0 },
    { bins: 30, range: [0, 180], channel: 0 },
    { bins: 7, range: [20, 200.5], channel: 1 },
    { bins: 256, range: [0, 256], channel: 2 },
  ];
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const hsv = rgbToHsv(rgb(fixture));
      const src = toMat(cv, hsv);
      const planes = new cv.MatVector();
      planes.push_back(src);
      withMats([src, planes], () => {
        for (const s of settings) {
          const histogram = calcHist(hsv, { bins: s.bins, range: s.range });
          const row = histogram.data.subarray(s.channel * s.bins, (s.channel + 1) * s.bins);
          for (const scale of [1, 255 / Math.max(1, ...row), 0.37]) {
            const hist = cv.matFromArray(s.bins, 1, cv.CV_32F, Array.from(row));
            const dst = new cv.Mat();
            withMats([hist, dst], () => {
              cv.calcBackProject(planes, [s.channel], hist, dst, s.range, scale);
              const ours = calcBackProject(hsv, row, { ...s, scale });
              expectIdentical(ours.data, dst.data, hsv.width * hsv.height);
            });
          }
        }
      });
    });
  }
});

describe("meanShift and camShift match cv.meanShift and cv.CamShift", () => {
  const criteria: Array<[number, number]> = [
    [10, 1],
    [100, 0],
    [3, 2.5],
  ];
  /**
   * Start windows for an image: corners, centre, overhanging and outside.
   *
   * @param image - The image.
   * @returns Windows.
   */
  const windows = (image: Matrix<"u8">): Rect[] => [
    { x: 0, y: 0, width: 12, height: 10 },
    { x: 5, y: 3, width: image.width >> 1, height: image.height >> 1 },
    { x: image.width - 15, y: image.height - 12, width: 30, height: 30 },
    { x: 20, y: 15, width: 25, height: 20 },
    { x: -5, y: -5, width: 20, height: 20 },
    { x: image.width + 5, y: 2, width: 8, height: 8 },
  ];

  // OpenCV stores the box in single precision: its size agrees to this
  // relative tolerance and its angle to ANGLE_TOLERANCE degrees.
  const SIZE_TOLERANCE = 1e-6;
  const ANGLE_TOLERANCE = 1e-4;
  // OpenCV's box centre is the centre of its whole-pixel window: the rounded
  // centroid, plus half a pixel when the window's side is odd. So it is
  // within a pixel, in x and in y, of the centroid pixelvision reports,
  // unless the window is clipped by the image edge.
  const CENTRE_TOLERANCE = 1;

  for (const [name, image] of probabilityImages()) {
    it(name, () => {
      const src = toMat(cv, image);
      withMats([src], () => {
        for (const start of windows(image)) {
          for (const [maxIterations, epsilon] of criteria) {
            const label = `${JSON.stringify(start)}, ${maxIterations}, ${epsilon}`;
            const term = new cv.TermCriteria(
              cv.TermCriteria_EPS | cv.TermCriteria_COUNT,
              maxIterations,
              epsilon,
            );
            const rect = new cv.Rect(start.x, start.y, start.width, start.height);
            const [iterations, window] = cv.meanShift(src, rect, term);
            expect(meanShift(image, start, { maxIterations, epsilon }), label).toEqual({
              window: { x: window.x, y: window.y, width: window.width, height: window.height },
              iterations,
            });

            const [box, next] = cv.CamShift(src, rect, term);
            const ours = camShift(image, start, { maxIterations, epsilon });
            expect(ours.window, label).toEqual({
              x: next.x,
              y: next.y,
              width: next.width,
              height: next.height,
            });
            const scale = Math.max(1, ours.box.height);
            expect(Math.abs(ours.box.width - box.size.width) / scale, label).toBeLessThan(
              SIZE_TOLERANCE,
            );
            expect(Math.abs(ours.box.height - box.size.height) / scale, label).toBeLessThan(
              SIZE_TOLERANCE,
            );
            if (ours.box.height - ours.box.width > 1) {
              const turn = Math.abs(ours.box.angle - box.angle);
              expect(Math.min(turn, 180 - turn), label).toBeLessThan(ANGLE_TOLERANCE);
            }
            const w = ours.window;
            if (
              w.x > 0 &&
              w.y > 0 &&
              w.x + w.width < image.width &&
              w.y + w.height < image.height
            ) {
              expect(Math.abs(ours.box.center.x - box.center.x), label).toBeLessThanOrEqual(
                CENTRE_TOLERANCE,
              );
              expect(Math.abs(ours.box.center.y - box.center.y), label).toBeLessThanOrEqual(
                CENTRE_TOLERANCE,
              );
            }
          }
        }
      });
    });
  }

  it("meanShift and camShift round halves to even, as OpenCV", () => {
    // A 10 x 10 blob at (40, 30): its centroid is (44.5, 34.5), so a 40 x 40
    // window at (20, 10) is 4.5 px off centre each way.
    const image = createMatrix(100, 80);
    for (let y = 30; y < 40; y++) image.data.fill(255, y * 100 + 40, y * 100 + 50);
    const src = toMat(cv, image);
    withMats([src], () => {
      for (const start of [
        { x: 20, y: 10, width: 40, height: 40 },
        { x: 21, y: 11, width: 40, height: 40 },
        { x: 30, y: 25, width: 21, height: 13 },
      ]) {
        const term = new cv.TermCriteria(cv.TermCriteria_EPS | cv.TermCriteria_COUNT, 10, 1);
        const rect = new cv.Rect(start.x, start.y, start.width, start.height);
        const [iterations, window] = cv.meanShift(src, rect, term);
        expect(meanShift(image, start)).toEqual({
          window: { x: window.x, y: window.y, width: window.width, height: window.height },
          iterations,
        });
        const [, next] = cv.CamShift(src, rect, term);
        expect(camShift(image, start).window).toEqual({
          x: next.x,
          y: next.y,
          width: next.width,
          height: next.height,
        });
      }
    });
  });

  it("camShift reports the centroid where OpenCV's box centre is pushed off by the left edge", () => {
    // A 9 x 31 bar against the left edge: its centroid is (4, 50).
    const image = createMatrix(100, 100);
    for (let y = 35; y < 66; y++) image.data.fill(255, y * 100, y * 100 + 9);
    const start = { x: 0, y: 40, width: 20, height: 20 };
    const src = toMat(cv, image);
    withMats([src], () => {
      const term = new cv.TermCriteria(cv.TermCriteria_EPS | cv.TermCriteria_COUNT, 10, 1);
      const [box] = cv.CamShift(src, new cv.Rect(0, 40, 20, 20), term);
      const ours = camShift(image, start);
      expect(ours.box.center).toEqual({ x: 4, y: 50 });
      // OpenCV centres a 12-pixel window on x = 4, clips its left side to
      // the edge without narrowing it, and reports that window's centre.
      expect(box.center).toEqual({ x: 6, y: 50 });
    });
  });
});
