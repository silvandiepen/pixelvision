/**
 * Rounds to the nearest integer, halves to the even neighbour: the rounding
 * C's `lrint` and OpenCV's `cvRound` use, so `2.5` becomes 2 and `3.5`
 * becomes 4.
 *
 * @param value - The number.
 * @returns The nearest integer, ties to even.
 */
export const roundHalfEven = (value: number): number => {
  const rounded = Math.round(value);
  // Math.round sends ties up; step back when that landed on an odd number.
  return rounded - value === 0.5 && rounded % 2 !== 0 ? rounded - 1 : rounded;
};

/**
 * Converts a number to a byte the way OpenCV's `saturate_cast<uchar>` does:
 * rounded half to even, then clamped to 0–255.
 *
 * @param value - The number.
 * @returns A value in 0–255.
 */
export const saturateU8 = (value: number): number => {
  const rounded = roundHalfEven(value);
  return rounded < 0 ? 0 : rounded > 255 ? 255 : rounded;
};
