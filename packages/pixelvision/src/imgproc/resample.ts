import { assertInteger } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix, PixelType } from "../core/matrix.model";
import type { ResampleOptions } from "./resample.model";

/**
 * Lists, for every output column, the input columns that overlap it and
 * by how much.
 *
 * @param width - Input width.
 * @param newWidth - Output width.
 * @param weight - Turns a coverage fraction (0–1) into the stored weight.
 * @returns Triples of `[output column, input column, weight]`.
 */
const columnWeights = (
  width: number,
  newWidth: number,
  weight: (coverage: number) => number,
): number[] => {
  const scaleX = width / newWidth;
  const table: number[] = [];
  for (let dx = 0; dx < newWidth; dx++) {
    const fsx1 = dx * scaleX;
    const fsx2 = fsx1 + scaleX;
    const sx1 = Math.min((fsx1 + 1 - 1e-6) | 0, width - 1);
    const sx2 = Math.min(fsx2 | 0, width - 1);
    if (sx1 > fsx1) table.push(dx, sx1 - 1, weight(sx1 - fsx1));
    for (let sx = sx1; sx < sx2; sx++) table.push(dx, sx, weight(1));
    if (fsx2 - sx2 > 1e-3) table.push(dx, sx2, weight(fsx2 - sx2));
  }
  return table;
};

/**
 * Resizes by bilinear interpolation, aligning pixel centres (as OpenCV's
 * `INTER_LINEAR`). Used when the image grows in either direction.
 *
 * @param image - Input matrix.
 * @param out - Output matrix, already shaped.
 */
const bilinear = <T extends PixelType>(image: Matrix<T>, out: Matrix<T>): void => {
  const { width: w, height: h, channels: ch, data: src } = image;
  const { width: nw, height: nh, data: dst } = out;
  const scaleX = w / nw;
  const scaleY = h / nh;
  const clamp = (value: number, max: number) => (value < 0 ? 0 : value > max ? max : value);
  for (let dy = 0, d = 0; dy < nh; dy++) {
    const ys = clamp((dy + 0.5) * scaleY - 0.5, h - 1);
    const y0 = Math.floor(ys);
    const y1 = Math.min(y0 + 1, h - 1);
    const b = ys - y0;
    for (let dx = 0; dx < nw; dx++) {
      const xs = clamp((dx + 0.5) * scaleX - 0.5, w - 1);
      const x0 = Math.floor(xs);
      const x1 = Math.min(x0 + 1, w - 1);
      const a = xs - x0;
      for (let c = 0; c < ch; c++, d++) {
        const p00 = src[(y0 * w + x0) * ch + c];
        const p01 = src[(y0 * w + x1) * ch + c];
        const p10 = src[(y1 * w + x0) * ch + c];
        const p11 = src[(y1 * w + x1) * ch + c];
        const top = p00 + a * (p01 - p00);
        const bottom = p10 + a * (p11 - p10);
        dst[d] = top + b * (bottom - top);
      }
    }
  }
};

/**
 * Resizes an image. Shrinking in both directions uses area averaging:
 * every output pixel is the mean of the input area it covers, so detail is
 * averaged rather than skipped and no aliasing appears. Otherwise
 * (growing, or growing one way and shrinking the other) it uses bilinear
 * interpolation.
 *
 * 8-bit images shrunk by a factor under 256 use fixed-point weights;
 * integer results are rounded down. Handles any number of channels and
 * enlarging as well as shrinking.
 *
 * @param image - Matrix to resize, any type and number of channels.
 * @param options - Output width and height, and an optional output matrix.
 * @returns The resized matrix, same type and channels.
 * @throws {RangeError} When the output size isn't a positive integer or the input is empty.
 *
 * @example
 * const preview = resample(gray, { width: 160, height: 120 });
 * const enlarged = resample(gray, { width: gray.width * 2, height: gray.height * 2 });
 */
export function resample<T extends PixelType>(
  image: Matrix<T>,
  options: ResampleOptions<T>,
): Matrix<T> {
  const { width: nw, height: nh } = options;
  const { width: w, height: h, channels: ch, type } = image;
  assertInteger("resample", "width", nw, 1);
  assertInteger("resample", "height", nh, 1);
  if (w === 0 || h === 0) throw new RangeError("resample: the input image is empty");
  const out = prepareOutput(options.out, type, nw, nh, ch);
  if (nw >= w || nh >= h) {
    bilinear(image, out);
    return out;
  }
  const src = image.data;
  const dst = out.data;
  const scaleX = w / nw;
  const scaleY = h / nh;
  const fixedPoint = type === "u8" && (h * w) / (nh * nw) < 0x100;
  const inverseArea = fixedPoint ? (scaleX * scaleY * 0x10000) | 0 : 1 / (scaleX * scaleY);
  const table = fixedPoint
    ? columnWeights(w, nw, (coverage) => (coverage === 1 ? 256 : (coverage * 256) | 0))
    : columnWeights(w, nw, (coverage) => Math.fround(coverage * inverseArea));
  const rowLength = nw * ch;
  const buf = fixedPoint ? new Int32Array(rowLength) : new Float32Array(rowLength);
  const sum = fixedPoint ? new Int32Array(rowLength) : new Float32Array(rowLength);

  for (let sy = 0, dy = 0; sy < h; sy++) {
    const rowStart = w * sy * ch;
    for (let k = 0; k < table.length; k += 3) {
      const dxn = table[k] * ch;
      const sx = rowStart + table[k + 1] * ch;
      const alpha = table[k + 2];
      for (let i = 0; i < ch; i++) buf[dxn + i] += src[sx + i] * alpha;
    }
    if ((dy + 1) * scaleY <= sy + 1 || sy === h - 1) {
      const beta = Math.max(sy + 1 - (dy + 1) * scaleY, 0);
      const target = rowLength * dy;
      if (fixedPoint) {
        const b = (beta * 256) | 0;
        for (let dx = 0; dx < rowLength; dx++) {
          const value = sum[dx] + buf[dx] * (b <= 0 ? 256 : 256 - b);
          dst[target + dx] = Math.min(Math.max(value / inverseArea, 0), 255);
          sum[dx] = b <= 0 ? 0 : buf[dx] * b;
          buf[dx] = 0;
        }
      } else {
        const flat = Math.abs(beta) < 1e-3;
        for (let dx = 0; dx < rowLength; dx++) {
          dst[target + dx] = flat ? sum[dx] + buf[dx] : sum[dx] + buf[dx] * (1 - beta);
          sum[dx] = flat ? 0 : buf[dx] * beta;
          buf[dx] = 0;
        }
      }
      dy++;
    } else {
      for (let dx = 0; dx < rowLength; dx++) {
        sum[dx] += fixedPoint ? buf[dx] * 256 : buf[dx];
        buf[dx] = 0;
      }
    }
  }
  return out;
}
