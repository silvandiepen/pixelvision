import {
  adaptiveThreshold,
  approxPolygon,
  connectedComponents,
  inRange,
  laplacian,
  medianBlur,
  morphology,
  rgbToHsv,
  arcLength,
  boundingRect,
  convexHull,
  huMoments,
  minAreaRect,
  moments,
  contourArea,
  dilate,
  erode,
  findContours,
  gaussianBlur,
  integralImage,
  otsuLevel,
  perspectiveTransform,
  threshold,
  warpPerspective,
} from "pixelvision";
import type { Matrix, Point } from "pixelvision";
import { beforeAll, describe, expect, it } from "vitest";

import {
  expectClose,
  expectIdentical,
  gray,
  loadOpenCv,
  standardFixtures,
  toMat,
  withMats,
} from "../src";
import type { OpenCv } from "../src";

let cv: OpenCv;
beforeAll(async () => {
  ({ cv } = await loadOpenCv());
}, 60_000);

const fixtures = standardFixtures.filter((f) => f.width >= 20 && f.height >= 20);

/** Reads a Mat's elements as numbers, in its own element type. */
const values = (mat: OpenCv): number[] => {
  const depth = mat.type() % 8;
  const view =
    depth === cv.CV_64F
      ? mat.data64F
      : depth === cv.CV_32F
        ? mat.data32F
        : depth === cv.CV_32S
          ? mat.data32S
          : depth === cv.CV_16S
            ? mat.data16S
            : mat.data;
  return Array.from(view as ArrayLike<number>);
};

describe("threshold and otsuLevel match cv.threshold(THRESH_OTSU)", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const image = gray(fixture);
      const src = toMat(cv, image);
      const dst = new cv.Mat();
      withMats([src, dst], () => {
        const level = cv.threshold(src, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        expect(otsuLevel(image)).toBe(level);
        expectIdentical(threshold(image).data, values(dst), image.width * image.height);
      });
    });
  }
});

describe("dilate and erode match cv.dilate / cv.erode with a square kernel", () => {
  for (const radius of [1, 2]) {
    for (const fixture of fixtures) {
      it(`radius ${radius}: ${fixture.name}`, () => {
        const image = gray(fixture);
        const size = radius * 2 + 1;
        const src = toMat(cv, image);
        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(size, size));
        const dilated = new cv.Mat();
        const eroded = new cv.Mat();
        withMats([src, kernel, dilated, eroded], () => {
          cv.dilate(src, dilated, kernel);
          cv.erode(src, eroded, kernel);
          const n = image.width * image.height;

          expectIdentical(dilate(image, { radius }).data, values(dilated), n);
          expectIdentical(erode(image, { radius }).data, values(eroded), n);
        });
      });
    }
  }
});

describe("findContours matches cv.findContours(RETR_EXTERNAL, CHAIN_APPROX_NONE)", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const binary = threshold(gaussianBlur(gray(fixture), { kernelSize: 5 }));
      const src = toMat(cv, binary);
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      withMats([src, contours, hierarchy], () => {
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE);
        const reference: Point[][] = [];
        for (let i = 0; i < contours.size(); i++) {
          const c = contours.get(i);
          const pts = c.data32S as Int32Array;
          reference.push(
            Array.from({ length: pts.length / 2 }, (_, k) => ({
              x: pts[k * 2],
              y: pts[k * 2 + 1],
            })),
          );
          c.delete();
        }
        const ours = findContours(binary);
        const key = (c: Point[]) =>
          c
            .map((p) => `${p.x},${p.y}`)
            .sort()
            .join(" ");

        // Same outlines (as point sets; OpenCV may start and turn the other way).
        expect(ours.map(key).sort()).toEqual(reference.map(key).sort());
        // Same area and perimeter for each.
        const byKey = new Map(reference.map((c) => [key(c), c]));
        for (const contour of ours) {
          const match = byKey.get(key(contour))!;
          const mat = cv.matFromArray(
            match.length,
            1,
            cv.CV_32SC2,
            match.flatMap((p) => [p.x, p.y]),
          );
          withMats([mat], () => {
            expect(Math.abs(contourArea(contour))).toBeCloseTo(cv.contourArea(mat), 6);
            // OpenCV sums the perimeter in single precision.
            expect(Math.abs(arcLength(contour) - cv.arcLength(mat, true))).toBeLessThan(
              1e-4 * arcLength(contour) + 1e-6,
            );
          });
        }
      });
    });
  }
});

describe("integralImage matches cv.integral2", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const image = gray(fixture);
      const src = toMat(cv, image);
      const sum = new cv.Mat();
      const sq = new cv.Mat();
      withMats([src, sum, sq], () => {
        cv.integral2(src, sum, sq, cv.CV_64F, cv.CV_64F);
        const ours = integralImage(image, { sum: true, squares: true });
        const cells = (image.width + 1) * (image.height + 1);

        expectIdentical(ours.sum!.data, values(sum), cells);
        expectIdentical(ours.squares!.data, values(sq), cells);
      });
    });
  }
});

describe("perspectiveTransform matches cv.getPerspectiveTransform", () => {
  const quads: Array<[Point[], Point[]]> = [
    [
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 60 },
        { x: 0, y: 60 },
      ],
      [
        { x: 12, y: 8 },
        { x: 95, y: 15 },
        { x: 105, y: 70 },
        { x: 3, y: 55 },
      ],
    ],
    [
      [
        { x: 5, y: 5 },
        { x: 300, y: 20 },
        { x: 290, y: 200 },
        { x: 10, y: 190 },
      ],
      [
        { x: 0, y: 0 },
        { x: 856, y: 0 },
        { x: 856, y: 540 },
        { x: 0, y: 540 },
      ],
    ],
  ];
  quads.forEach(([from, to], i) => {
    it(`quad ${i}`, () => {
      const a = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        from.flatMap((p) => [p.x, p.y]),
      );
      const b = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        to.flatMap((p) => [p.x, p.y]),
      );
      const m = cv.getPerspectiveTransform(a, b);
      withMats([a, b, m], () => expectClose(perspectiveTransform(from, to), values(m), 9, 1e-9));
    });
  });
});

describe("blur and warp agree with OpenCV within rounding", () => {
  /**
   * Asserts every difference (pixelvision − OpenCV) lies in the `[low, high]`
   * range `bound` gives for its index; a `null` bound skips the value.
   *
   * @param a - pixelvision values.
   * @param b - OpenCV values.
   * @param bound - Allowed difference range per index, or null to skip it.
   */
  const within = (
    a: ArrayLike<number>,
    b: ArrayLike<number>,
    bound: (index: number) => readonly [number, number] | null,
  ) => {
    expect(a.length).toBe(b.length);
    let checked = 0;
    for (let i = 0; i < a.length; i++) {
      const range = bound(i);
      if (!range) continue;
      checked++;
      const d = a[i] - b[i];
      if (d < range[0] || d > range[1]) {
        expect.fail(`value ${i}: pixelvision ${a[i]}, OpenCV ${b[i]}`);
      }
    }
    // Most values must count, or a bound that skips everything would pass.
    expect(checked).toBeGreaterThan(a.length / 2);
  };

  for (const fixture of fixtures) {
    // jsfeat-style 8-bit blurs round down after each of the two passes;
    // OpenCV keeps the intermediate at higher precision and rounds once. So
    // pixelvision is 0–2 lower, never higher.
    it(`GaussianBlur 5x5: ${fixture.name}`, () => {
      const image = gray(fixture);
      const src = toMat(cv, image);
      const dst = new cv.Mat();
      withMats([src, dst], () => {
        cv.GaussianBlur(src, dst, new cv.Size(5, 5), 0, 0, cv.BORDER_REPLICATE);
        within(gaussianBlur(image, { kernelSize: 5 }).data, values(dst), () => [-2, 0] as const);
      });
    });

    // OpenCV quantises sample positions to 1/32 pixel and rounds its fixed-point
    // weights, which moves results on hard edges by a few levels; pixelvision
    // rounds down. Near the border OpenCV blends with the border value while
    // pixelvision fills, so only pixels sampled at least 1 px inside count.
    it(`warpPerspective: ${fixture.name}`, () => {
      const image: Matrix<"u8"> = gray(fixture);
      const t = [1.05, 0.08, -3, -0.04, 0.97, 2, 0.0004, -0.0003, 1];
      const src = toMat(cv, image);
      const dst = new cv.Mat();
      const m = cv.matFromArray(3, 3, cv.CV_64FC1, t);
      withMats([src, dst, m], () => {
        cv.warpPerspective(
          src,
          dst,
          m,
          new cv.Size(image.width, image.height),
          cv.INTER_LINEAR | cv.WARP_INVERSE_MAP,
          cv.BORDER_CONSTANT,
          new cv.Scalar(0),
        );
        // A 1/32 px position error moves a bilinear sample by at most the
        // 2x2 block's contrast / 32 (both ways: /16), plus rounding on both sides.
        const bound = (i: number): [number, number] | null => {
          const x = i % image.width;
          const y = Math.floor(i / image.width);
          const w = t[6] * x + t[7] * y + t[8];
          const xs = (t[0] * x + t[1] * y + t[2]) / w;
          const ys = (t[3] * x + t[4] * y + t[5]) / w;
          if (xs < 1 || ys < 1 || xs > image.width - 2 || ys > image.height - 2) return null;
          const x0 = Math.floor(xs);
          const y0 = Math.floor(ys);
          const block = [0, 1, image.width, image.width + 1].map(
            (o) => image.data[y0 * image.width + x0 + o],
          );
          const limit = 2 + (Math.max(...block) - Math.min(...block)) / 16;
          return [-limit, limit];
        };
        within(warpPerspective(image, t).data, values(dst), bound);
      });
    });
  }
});

describe("approxPolygon matches cv.approxPolyDP (closed)", () => {
  // Every contour OpenCV finds in the fixtures (outer borders and holes, at
  // several thresholds) is simplified by both at several tolerances; the
  // vertices must be identical.
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const image = gaussianBlur(gray(fixture), { kernelSize: 3 });
      let compared = 0;
      for (const blockSize of [3, 13, 23]) {
        const binary = adaptiveThreshold(image, { blockSize, offset: 7, invert: true });
        const src = toMat(cv, binary);
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        withMats([src, contours, hierarchy], () => {
          cv.findContours(src, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_NONE);
          for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const values = contour.data32S as Int32Array;
            const points = Array.from({ length: values.length / 2 }, (_, k) => ({
              x: values[k * 2],
              y: values[k * 2 + 1],
            }));
            for (const rate of [0.01, 0.03, 0.1]) {
              const epsilon = points.length * rate;
              const approx = new cv.Mat();
              cv.approxPolyDP(contour, approx, epsilon, true);
              const reference = Array.from(approx.data32S as Int32Array);
              approx.delete();
              expect(approxPolygon(points, epsilon).flatMap((p) => [p.x, p.y])).toEqual(reference);
              compared++;
            }
            contour.delete();
          }
        });
      }
      expect(compared).toBeGreaterThan(0);
    });
  }
});

describe("shape analysis matches OpenCV", () => {
  /** Contours of the fixtures' bright regions, as OpenCV Mats and as points. */
  const shapeContours = () =>
    fixtures.flatMap((fixture) =>
      findContours(threshold(gaussianBlur(gray(fixture), { kernelSize: 5 })), {
        minPixels: 20,
      }).map((contour, i) => ({ name: `${fixture.name} #${i}`, contour })),
    );
  const asMat = (points: Point[]) =>
    cv.matFromArray(
      points.length,
      1,
      cv.CV_32SC2,
      points.flatMap((p) => [p.x, p.y]),
    );

  it("boundingRect matches cv.boundingRect", () => {
    for (const { name, contour } of shapeContours()) {
      const mat = asMat(contour);
      withMats([mat], () => {
        const r = cv.boundingRect(mat);
        expect(boundingRect(contour), name).toEqual({
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
        });
      });
    }
  });

  it("convexHull matches cv.convexHull as a point set", () => {
    for (const { name, contour } of shapeContours()) {
      const mat = asMat(contour);
      const hull = new cv.Mat();
      withMats([mat, hull], () => {
        cv.convexHull(mat, hull, false, true);
        const reference = Array.from(
          { length: hull.rows },
          (_, k) => `${hull.data32S[k * 2]},${hull.data32S[k * 2 + 1]}`,
        );
        const ours = convexHull(contour).map((p) => `${p.x},${p.y}`);
        expect(ours.sort(), name).toEqual(reference.sort());
      });
    }
  });

  it("minAreaRect matches cv.minAreaRect (area and centre)", () => {
    for (const { name, contour } of shapeContours()) {
      const mat = asMat(contour);
      withMats([mat], () => {
        const r = cv.minAreaRect(mat);
        const ours = minAreaRect(contour);
        expect(ours.width * ours.height, name).toBeCloseTo(r.size.width * r.size.height, 2);
        expect(ours.center.x, name).toBeCloseTo(r.center.x, 2);
        expect(ours.center.y, name).toBeCloseTo(r.center.y, 2);
      });
    }
  });

  it("moments and huMoments match cv.moments / cv.HuMoments on contours", () => {
    for (const { name, contour } of shapeContours()) {
      const mat = asMat(contour);
      const hu = new cv.Mat();
      withMats([mat, hu], () => {
        const reference = cv.moments(mat, false);
        const ours = moments(contour);
        for (const key of [
          "m00",
          "m10",
          "m01",
          "m20",
          "m11",
          "m02",
          "m30",
          "m21",
          "m12",
          "m03",
          "mu20",
          "mu11",
          "mu02",
          "mu30",
          "mu21",
          "mu12",
          "mu03",
          "nu20",
          "nu11",
          "nu02",
          "nu30",
          "nu21",
          "nu12",
          "nu03",
        ] as const) {
          // Central moments subtract large spatial moments, so measure their
          // error against the spatial moment of the same order.
          const base = key.startsWith("mu") ? reference[`m${key.slice(2)}`] : reference[key];
          const scale = Math.max(1, Math.abs(base));
          expect(Math.abs(ours[key] - reference[key]) / scale, `${name} ${key}`).toBeLessThan(1e-6);
        }
        cv.HuMoments(reference, hu);
        const referenceHu = Array.from(hu.data64F as Float64Array);
        huMoments(ours).forEach((h, k) =>
          expect(Math.abs(h - referenceHu[k]), `${name} hu${k + 1}`).toBeLessThan(
            1e-9 + 1e-6 * Math.abs(referenceHu[k]),
          ),
        );
      });
    }
  });
});

describe("OpenCV tier 1 filters match exactly", () => {
  const rgbaMat = (fixture: (typeof fixtures)[number]) =>
    cv.matFromArray(fixture.height, fixture.width, cv.CV_8UC4, Array.from(fixture.data));

  for (const fixture of fixtures) {
    it(`inRange and rgbToHsv: ${fixture.name}`, () => {
      const rgba = rgbaMat(fixture);
      const rgb = new cv.Mat();
      const hsv = new cv.Mat();
      const lo = cv.matFromArray(1, 3, cv.CV_8UC1, [0, 40, 30]);
      const hi = cv.matFromArray(1, 3, cv.CV_8UC1, [90, 255, 220]);
      const mask = new cv.Mat();
      withMats([rgba, rgb, hsv, lo, hi, mask], () => {
        cv.cvtColor(rgba, rgb, cv.COLOR_RGBA2RGB);
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        const ours = rgbToHsv(fixture);
        expectIdentical(ours.data, values(hsv), fixture.width * fixture.height * 3);

        const lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), new cv.Scalar(0, 40, 30));
        const upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), new cv.Scalar(90, 255, 220));
        withMats([lower, upper], () => {
          cv.inRange(hsv, lower, upper, mask);
          expectIdentical(
            inRange(ours, [0, 40, 30], [90, 255, 220]).data,
            values(mask),
            fixture.width * fixture.height,
          );
        });
      });
    });

    it(`medianBlur, morphology and laplacian: ${fixture.name}`, () => {
      const image = gray(fixture);
      const n = image.width * image.height;
      const src = toMat(cv, image);
      const median3 = new cv.Mat();
      const median5 = new cv.Mat();
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      const opened = new cv.Mat();
      const closed = new cv.Mat();
      const gradient = new cv.Mat();
      const lap1 = new cv.Mat();
      const lap3 = new cv.Mat();
      withMats([src, median3, median5, kernel, opened, closed, gradient, lap1, lap3], () => {
        cv.medianBlur(src, median3, 3);
        cv.medianBlur(src, median5, 5);
        expectIdentical(medianBlur(image, 3).data, values(median3), n);
        expectIdentical(medianBlur(image, 5).data, values(median5), n);

        cv.morphologyEx(src, opened, cv.MORPH_OPEN, kernel);
        cv.morphologyEx(src, closed, cv.MORPH_CLOSE, kernel);
        cv.morphologyEx(src, gradient, cv.MORPH_GRADIENT, kernel);
        expectIdentical(morphology(image, "open").data, values(opened), n);
        expectIdentical(morphology(image, "close").data, values(closed), n);
        expectIdentical(morphology(image, "gradient").data, values(gradient), n);

        // OpenCV.js has no 8-bit to 32-bit Laplacian; 16-bit holds every value.
        cv.Laplacian(src, lap1, cv.CV_16S, 1);
        cv.Laplacian(src, lap3, cv.CV_16S, 3);
        expectIdentical(laplacian(image).data, values(lap1), n);
        expectIdentical(laplacian(image, { size: 3 }).data, values(lap3), n);
      });
    });

    it(`adaptiveThreshold and connectedComponents: ${fixture.name}`, () => {
      const image = gray(fixture);
      const n = image.width * image.height;
      const src = toMat(cv, image);
      const mean = new cv.Mat();
      const meanInv = new cv.Mat();
      const gauss = new cv.Mat();
      withMats([src, mean, meanInv, gauss], () => {
        cv.adaptiveThreshold(src, mean, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 2.5);
        cv.adaptiveThreshold(
          src,
          meanInv,
          255,
          cv.ADAPTIVE_THRESH_MEAN_C,
          cv.THRESH_BINARY_INV,
          7,
          3,
        );
        cv.adaptiveThreshold(
          src,
          gauss,
          255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          cv.THRESH_BINARY,
          11,
          2,
        );
        expectIdentical(
          adaptiveThreshold(image, { blockSize: 11, offset: 2.5 }).data,
          values(mean),
          n,
        );
        expectIdentical(
          adaptiveThreshold(image, { blockSize: 7, offset: 3, invert: true }).data,
          values(meanInv),
          n,
        );
        // Gaussian method: float mean vs OpenCV fixed point; under 1% of pixels may differ.
        const ours = adaptiveThreshold(image, { blockSize: 11, method: "gaussian" }).data;
        const theirs = values(gauss);
        let differ = 0;
        for (let i = 0; i < n; i++) if (ours[i] !== theirs[i]) differ++;
        expect(differ / n).toBeLessThan(0.01);
      });

      const binary = threshold(gaussianBlur(image, { kernelSize: 5 }));
      const bin = toMat(cv, binary);
      const labels = new cv.Mat();
      const stats = new cv.Mat();
      const centroids = new cv.Mat();
      withMats([bin, labels, stats, centroids], () => {
        const count = cv.connectedComponentsWithStats(bin, labels, stats, centroids, 8, cv.CV_32S);
        const ours = connectedComponents(binary);
        expect(ours.components).toHaveLength(count - 1);
        expectIdentical(ours.labels.data, values(labels), n);
        const s = values(stats);
        const c = values(centroids);
        ours.components.forEach((component, k) => {
          const row = (k + 1) * 5;
          expect([
            component.x,
            component.y,
            component.width,
            component.height,
            component.area,
          ]).toEqual(s.slice(row, row + 5));
          expect(component.centroid.x).toBeCloseTo(c[(k + 1) * 2], 9);
          expect(component.centroid.y).toBeCloseTo(c[(k + 1) * 2 + 1], 9);
        });
      });
    });
  }
});
