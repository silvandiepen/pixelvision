import {
  bilateralFilter,
  calcHist,
  clahe,
  createMatrix,
  distanceTransform,
  filter2D,
  floodFill,
  gaussianBlur,
  hlsToRgb,
  hsvToRgb,
  labToRgb,
  matchTemplate,
  minMaxLoc,
  rgbToHls,
  rgbToHsv,
  rgbToLab,
  rgbToYCrCb,
  threshold,
  yCrCbToRgb,
} from "pixelvision";
import type { DistanceMetric, Kernel, Matrix, TemplateMatchMethod } from "pixelvision";
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
 * A binary image of a fixture's bright regions.
 *
 * @param fixture - RGBA fixture.
 * @returns A `u8` matrix of 0 and 255.
 */
const binary = (fixture: Fixture): Matrix<"u8"> =>
  threshold(gaussianBlur(gray(fixture), { kernelSize: 5 }));

/**
 * Reads a Mat's elements in its own element type.
 *
 * @param mat - The Mat.
 * @returns Its values, row by row.
 */
const values = (mat: OpenCv): ArrayLike<number> => {
  const depth = mat.type() % 8;
  return depth === cv.CV_32F ? mat.data32F : depth === cv.CV_32S ? mat.data32S : mat.data;
};

/**
 * Wraps a kernel in a `CV_32F` Mat.
 *
 * @param kernel - Rows of weights.
 * @returns The Mat (caller deletes it).
 */
const kernelMat = (kernel: Kernel): OpenCv =>
  cv.matFromArray(kernel.length, kernel[0].length, cv.CV_32FC1, kernel.flat());

describe("colour conversions match cv.cvtColor on every 8-bit triple", () => {
  // All 2^24 byte triples, as a 4096 x 4096 image.
  const side = 4096;
  const cube = createMatrix(side, side, { channels: 3 });
  for (let i = 0; i < side * side; i++) {
    cube.data[i * 3] = i >> 16;
    cube.data[i * 3 + 1] = (i >> 8) & 255;
    cube.data[i * 3 + 2] = i & 255;
  }
  const cases: Array<[string, (m: Matrix<"u8">) => Matrix<"u8">, string]> = [
    ["rgbToHsv", rgbToHsv, "COLOR_RGB2HSV"],
    ["rgbToHls", rgbToHls, "COLOR_RGB2HLS"],
    ["rgbToLab", rgbToLab, "COLOR_RGB2Lab"],
    ["rgbToYCrCb", rgbToYCrCb, "COLOR_RGB2YCrCb"],
    ["hsvToRgb", hsvToRgb, "COLOR_HSV2RGB"],
    ["hlsToRgb", hlsToRgb, "COLOR_HLS2RGB"],
    ["labToRgb", labToRgb, "COLOR_Lab2RGB"],
    ["yCrCbToRgb", yCrCbToRgb, "COLOR_YCrCb2RGB"],
  ];
  for (const [name, convert, code] of cases) {
    it(name, { timeout: 120_000 }, () => {
      const src = toMat(cv, cube);
      const dst = new cv.Mat();
      withMats([src, dst], () => {
        cv.cvtColor(src, dst, cv[code]);
        expectIdentical(convert(cube).data, values(dst), side * side * 3);
      });
    });
  }

  const forward: Array<[(image: Fixture) => Matrix<"u8">, string]> = [
    [rgbToHsv, "COLOR_RGB2HSV"],
    [rgbToHls, "COLOR_RGB2HLS"],
    [rgbToLab, "COLOR_RGB2Lab"],
    [rgbToYCrCb, "COLOR_RGB2YCrCb"],
  ];
  for (const fixture of fixtures) {
    it(`RGBA input: ${fixture.name}`, () => {
      const rgba = cv.matFromArray(
        fixture.height,
        fixture.width,
        cv.CV_8UC4,
        Array.from(fixture.data),
      );
      const three = new cv.Mat();
      withMats([rgba, three], () => {
        cv.cvtColor(rgba, three, cv.COLOR_RGBA2RGB);
        for (const [convert, code] of forward) {
          const dst = new cv.Mat();
          withMats([dst], () => {
            cv.cvtColor(three, dst, cv[code]);
            expectIdentical(convert(fixture).data, values(dst), fixture.width * fixture.height * 3);
          });
        }
      });
    });
  }
});

describe("filter2D matches cv.filter2D (anchor at the centre, BORDER_REPLICATE)", () => {
  const random = seededRandom(21);
  const randomKernel = (w: number, h: number): Kernel =>
    Array.from({ length: h }, () =>
      Array.from({ length: w }, () => Math.round((random() - 0.4) * 1000) / 997),
    );
  const kernels: Array<[string, Kernel]> = [
    [
      "sharpen 3x3",
      [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
      ],
    ],
    ["box 1x1", [[0.5]]],
    ["row 1x5", [[0.1, 0.2, 0.4, 0.2, 0.1]]],
    ["random 5x3", randomKernel(5, 3)],
    ["random 4x4 (even)", randomKernel(4, 4)],
    ["random 7x7", randomKernel(7, 7)],
  ];

  for (const fixture of fixtures) {
    for (const [name, kernel] of kernels) {
      it(`${name}: ${fixture.name}`, () => {
        for (const image of [gray(fixture), rgb(fixture)]) {
          const n = image.width * image.height * image.channels;
          const src = toMat(cv, image);
          const k = kernelMat(kernel);
          const bytes = new cv.Mat();
          const floats = new cv.Mat();
          withMats([src, k, bytes, floats], () => {
            const anchor = new cv.Point(-1, -1);
            cv.filter2D(src, bytes, cv.CV_8U, k, anchor, 3.25, cv.BORDER_REPLICATE);
            cv.filter2D(src, floats, cv.CV_32F, k, anchor, 0, cv.BORDER_REPLICATE);
            expectIdentical(filter2D(image, kernel, { delta: 3.25 }).data, values(bytes), n);
            expectIdentical(filter2D(image, kernel, { type: "f32" }).data, values(floats), n);
          });
        }
      });
    }

    // From 50 weights on, OpenCV filters through a Fourier transform; its
    // rounding can move a byte by one level.
    it(`random 8x8 within one level: ${fixture.name}`, () => {
      const image = gray(fixture);
      const kernel = randomKernel(8, 8).map((row) => row.map((v) => v / 16));
      const src = toMat(cv, image);
      const k = kernelMat(kernel);
      const dst = new cv.Mat();
      withMats([src, k, dst], () => {
        cv.filter2D(src, dst, cv.CV_8U, k, new cv.Point(-1, -1), 0, cv.BORDER_REPLICATE);
        const ours = filter2D(image, kernel).data;
        const theirs = values(dst);
        for (let i = 0; i < image.width * image.height; i++) {
          if (Math.abs(ours[i] - theirs[i]) > 1)
            expect.fail(`value ${i}: ${ours[i]} vs ${theirs[i]}`);
        }
      });
    });
  }
});

describe("bilateralFilter matches cv.bilateralFilter (BORDER_REPLICATE)", () => {
  const settings = [
    { diameter: 5, sigmaColor: 50, sigmaSpace: 50 },
    { diameter: 9, sigmaColor: 75, sigmaSpace: 75 },
    { diameter: 4, sigmaColor: 20, sigmaSpace: 3 },
    { diameter: 0, sigmaColor: 30, sigmaSpace: 2.4 },
  ];
  for (const fixture of fixtures) {
    for (const s of settings) {
      it(`d ${s.diameter}, σ ${s.sigmaColor}/${s.sigmaSpace}: ${fixture.name}`, () => {
        for (const image of [gray(fixture), rgb(fixture)]) {
          const src = toMat(cv, image);
          const dst = new cv.Mat();
          withMats([src, dst], () => {
            cv.bilateralFilter(
              src,
              dst,
              s.diameter,
              s.sigmaColor,
              s.sigmaSpace,
              cv.BORDER_REPLICATE,
            );
            expectIdentical(
              bilateralFilter(image, s).data,
              values(dst),
              image.width * image.height * image.channels,
            );
          });
        }
      });
    }
  }
});

describe("clahe matches cv.CLAHE.apply", () => {
  const settings = [
    { clipLimit: 40, tileGridSize: { width: 8, height: 8 } },
    { clipLimit: 2, tileGridSize: { width: 8, height: 8 } },
    { clipLimit: 3, tileGridSize: { width: 3, height: 5 } },
    { clipLimit: 0, tileGridSize: { width: 4, height: 4 } },
    { clipLimit: 1, tileGridSize: { width: 1, height: 1 } },
  ];
  for (const fixture of fixtures) {
    for (const s of settings) {
      it(`clip ${s.clipLimit}, ${s.tileGridSize.width}x${s.tileGridSize.height}: ${fixture.name}`, () => {
        const image = gray(fixture);
        const src = toMat(cv, image);
        const dst = new cv.Mat();
        const size = new cv.Size(s.tileGridSize.width, s.tileGridSize.height);
        const filter = new cv.CLAHE(s.clipLimit, size);
        withMats([src, dst, filter], () => {
          filter.apply(src, dst);
          expectIdentical(clahe(image, s).data, values(dst), image.width * image.height);
        });
      });
    }
  }
});

describe("calcHist matches cv.calcHist", () => {
  const settings: Array<{ bins: number; range: [number, number] }> = [
    { bins: 256, range: [0, 256] },
    { bins: 32, range: [0, 256] },
    { bins: 10, range: [20, 200.5] },
    { bins: 7, range: [-10, 90] },
  ];
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const image = rgb(fixture);
      const mask = binary(fixture);
      const src = toMat(cv, image);
      const maskMat = toMat(cv, mask);
      const none = new cv.Mat();
      const planes = new cv.MatVector();
      planes.push_back(src);
      withMats([src, maskMat, none, planes], () => {
        for (const s of settings) {
          for (const useMask of [false, true]) {
            const ours = calcHist(image, { ...s, mask: useMask ? mask : undefined });
            for (let c = 0; c < 3; c++) {
              const hist = new cv.Mat();
              withMats([hist], () => {
                cv.calcHist(planes, [c], useMask ? maskMat : none, hist, [s.bins], s.range, false);
                expectIdentical(
                  ours.data.subarray(c * s.bins, (c + 1) * s.bins),
                  values(hist),
                  s.bins,
                );
              });
            }
          }
        }
      });
    });
  }
});

describe("distanceTransform matches cv.distanceTransform", () => {
  const settings: Array<[DistanceMetric, 3 | 5, string]> = [
    ["l1", 3, "DIST_L1"],
    ["c", 3, "DIST_C"],
    ["l2", 3, "DIST_L2"],
    ["l2", 5, "DIST_L2"],
  ];
  for (const fixture of fixtures) {
    for (const [metric, maskSize, code] of settings) {
      it(`${metric} ${maskSize}x${maskSize}: ${fixture.name}`, () => {
        const shapes = binary(fixture);
        const inverted = createMatrix(shapes.width, shapes.height);
        inverted.data.set(shapes.data.map((v) => 255 - v));
        for (const image of [shapes, inverted]) {
          const src = toMat(cv, image);
          const dst = new cv.Mat();
          withMats([src, dst], () => {
            cv.distanceTransform(src, dst, cv[code], maskSize);
            expectIdentical(
              distanceTransform(image, { metric, maskSize }).data,
              values(dst),
              image.width * image.height,
            );
          });
        }
      });
    }
  }
});

describe("floodFill matches cv.floodFill (region, area, bounding box and mask)", () => {
  const settings = [
    { loDiff: 0, upDiff: 0, connectivity: 4 as const },
    { loDiff: 3, upDiff: 5, connectivity: 4 as const },
    { loDiff: 3, upDiff: 5, connectivity: 8 as const },
    { loDiff: 12, upDiff: 12, connectivity: 8 as const, fixedRange: true },
    { loDiff: 20, upDiff: 4, connectivity: 4 as const, fixedRange: true, maskOnly: true },
    { loDiff: 40, upDiff: 40, connectivity: 8 as const },
  ];
  for (const fixture of fixtures) {
    const seeds = [
      { x: 0, y: 0 },
      { x: fixture.width >> 1, y: fixture.height >> 1 },
      { x: fixture.width - 1, y: Math.floor(fixture.height * 0.3) },
      { x: Math.floor(fixture.width * 0.3), y: fixture.height - 1 },
    ];
    it(fixture.name, () => {
      for (const image of [gray(fixture), rgb(fixture)]) {
        const n = image.width * image.height;
        for (const s of settings) {
          for (const seed of seeds) {
            const value = image.channels === 1 ? [77] : [77, 0, 200];
            const src = toMat(cv, image);
            const mask = new cv.Mat();
            const rect = new cv.Rect();
            withMats([src, mask], () => {
              const flags =
                s.connectivity |
                (255 << 8) |
                (s.fixedRange ? cv.FLOODFILL_FIXED_RANGE : 0) |
                (s.maskOnly ? cv.FLOODFILL_MASK_ONLY : 0);
              const lo = new cv.Scalar(s.loDiff, s.loDiff, s.loDiff);
              const up = new cv.Scalar(s.upDiff, s.upDiff, s.upDiff);
              const area = cv.floodFill(
                src,
                mask,
                new cv.Point(seed.x, seed.y),
                new cv.Scalar(...value),
                rect,
                lo,
                up,
                flags,
              );
              const ours = floodFill(image, seed, value, s);
              const label = `${JSON.stringify(s)} seed ${seed.x},${seed.y}`;
              expect(ours.area, label).toBe(area);
              expect(ours.rect, label).toEqual({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              });
              expectIdentical(ours.image.data, values(src), n * image.channels);
              const inner = Array.from({ length: n }, (_, i) => {
                const x = i % image.width;
                const y = Math.floor(i / image.width);
                return mask.data[(y + 1) * (image.width + 2) + x + 1];
              });
              expectIdentical(ours.mask.data, inner, n);
            });
          }
        }
      }
    });
  }
});

describe("matchTemplate agrees with cv.matchTemplate", () => {
  // OpenCV correlates through a single-precision Fourier transform, so its
  // correlation carries a relative error of about 1e-6; pixelvision sums
  // exactly. How far that moves a score depends on the window: subtracting
  // the means of a low-contrast window cancels most of the correlation and
  // magnifies the error. So each score may differ by TOLERANCE times its
  // condition number: the correlation's bound sqrt(window energy x template
  // energy) over the score's denominator (for sqdiff, over 1). The largest
  // difference seen on the fixtures is 1.5e-6 of it.
  const TOLERANCE = 3e-6;
  const methods: Array<[TemplateMatchMethod, string]> = [
    ["sqdiff", "TM_SQDIFF"],
    ["sqdiff-normed", "TM_SQDIFF_NORMED"],
    ["ccorr-normed", "TM_CCORR_NORMED"],
    ["ccoeff-normed", "TM_CCOEFF_NORMED"],
  ];

  /**
   * Condition number of a score: how much a relative error in the
   * correlation is magnified.
   *
   * @param image - The image.
   * @param template - The template.
   * @param x - Window left.
   * @param y - Window top.
   * @param method - The score.
   * @returns The factor.
   */
  const condition = (
    image: Matrix<"u8">,
    template: Matrix<"u8">,
    x: number,
    y: number,
    method: TemplateMatchMethod,
  ): number => {
    const { channels: cn, width: tw, height: th } = template;
    const area = tw * th;
    let windowEnergy = 0;
    let templateEnergy = 0;
    let windowSpread = 0;
    let templateSpread = 0;
    for (let c = 0; c < cn; c++) {
      let ws = 0;
      let ts = 0;
      for (let ty = 0; ty < th; ty++) {
        for (let tx = 0; tx < tw; tx++) {
          const w = image.data[((y + ty) * image.width + x + tx) * cn + c];
          const t = template.data[(ty * tw + tx) * cn + c];
          ws += w;
          ts += t;
          windowEnergy += w * w;
          templateEnergy += t * t;
        }
      }
      windowSpread -= (ws * ws) / area;
      templateSpread -= (ts * ts) / area;
    }
    const bound = Math.sqrt(windowEnergy * templateEnergy);
    if (method === "sqdiff") return bound;
    if (method !== "ccoeff-normed") return 2;
    const denominator = Math.sqrt(
      Math.max(windowEnergy + windowSpread, 0) * Math.max(templateEnergy + templateSpread, 0),
    );
    return denominator > 0 ? bound / denominator : Infinity;
  };

  for (const fixture of fixtures) {
    it(fixture.name, () => {
      for (const image of [gray(fixture), rgb(fixture)]) {
        const cn = image.channels;
        const tw = Math.max(4, image.width >> 2);
        const th = Math.max(3, image.height >> 2);
        const x0 = Math.floor(image.width / 3);
        const y0 = Math.floor(image.height / 4);
        const template = createMatrix(tw, th, { channels: cn });
        for (let y = 0; y < th; y++) {
          template.data.set(
            image.data.subarray(
              ((y0 + y) * image.width + x0) * cn,
              ((y0 + y) * image.width + x0 + tw) * cn,
            ),
            y * tw * cn,
          );
        }
        const src = toMat(cv, image);
        const tpl = toMat(cv, template);
        withMats([src, tpl], () => {
          for (const [method, code] of methods) {
            const dst = new cv.Mat();
            withMats([dst], () => {
              cv.matchTemplate(src, tpl, dst, cv[code]);
              const ours = matchTemplate(image, template, { method });
              const theirs = values(dst);
              expect([ours.width, ours.height]).toEqual([dst.cols, dst.rows]);
              for (let i = 0; i < ours.width * ours.height; i++) {
                const k = condition(
                  image,
                  template,
                  i % ours.width,
                  Math.floor(i / ours.width),
                  method,
                );
                const difference = Math.abs(ours.data[i] - theirs[i]);
                if (!(difference <= TOLERANCE * k)) {
                  expect.fail(
                    `${method} value ${i}: pixelvision ${ours.data[i]}, OpenCV ${theirs[i]} (condition ${k})`,
                  );
                }
              }
              // The template was cut from the image: summed exactly, that
              // window scores a perfect match.
              const perfect = method === "sqdiff" || method === "sqdiff-normed" ? 0 : 1;
              expect(ours.data[y0 * ours.width + x0], method).toBe(perfect);
              const { min, max } = minMaxLoc(ours);
              expect(perfect === 0 ? min : max, method).toBe(perfect);
            });
          }
        });
      }
    });
  }
});

describe("minMaxLoc matches cv.minMaxLoc", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const image = gray(fixture);
      const mask = binary(fixture);
      const src = toMat(cv, image);
      const maskMat = toMat(cv, mask);
      withMats([src, maskMat], () => {
        for (const [ours, theirs] of [
          [minMaxLoc(image), cv.minMaxLoc(src)],
          ...(mask.data.includes(255)
            ? [[minMaxLoc(image, mask), cv.minMaxLoc(src, maskMat)]]
            : []),
        ]) {
          expect(ours).toEqual({
            min: theirs.minVal,
            max: theirs.maxVal,
            minLoc: theirs.minLoc,
            maxLoc: theirs.maxLoc,
          });
        }
      });
    });
  }
});
