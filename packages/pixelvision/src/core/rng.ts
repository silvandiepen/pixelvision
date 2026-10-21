import type { Rng } from "./rng.model";

const TWO_32 = 4294967296;
// Multiplier of OpenCV's multiply-with-carry generator, split in 16-bit halves.
const COEFF_LOW = 0x630a;
const COEFF_HIGH = 0xf83f;

/**
 * Creates the multiply-with-carry generator OpenCV's `cv::RNG` uses, so a
 * given seed produces the same sequence as OpenCV does. The 64-bit state is
 * kept as two 32-bit halves and every step is exact in double precision.
 *
 * @param seed - Starting state, a whole number from 0 to 2^53 − 1; 0 starts
 * from `0xffffffff`, as OpenCV does. Leave it out for `2^64 − 1`, the state
 * OpenCV's Hough transforms start from.
 * @returns The generator.
 * @throws {RangeError} When the seed isn't a whole number in range.
 */
export const createRng = (seed?: number): Rng => {
  let low = 0xffffffff;
  let high = 0xffffffff;
  if (seed !== undefined) {
    if (!Number.isSafeInteger(seed) || seed < 0) {
      throw new RangeError(`seed must be a whole number from 0 to 2^53 - 1, got ${seed}`);
    }
    low = seed % TWO_32;
    high = Math.floor(seed / TWO_32);
    if (seed === 0) low = 0xffffffff;
  }

  const next = (): number => {
    // state = low * COEFF + high, as a 64-bit product split into halves.
    const lowLow = low & 0xffff;
    const lowHigh = low >>> 16;
    const middle = lowHigh * COEFF_LOW + lowLow * COEFF_HIGH;
    let bottom = lowLow * COEFF_LOW + (middle % 65536) * 65536 + high;
    let top = lowHigh * COEFF_HIGH + Math.floor(middle / 65536);
    top += Math.floor(bottom / TWO_32);
    bottom %= TWO_32;
    low = bottom;
    high = top % TWO_32;
    return low;
  };

  return {
    next,
    uniform: (count) => next() % count,
  };
};
