import { assertChannels, assertType } from "../core/assert";
import { createMatrix, prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { AdaptiveThresholdOptions } from "./adaptiveThreshold.model";
import { boxSum } from "./boxBlur";
import { gaussianBlur } from "./gaussianBlur";

/**
 * Thresholds every pixel against the mean of its own neighbourhood, as
 * OpenCV's `adaptiveThreshold`: text and lines stay readable under uneven
 * lighting, where a single global level fails.
 *
 * With `method: "mean"` the result matches OpenCV exactly. The Gaussian
 * method computes the local mean in floating point; OpenCV uses fixed
 * point, so pixels right at the level occasionally differ.
 *
 * @param image - Single-channel `u8` matrix.
 * @param options - Block size, offset, method, inversion, output value and matrix.
 * @returns A binary `u8` matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it has more than one channel or the block size isn't odd and at least 3.
 *
 * @example
 * const ink = adaptiveThreshold(gray, { blockSize: 15, offset: 8, invert: true });
 */
export function adaptiveThreshold(
  image: Matrix<"u8">,
  options: AdaptiveThresholdOptions = {},
): Matrix<"u8"> {
  assertType("adaptiveThreshold", image, "u8");
  assertChannels("adaptiveThreshold", image, 1);
  const { blockSize = 11, offset = 2, method = "mean", invert = false, max = 255 } = options;
  if (!Number.isInteger(blockSize) || blockSize < 3 || blockSize % 2 === 0) {
    throw new RangeError(
      `adaptiveThreshold: blockSize must be an odd integer >= 3, got ${blockSize}`,
    );
  }
  const { width, height, data } = image;
  const n = width * height;
  const mean = new Uint8Array(n);
  if (method === "mean") {
    const sums = boxSum(image, { radius: blockSize >> 1 }).data;
    const area = blockSize * blockSize;
    for (let i = 0; i < n; i++) mean[i] = Math.round(sums[i] / area);
  } else {
    // Blur in floating point and round once; the 8-bit blur rounds down after
    // each pass and would sit up to 2 levels below OpenCV's local mean.
    const float = createMatrix(width, height, { type: "f32" });
    for (let i = 0; i < n; i++) float.data[i] = data[i];
    const blurred = gaussianBlur(float, { kernelSize: blockSize }).data;
    for (let i = 0; i < n; i++) mean[i] = Math.round(blurred[i]);
  }
  // As OpenCV: compare against the mean minus the offset, rounded towards the
  // stricter side for the chosen polarity.
  const delta = invert ? Math.floor(offset) : Math.ceil(offset);
  const out = prepareOutput(options.out, "u8", width, height, 1);
  for (let i = 0; i < n; i++) {
    const above = data[i] - mean[i] > -delta;
    out.data[i] = above !== invert ? max : 0;
  }
  return out;
}
