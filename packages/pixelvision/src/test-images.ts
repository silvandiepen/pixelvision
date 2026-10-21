import { createMatrix } from "./core/matrix";
import type { Matrix } from "./core/matrix.model";
import { perspectiveTransform, transformPoint } from "./math/transforms";
import type { Point } from "./math/transforms.model";

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

/**
 * Paints a texture onto a quadrilateral, with 4 x 4 supersampling: each
 * pixel averages the texture at its samples inside the quad.
 *
 * @param image - Gray image to paint on.
 * @param corners - Where the texture's corners land: top-left, top-right,
 *   bottom-right, bottom-left.
 * @param texture - Gray level at texture coordinates `u`, `v` in [0, 1).
 */
export const drawQuad = (
  image: Matrix<"u8">,
  corners: readonly Point[],
  texture: (u: number, v: number) => number,
): void => {
  const toTexture = perspectiveTransform(corners, [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]);
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const x0 = Math.max(0, Math.floor(Math.min(...xs)));
  const x1 = Math.min(image.width - 1, Math.ceil(Math.max(...xs)));
  const y0 = Math.max(0, Math.floor(Math.min(...ys)));
  const y1 = Math.min(image.height - 1, Math.ceil(Math.max(...ys)));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      let hits = 0;
      let total = 0;
      for (let s = 0; s < 16; s++) {
        const p = transformPoint(toTexture, {
          x: x + ((s % 4) + 0.5) / 4,
          y: y + ((s >> 2) + 0.5) / 4,
        });
        if (p.x < 0 || p.y < 0 || p.x >= 1 || p.y >= 1) continue;
        hits++;
        total += texture(p.x, p.y);
      }
      if (!hits) continue;
      const i = y * image.width + x;
      image.data[i] = Math.round((image.data[i] * (16 - hits) + total) / 16);
    }
  }
};

/**
 * Draws a plain schematic face (hair, skin, eyes, brows, nose, mouth),
 * enough structure for the frontal-face cascade.
 *
 * @param image - Gray image.
 * @param cx - Centre x of the face.
 * @param cy - Centre y of the face.
 * @param s - Scale; 1 is a face about 112 pixels wide.
 */
export const drawFace = (image: Matrix<"u8">, cx: number, cy: number, s: number): void => {
  const ellipse = (ex: number, ey: number, rx: number, ry: number, value: number) => {
    for (let y = Math.max(0, Math.floor(ey - ry)); y < Math.min(image.height, ey + ry); y++) {
      for (let x = Math.max(0, Math.floor(ex - rx)); x < Math.min(image.width, ex + rx); x++) {
        if (((x + 0.5 - ex) / rx) ** 2 + ((y + 0.5 - ey) / ry) ** 2 <= 1) {
          image.data[y * image.width + x] = value;
        }
      }
    }
  };
  ellipse(cx, cy - 20 * s, 66 * s, 70 * s, 30);
  ellipse(cx, cy + 5 * s, 56 * s, 72 * s, 190);
  for (const side of [-1, 1]) {
    ellipse(cx + side * 22 * s, cy - 12 * s, 11 * s, 5 * s, 42);
    ellipse(cx + side * 22 * s, cy - 26 * s, 14 * s, 3 * s, 55);
  }
  ellipse(cx, cy + 14 * s, 7 * s, 4 * s, 140);
  ellipse(cx, cy + 36 * s, 20 * s, 5 * s, 90);
};

/**
 * Corners of a square turned and tilted in perspective.
 *
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param size - Side length before the tilt.
 * @param angle - Rotation in degrees, clockwise on screen.
 * @param tilt - Perspective: the top edge shrinks by this fraction.
 * @returns Top-left, top-right, bottom-right and bottom-left as drawn.
 */
export const squareCorners = (
  cx: number,
  cy: number,
  size: number,
  angle: number,
  tilt = 0,
): Point[] => {
  const half = size / 2;
  const a = (angle * Math.PI) / 180;
  return [
    [-half * (1 - tilt), -half],
    [half * (1 - tilt), -half],
    [half, half],
    [-half, half],
  ].map(([dx, dy]) => ({
    x: cx + dx * Math.cos(a) - dy * Math.sin(a),
    y: cy + dx * Math.sin(a) + dy * Math.cos(a),
  }));
};

/**
 * Adds seeded Gaussian noise (Box–Muller), clamped to 0–255.
 *
 * @param image - Gray image.
 * @param sigma - Standard deviation in gray levels.
 * @param seed - Seed.
 */
export const addGaussianNoise = (image: Matrix<"u8">, sigma: number, seed = 1): void => {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < image.data.length; i++) {
    const g = Math.sqrt(-2 * Math.log(random() + 1e-12)) * Math.cos(2 * Math.PI * random());
    image.data[i] = Math.max(0, Math.min(255, Math.round(image.data[i] + g * sigma)));
  }
};
