import { createMatrix } from "./core/matrix";
import type { Matrix } from "./core/matrix.model";

/**
 * Seeded uniform noise, for tests that need texture.
 *
 * @param width - Width.
 * @param height - Height.
 * @param seed - Seed.
 * @returns A gray `u8` matrix.
 */
export const noiseImage = (width: number, height: number, seed = 1): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  let state = seed >>> 0;
  for (let i = 0; i < image.data.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    image.data[i] = state >>> 24;
  }
  return image;
};

/**
 * Draws filled rectangles on a background, for tests that need corners.
 *
 * @param width - Width.
 * @param height - Height.
 * @param rectangles - `[x0, y0, x1, y1, value]` each, exclusive end.
 * @param background - Background value.
 * @returns A gray `u8` matrix.
 */
export const rectanglesImage = (
  width: number,
  height: number,
  rectangles: Array<[number, number, number, number, number]>,
  background = 0,
): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  image.data.fill(background);
  for (const [x0, y0, x1, y1, value] of rectangles) {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) image.data[y * width + x] = value;
  }
  return image;
};
