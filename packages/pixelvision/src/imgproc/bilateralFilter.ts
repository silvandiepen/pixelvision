import { assertChannels, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { roundHalfEven } from "../core/round";
import type { BilateralFilterOptions } from "./bilateralFilter.model";
import { replicateIndices } from "./filter2D";

const f32 = Math.fround;

/**
 * Smooths an image while keeping its edges, as OpenCV's `bilateralFilter`:
 * every pixel becomes a weighted mean of its neighbourhood, where a
 * neighbour's weight falls with its distance (`sigmaSpace`) and with how
 * different its colour is (`sigmaColor`). Flat areas and skin smooth out;
 * edges between different colours stay sharp.
 *
 * Colour images use the sum of the absolute R, G and B differences as the
 * colour distance. Pixels outside the image repeat the edge pixel
 * (`BORDER_REPLICATE`). Weights and sums are single precision in OpenCV's
 * order, so results match OpenCV exactly.
 *
 * @param image - `u8` matrix with 1 (gray) or 3 (RGB) channels.
 * @param options - `diameter`, `sigmaColor`, `sigmaSpace` and `out`.
 * @returns The filtered matrix, same size and channels.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it doesn't have 1 or 3 channels, the diameter isn't an integer or a sigma isn't finite.
 *
 * @example
 * const smooth = bilateralFilter(rgb, { diameter: 9, sigmaColor: 75, sigmaSpace: 75 });
 */
export function bilateralFilter(
  image: Matrix<"u8">,
  options: BilateralFilterOptions = {},
): Matrix<"u8"> {
  assertType("bilateralFilter", image, "u8");
  assertChannels("bilateralFilter", image, 1, 3);
  const { diameter = 9, sigmaColor = 75, sigmaSpace = 75 } = options;
  if (!Number.isInteger(diameter) || !Number.isFinite(sigmaColor) || !Number.isFinite(sigmaSpace)) {
    throw new RangeError(
      "bilateralFilter: diameter must be an integer and sigmaColor and sigmaSpace finite",
    );
  }
  const { width: w, height: h, channels: cn, data } = image;
  const out = prepareOutput(options.out, "u8", w, h, cn);
  const length = w * h * cn;
  if (sigmaColor <= 1e-6 || sigmaSpace <= 1e-6) {
    out.data.set(data.subarray(0, length));
    return out;
  }
  const colorCoeff = -0.5 / (sigmaColor * sigmaColor);
  const spaceCoeff = -0.5 / (sigmaSpace * sigmaSpace);
  const radius = Math.max(diameter <= 0 ? roundHalfEven(sigmaSpace * 1.5) : diameter >> 1, 1);

  const colorWeight = new Float32Array(256 * cn);
  for (let i = 0; i < colorWeight.length; i++) colorWeight[i] = Math.exp(i * i * colorCoeff);
  const offsetX: number[] = [];
  const offsetY: number[] = [];
  const spaceWeight: number[] = [];
  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const r = Math.sqrt(i * i + j * j);
      if (r > radius) continue;
      offsetY.push(i + radius);
      offsetX.push(j + radius);
      spaceWeight.push(f32(Math.exp(r * r * spaceCoeff)));
    }
  }
  const columns = replicateIndices(w, radius, radius);
  const rows = replicateIndices(h, radius, radius);

  const sums = new Float32Array(w * cn);
  const weightSums = new Float32Array(w);
  for (let y = 0; y < h; y++) {
    sums.fill(0);
    weightSums.fill(0);
    for (let k = 0; k < spaceWeight.length; k++) {
      const row = rows[y + offsetY[k]] * w;
      const space = spaceWeight[k];
      for (let x = 0; x < w; x++) {
        const centre = (y * w + x) * cn;
        const at = (row + columns[x + offsetX[k]]) * cn;
        let distance = 0;
        for (let c = 0; c < cn; c++) distance += Math.abs(data[at + c] - data[centre + c]);
        const weight = f32(space * colorWeight[distance]);
        weightSums[x] = f32(weightSums[x] + weight);
        for (let c = 0; c < cn; c++) {
          sums[x * cn + c] = f32(sums[x * cn + c] + f32(data[at + c] * weight));
        }
      }
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * cn;
      if (cn === 1) {
        out.data[o] = roundHalfEven(f32(sums[x] / weightSums[x]));
      } else {
        const inverse = f32(1 / weightSums[x]);
        for (let c = 0; c < 3; c++) out.data[o + c] = roundHalfEven(f32(sums[x * 3 + c] * inverse));
      }
    }
  }
  return out;
}
