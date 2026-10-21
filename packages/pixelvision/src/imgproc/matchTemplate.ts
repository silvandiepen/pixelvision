import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { MatchTemplateOptions } from "./matchTemplate.model";

const FLT_EPSILON = 2 ** -23;
const METHODS = ["sqdiff", "sqdiff-normed", "ccorr-normed", "ccoeff-normed"];

/**
 * Builds the integral of every channel and of its square, one row and
 * column larger than the image: `sums[(y * (w + 1) + x) * cn + c]` is the
 * sum of channel `c` over all pixels above and left of `(x, y)`.
 *
 * @param image - The image.
 * @returns Sums and sums of squares.
 */
function integrals(image: Matrix<"u8">): { sums: Float64Array; squares: Float64Array } {
  const { width: w, height: h, channels: cn, data } = image;
  const stride = (w + 1) * cn;
  const sums = new Float64Array(stride * (h + 1));
  const squares = new Float64Array(stride * (h + 1));
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < cn; c++) {
      let row = 0;
      let rowSquares = 0;
      for (let x = 0; x < w; x++) {
        const v = data[(y * w + x) * cn + c];
        row += v;
        rowSquares += v * v;
        const i = (y + 1) * stride + (x + 1) * cn + c;
        sums[i] = sums[i - stride] + row;
        squares[i] = squares[i - stride] + rowSquares;
      }
    }
  }
  return { sums, squares };
}

/**
 * Slides a template over an image and scores every position, as OpenCV's
 * `matchTemplate`: the result's `(x, y)` scores the template with its
 * top-left corner at `(x, y)`. Find the best position with
 * {@link minMaxLoc}: the minimum for the `sqdiff` methods, the maximum for
 * the others.
 *
 * The correlation is summed exactly and kept in double precision, so a
 * window identical to the template scores exactly 0 (`sqdiff`,
 * `sqdiff-normed`) or 1 (`ccorr-normed`, `ccoeff-normed`). OpenCV computes
 * the correlation with a single-precision Fourier transform and stores it in
 * single precision before subtracting it from the window and template
 * energies; that cancellation leaves its `sqdiff` of an exact match several
 * units above 0 and makes its scores of low-contrast windows noisy. The
 * normalisation and its special cases (flat windows, a flat template) follow
 * OpenCV's. Cost grows with image area times template area.
 *
 * @param image - `u8` matrix with 1, 3 or 4 channels.
 * @param template - `u8` matrix with the same channels, no larger than the image.
 * @param options - `method` and `out`.
 * @returns An `f32` matrix of scores, `(W - w + 1) x (H - h + 1)`.
 * @throws {TypeError} When the image or template isn't `u8`.
 * @throws {RangeError} When the channels differ or aren't 1, 3 or 4, the template is empty or larger than the image, or the method is unknown.
 *
 * @example
 * const scores = matchTemplate(frame, logo, { method: "ccoeff-normed" });
 * const { max, maxLoc } = minMaxLoc(scores);
 * if (max > 0.8) console.log(`logo at ${maxLoc.x}, ${maxLoc.y}`);
 */
export function matchTemplate(
  image: Matrix<"u8">,
  template: Matrix<"u8">,
  options: MatchTemplateOptions = {},
): Matrix<"f32"> {
  assertType("matchTemplate", image, "u8");
  assertType("matchTemplate", template, "u8");
  assertChannels("matchTemplate", image, 1, 3, 4);
  const { method = "ccoeff-normed" } = options;
  if (!METHODS.includes(method)) {
    throw new RangeError(`matchTemplate: unknown method ${String(method)}`);
  }
  const { width: W, height: H, channels: cn, data } = image;
  const { width: tw, height: th, data: tdata } = template;
  if (template.channels !== cn) {
    throw new RangeError(
      `matchTemplate: template has ${template.channels} channel(s), image ${cn}`,
    );
  }
  if (tw < 1 || th < 1 || tw > W || th > H) {
    throw new RangeError(`matchTemplate: template is ${tw}x${th}, must be 1x1 to ${W}x${H}`);
  }
  const rw = W - tw + 1;
  const rh = H - th + 1;
  const out = prepareOutput(options.out, "f32", rw, rh, 1);

  // Template statistics per channel: mean, energy (sum of squares) and
  // spread (energy about the mean), from whole-number sums so a flat
  // template and an exact match come out exact.
  const area = tw * th;
  const invArea = 1 / area;
  const mean: number[] = [];
  let energy = 0;
  let spread = 0;
  for (let c = 0; c < cn; c++) {
    let sum = 0;
    let squares = 0;
    for (let i = c; i < area * cn; i += cn) {
      sum += tdata[i];
      squares += tdata[i] * tdata[i];
    }
    mean.push(sum * invArea);
    energy += squares;
    spread += (area * squares - sum * sum) * invArea;
  }
  const coefficient = method === "ccoeff-normed";
  if (coefficient && spread * invArea < Number.EPSILON) {
    out.data.fill(1, 0, rw * rh);
    return out;
  }
  const norm = Math.sqrt(coefficient ? spread : energy);

  const { sums, squares } = integrals(image);
  const stride = (W + 1) * cn;
  const rowStep = stride * th;
  const colStep = tw * cn;
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      let correlation = 0;
      for (let ty = 0; ty < th; ty++) {
        let i = ((y + ty) * W + x) * cn;
        let t = ty * colStep;
        for (let k = 0; k < colStep; k++) correlation += data[i++] * tdata[t++];
      }
      // Kept in double precision: OpenCV rounds it to single precision here,
      // and "window - 2 x correlation + template" then loses the difference.
      let num = correlation;
      const corner = y * stride + x * cn;
      let windowMean2 = 0;
      let windowSum2 = 0;
      for (let c = 0; c < cn; c++) {
        const i = corner + c;
        if (coefficient) {
          const t = sums[i] - sums[i + colStep] - sums[i + rowStep] + sums[i + rowStep + colStep];
          windowMean2 += t * t;
          num -= t * mean[c];
        }
        windowSum2 +=
          squares[i] - squares[i + colStep] - squares[i + rowStep] + squares[i + rowStep + colStep];
      }
      windowMean2 *= invArea;
      if (method === "sqdiff" || method === "sqdiff-normed") {
        num = Math.max(windowSum2 - 2 * num + energy, 0);
      }
      if (method !== "sqdiff") {
        const diff2 = Math.max(windowSum2 - windowMean2, 0);
        const t =
          diff2 <= Math.min(0.5, 10 * FLT_EPSILON * windowSum2) ? 0 : Math.sqrt(diff2) * norm;
        if (Math.abs(num) < t) num /= t;
        else if (Math.abs(num) < t * 1.125) num = num > 0 ? 1 : -1;
        else num = method === "sqdiff-normed" ? 1 : 0;
      }
      out.data[y * rw + x] = num;
    }
  }
  return out;
}
