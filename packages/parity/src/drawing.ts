import { createMatrix, perspectiveTransform, transformPoint } from "pixelvision";
import type { Matrix, Point } from "pixelvision";
import { seededRandom } from "./random";

/**
 * A gray image filled with one level.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param level - Gray level.
 * @returns The image.
 */
export const blank = (width: number, height: number, level: number): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  image.data.fill(level);
  return image;
};

/**
 * Paints a shape with 4 x 4 supersampling: each pixel takes the share of
 * its samples inside the shape.
 *
 * @param image - Gray image to paint on.
 * @param inside - Whether a point (pixel centres at `.5`) is in the shape.
 * @param value - Gray level inside.
 */
export const paintShape = (
  image: Matrix<"u8">,
  inside: (x: number, y: number) => boolean,
  value: number,
): void => {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      let hits = 0;
      for (let s = 0; s < 16; s++) {
        if (inside(x + ((s % 4) + 0.5) / 4, y + ((s >> 2) + 0.5) / 4)) hits++;
      }
      if (!hits) continue;
      const i = y * image.width + x;
      image.data[i] = Math.round(image.data[i] + ((value - image.data[i]) * hits) / 16);
    }
  }
};

/**
 * Paints an ellipse.
 *
 * @param image - Gray image.
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param rx - Horizontal radius.
 * @param ry - Vertical radius.
 * @param value - Gray level.
 */
export const fillEllipse = (
  image: Matrix<"u8">,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  value: number,
): void => paintShape(image, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, value);

/**
 * Whether a point is inside a convex polygon whose vertices go clockwise
 * (y down) or counter-clockwise.
 *
 * @param polygon - Vertices.
 * @param x - Point x.
 * @param y - Point y.
 * @returns `true` inside.
 */
const insideConvex = (polygon: readonly Point[], x: number, y: number): boolean => {
  let sign = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const cross = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
    if (cross === 0) continue;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return true;
};

/**
 * Paints a convex polygon.
 *
 * @param image - Gray image.
 * @param polygon - Vertices in order.
 * @param value - Gray level.
 */
export const fillConvex = (image: Matrix<"u8">, polygon: readonly Point[], value: number): void =>
  paintShape(image, (x, y) => insideConvex(polygon, x, y), value);

/**
 * Adds Gaussian noise (Box–Muller), clamped to 0–255.
 *
 * @param image - Gray image.
 * @param sigma - Standard deviation in gray levels.
 * @param seed - Random seed.
 */
export const addNoise = (image: Matrix<"u8">, sigma: number, seed: number): void => {
  const random = seededRandom(seed);
  for (let i = 0; i < image.data.length; i++) {
    const g = Math.sqrt(-2 * Math.log(random() + 1e-12)) * Math.cos(2 * Math.PI * random());
    image.data[i] = Math.max(0, Math.min(255, Math.round(image.data[i] + g * sigma)));
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
  fillEllipse(image, cx, cy - 20 * s, 66 * s, 70 * s, 30);
  fillEllipse(image, cx, cy + 5 * s, 56 * s, 72 * s, 190);
  for (const side of [-1, 1]) {
    fillEllipse(image, cx + side * 22 * s, cy - 12 * s, 11 * s, 5 * s, 42);
    fillEllipse(image, cx + side * 22 * s, cy - 26 * s, 14 * s, 3 * s, 55);
  }
  fillEllipse(image, cx, cy + 14 * s, 7 * s, 4 * s, 140);
  fillEllipse(image, cx, cy + 36 * s, 20 * s, 5 * s, 90);
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
export const drawTexture = (
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
 * Corners of a square turned and tilted in perspective.
 *
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param size - Side length before the tilt.
 * @param angle - Rotation in degrees, clockwise on screen.
 * @param tilt - Perspective: the far (top) edge shrinks by this fraction.
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
