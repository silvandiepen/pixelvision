import jsfeat from "jsfeat";
import {
  boxBlur,
  boxSum,
  canny,
  detectSkin,
  equalizeHistogram,
  gaussianBlur,
  gaussianKernel,
  integralImage,
  pyrDown,
  resample,
  scharrDerivatives,
  sobelDerivatives,
  warpAffine,
  warpPerspective,
} from "pixelvision";
import type { PixelType } from "pixelvision";
import { describe, expect, it } from "vitest";
import { asType, expectIdentical, gray, jsfeatMatrix, standardFixtures, toJsfeat } from "../src";

const fixtures = standardFixtures;

describe("gaussianKernel matches jsfeat.math.get_gaussian_kernel", () => {
  for (const size of [1, 3, 5, 7, 9, 11, 15]) {
    for (const sigma of [0, 0.5, 1, 2.5]) {
      it(`size ${size}, sigma ${sigma}`, () => {
        const integer = new Int32Array(size);
        const float = new Float32Array(size);
        jsfeat.math.get_gaussian_kernel(size, sigma, integer, jsfeat.U8_t);
        jsfeat.math.get_gaussian_kernel(size, sigma, float, jsfeat.F32_t);

        expectIdentical(gaussianKernel(size, { sigma, integer: true }), integer, size);
        expectIdentical(gaussianKernel(size, { sigma }), float, size);
      });
    }
  }
});

describe("gaussianBlur matches jsfeat.imgproc.gaussian_blur", () => {
  const cases: Array<[PixelType, number, number]> = [
    ["u8", 3, 0],
    ["u8", 5, 0],
    ["u8", 7, 0],
    ["u8", 9, 0],
    ["u8", 5, 1.4],
    ["i32", 5, 0],
    ["f32", 5, 1.1],
    ["f64", 7, 0],
  ];
  for (const [type, kernelSize, sigma] of cases) {
    for (const fixture of fixtures) {
      it(`${type} kernel ${kernelSize} sigma ${sigma}: ${fixture.name}`, () => {
        const input = asType(gray(fixture), type);
        const reference = jsfeatMatrix(input.width, input.height, type);
        jsfeat.imgproc.gaussian_blur(toJsfeat(input), reference, kernelSize, sigma);

        const result = gaussianBlur(input, { kernelSize, sigma });

        expectIdentical(result.data, reference.data, input.width * input.height);
      });
    }
  }
});

describe("boxBlur and boxSum match jsfeat.imgproc.box_blur_gray", () => {
  for (const radius of [0, 1, 2, 4]) {
    // jsfeat reads past the row when the window is wider than the image.
    for (const fixture of fixtures.filter((f) => 2 * radius + 2 <= Math.min(f.width, f.height))) {
      it(`radius ${radius}: ${fixture.name}`, () => {
        const input = gray(fixture);
        const averaged = jsfeatMatrix(input.width, input.height, "u8");
        const summed = jsfeatMatrix(input.width, input.height, "i32");
        jsfeat.imgproc.box_blur_gray(toJsfeat(input), averaged, radius);
        jsfeat.imgproc.box_blur_gray(toJsfeat(input), summed, radius, jsfeat.BOX_BLUR_NOSCALE);

        const pixels = input.width * input.height;
        expectIdentical(boxBlur(input, { radius }).data, averaged.data, pixels);
        expectIdentical(boxSum(input, { radius }).data, summed.data, pixels);
      });
    }
  }
});

describe("pyrDown matches jsfeat.imgproc.pyrdown", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const input = gray(fixture);
      const reference = jsfeatMatrix(input.width >> 1, input.height >> 1, "u8");
      jsfeat.imgproc.pyrdown(toJsfeat(input), reference);

      const result = pyrDown(input);

      expectIdentical(result.data, reference.data, result.width * result.height);
    });
  }
});

describe("sobelDerivatives and scharrDerivatives match jsfeat", () => {
  // jsfeat reads a row that doesn't exist when the image is 1 pixel tall.
  for (const fixture of fixtures.filter((f) => f.height >= 2)) {
    for (const type of ["u8", "f32"] as const) {
      it(`${type}: ${fixture.name}`, () => {
        const input = asType(gray(fixture), type);
        const outType = type === "u8" ? "i32" : "f32";
        const sobel = jsfeatMatrix(input.width, input.height, outType, 2);
        const scharr = jsfeatMatrix(input.width, input.height, outType, 2);
        jsfeat.imgproc.sobel_derivatives(toJsfeat(input), sobel);
        jsfeat.imgproc.scharr_derivatives(toJsfeat(input), scharr);

        const values = input.width * input.height * 2;
        expectIdentical(sobelDerivatives(input).data, sobel.data, values);
        expectIdentical(scharrDerivatives(input).data, scharr.data, values);
      });
    }
  }
});

describe("integralImage matches jsfeat.imgproc.compute_integral_image", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const input = gray(fixture);
      const cells = (input.width + 1) * (input.height + 1);
      const sum = new Float64Array(cells);
      const squares = new Float64Array(cells);
      const tilted = new Float64Array(cells);
      jsfeat.imgproc.compute_integral_image(toJsfeat(input), sum, squares, tilted);

      const result = integralImage(input, { sum: true, squares: true, tilted: true });

      expectIdentical(result.sum!.data, sum, cells);
      expectIdentical(result.squares!.data, squares, cells);
      // jsfeat leaves the tilted table's column 0 at zero; pixelvision fills
      // it as OpenCV does (each cell takes the one up-right of it). Every
      // other cell is identical.
      const stride = input.width + 1;
      const ours = result.tilted!.data;
      for (let y = 0; y <= input.height; y++) {
        expect(ours[y * stride]).toBe(y === 0 ? 0 : ours[(y - 1) * stride + 1]);
        expect(tilted[y * stride]).toBe(0);
        ours[y * stride] = 0;
      }
      expectIdentical(ours, tilted, cells);
    });
  }
});

describe("equalizeHistogram matches jsfeat.imgproc.equalize_histogram", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const input = gray(fixture);
      const reference = jsfeatMatrix(input.width, input.height, "u8");
      jsfeat.imgproc.equalize_histogram(toJsfeat(input), reference);

      expectIdentical(equalizeHistogram(input).data, reference.data, input.width * input.height);
    });
  }
});

/**
 * jsfeat clears the bottom row before following edges, so it misses edges
 * that start there. Asserts that this is the only difference: pixelvision
 * only adds edges, and every added edge pixel connects (8-way, through
 * other added pixels) to an added pixel on the bottom row.
 */
const expectOnlyBottomRowGrowth = (
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  width: number,
  height: number,
) => {
  const extra = new Uint8Array(width * height);
  for (let i = 0; i < extra.length; i++) {
    if (actual[i] === expected[i]) continue;
    if (!(actual[i] === 255 && expected[i] === 0)) {
      expect.fail(`pixel ${i}: pixelvision ${actual[i]}, jsfeat ${expected[i]}`);
    }
    extra[i] = 1;
  }
  const stack: number[] = [];
  for (let x = 0; x < width; x++) {
    const i = (height - 1) * width + x;
    if (extra[i] === 1) {
      extra[i] = 2;
      stack.push(i);
    }
  }
  while (stack.length > 0) {
    const i = stack.pop()!;
    const x = i % width;
    const y = (i / width) | 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const n = ny * width + nx;
        if (extra[n] === 1) {
          extra[n] = 2;
          stack.push(n);
        }
      }
    }
  }
  const stray = extra.indexOf(1);
  if (stray !== -1) expect.fail(`pixel ${stray} is an extra edge not connected to the bottom row`);
};

describe("canny matches jsfeat.imgproc.canny", () => {
  const thresholds: Array<[number, number]> = [
    [20, 50],
    [10, 100],
    [60, 30],
  ];
  for (const [low, high] of thresholds) {
    for (const fixture of fixtures.filter((f) => f.height >= 2)) {
      it(`${low}/${high}: ${fixture.name}`, () => {
        const input = gaussianBlur(gray(fixture), { kernelSize: 3 });
        const reference = jsfeatMatrix(input.width, input.height, "u8");
        jsfeat.imgproc.canny(toJsfeat(input), reference, low, high);

        const result = canny(input, { low, high });

        expectOnlyBottomRowGrowth(result.data, reference.data, input.width, input.height);
      });
    }
  }
});

/**
 * Asserts two warp outputs agree on every pixel jsfeat sampled from
 * inside the image, skipping the border pixels jsfeat fills or
 * extrapolates by mistake.
 */
const expectWarpMatch = (
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  inside: (x: number, y: number) => boolean,
  width: number,
  height: number,
) => {
  const keep: number[] = [];
  const reference: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!inside(x, y)) continue;
      keep.push(actual[y * width + x]);
      reference.push(expected[y * width + x]);
    }
  }
  expectIdentical(keep, reference, keep.length);
};

describe("warpPerspective matches jsfeat.imgproc.warp_perspective inside the image", () => {
  const transforms: Record<string, number[]> = {
    identity: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    shifted: [1, 0, 2.5, 0, 1, 1.25, 0, 0, 1],
    "rotated and scaled": [0.9, -0.2, 6, 0.25, 0.85, -3, 0, 0, 1],
    projective: [1.1, 0.1, -4, -0.05, 0.95, 5, 0.0015, -0.001, 1],
  };
  for (const [name, values] of Object.entries(transforms)) {
    for (const fixture of fixtures.filter((f) => f.width > 2 && f.height > 2)) {
      it(`${name}: ${fixture.name}`, () => {
        const input = gray(fixture);
        const matrix = jsfeatMatrix(3, 3, "f32");
        matrix.data.set(values);
        const reference = jsfeatMatrix(input.width, input.height, "u8");
        jsfeat.imgproc.warp_perspective(toJsfeat(input), reference, matrix, 7);

        const result = warpPerspective(input, matrix.data, { fill: 7 });

        const m = matrix.data;
        expectWarpMatch(
          result.data,
          reference.data,
          (x, y) => {
            const w = m[6] * x + m[7] * y + m[8];
            const xs = (m[0] * x + m[1] * y + m[2]) / w;
            const ys = (m[3] * x + m[4] * y + m[5]) / w;
            return xs > 0.01 && ys > 0.01 && xs < input.width - 1.01 && ys < input.height - 1.01;
          },
          input.width,
          input.height,
        );
      });
    }
  }
});

describe("warpAffine matches jsfeat.imgproc.warp_affine inside the image", () => {
  const transforms: Record<string, number[]> = {
    identity: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    shifted: [1, 0, 3.5, 0, 1, -2.25, 0, 0, 1],
    "rotated and scaled": [0.95, -0.3, 8, 0.3, 0.95, -4, 0, 0, 1],
  };
  for (const [name, values] of Object.entries(transforms)) {
    for (const fixture of fixtures.filter((f) => f.width > 2 && f.height > 2)) {
      it(`${name}: ${fixture.name}`, () => {
        const input = gray(fixture);
        const matrix = jsfeatMatrix(3, 3, "f32");
        matrix.data.set(values);
        const reference = jsfeatMatrix(input.width, input.height, "u8");
        jsfeat.imgproc.warp_affine(toJsfeat(input), reference, matrix, 7);

        const result = warpAffine(input, matrix.data, { fill: 7 });

        const m = matrix.data;
        expectWarpMatch(
          result.data,
          reference.data,
          (x, y) => {
            const xs = m[0] * x + m[1] * y + m[2];
            const ys = m[3] * x + m[4] * y + m[5];
            return xs > 0.01 && ys > 0.01 && xs < input.width - 1.01 && ys < input.height - 1.01;
          },
          input.width,
          input.height,
        );
      });
    }
  }
});

describe("detectSkin matches jsfeat.imgproc.skindetector", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const reference = new Uint8Array(fixture.width * fixture.height);
      jsfeat.imgproc.skindetector(fixture, reference);

      expectIdentical(detectSkin(fixture).data, reference, reference.length);
    });
  }
});

describe("resample matches jsfeat.imgproc.resample when shrinking one channel", () => {
  const sizes: Array<[number, number]> = [
    [2, 2],
    [5, 3],
    [17, 11],
    [40, 30],
  ];
  for (const type of ["u8", "f32"] as const) {
    for (const [width, height] of sizes) {
      for (const fixture of fixtures.filter((f) => f.width > width && f.height > height)) {
        it(`${type} to ${width}x${height}: ${fixture.name}`, () => {
          const input = asType(gray(fixture), type);
          const reference = jsfeatMatrix(width, height, type);
          jsfeat.imgproc.resample(toJsfeat(input), reference, width, height);

          const result = resample(input, { width, height });

          expectIdentical(result.data, reference.data, width * height);
        });
      }
    }
  }
});
