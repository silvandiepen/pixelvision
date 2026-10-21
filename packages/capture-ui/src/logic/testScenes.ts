// Drawn test scenes for the quality gates: a schematic face (as in packages/parity's drawing
// helpers) and a light document on a dark textured surface (as in the examples' end-to-end
// scene), with the ways a camera frame goes wrong. Imported by tests only; not part of the
// package.
import { createMatrix, gaussianBlur } from "pixelvision";
import type { Matrix, Point } from "pixelvision";
import type { Box } from "./geometry.model";

/**
 * A seeded generator of uniform numbers in [0, 1).
 *
 * @param seed - Seed.
 * @returns The generator.
 */
const seeded = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

/**
 * Paints a shape with 4 x 4 supersampling, within a bounding box.
 *
 * @param image - Gray image.
 * @param bounds - Area to paint in.
 * @param inside - Whether a point is inside the shape.
 * @param value - Gray level inside.
 */
const paint = (
  image: Matrix<"u8">,
  bounds: Box,
  inside: (x: number, y: number) => boolean,
  value: number,
): void => {
  const x0 = Math.max(0, Math.floor(bounds.x));
  const y0 = Math.max(0, Math.floor(bounds.y));
  const x1 = Math.min(image.width, Math.ceil(bounds.x + bounds.width));
  const y1 = Math.min(image.height, Math.ceil(bounds.y + bounds.height));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let hits = 0;
      for (let s = 0; s < 16; s++) {
        if (inside(x + ((s % 4) + 0.5) / 4, y + ((s >> 2) + 0.5) / 4)) hits++;
      }
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
const ellipse = (
  image: Matrix<"u8">,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  value: number,
): void =>
  paint(
    image,
    { x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry },
    (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
    value,
  );

/**
 * A mid-gray wall with seeded texture.
 *
 * @param width - Width.
 * @param height - Height.
 * @param base - Darkest level.
 * @param spread - Texture range above `base`.
 * @param seed - Seed.
 * @returns The image.
 */
const texturedBackground = (
  width: number,
  height: number,
  base: number,
  spread: number,
  seed: number,
): Matrix<"u8"> => {
  const image = createMatrix(width, height);
  const random = seeded(seed);
  for (let i = 0; i < image.data.length; i++) image.data[i] = base + Math.floor(random() * spread);
  return image;
};

/** A drawn frame and where its subject is. */
export interface TestScene {
  image: Matrix<"u8">;
  /** The face box, or the document's bounding box. */
  box: Box;
  /** The document's corners (document scenes only). */
  corners?: [Point, Point, Point, Point];
}

/**
 * Draws a schematic face (hair, skin, eyes, brows, nose, mouth) on a
 * textured wall, and the box a face detector reports for it.
 *
 * @param width - Frame width.
 * @param height - Frame height.
 * @param scale - Face size; 1 is a face about 112 pixels wide.
 * @param centre - Centre of the face (default the frame's centre).
 * @returns The scene.
 */
export function faceScene(
  width = 480,
  height = 360,
  scale = 1.4,
  centre: Point = { x: width / 2, y: height / 2 },
): TestScene {
  const image = texturedBackground(width, height, 120, 30, 5);
  const { x: cx, y: cy } = centre;
  const s = scale;
  ellipse(image, cx, cy - 20 * s, 66 * s, 70 * s, 30);
  ellipse(image, cx, cy + 5 * s, 56 * s, 72 * s, 190);
  for (const side of [-1, 1]) {
    ellipse(image, cx + side * 22 * s, cy - 12 * s, 11 * s, 5 * s, 42);
    ellipse(image, cx + side * 22 * s, cy - 26 * s, 14 * s, 3 * s, 55);
  }
  ellipse(image, cx, cy + 14 * s, 7 * s, 4 * s, 140);
  ellipse(image, cx, cy + 36 * s, 20 * s, 5 * s, 90);
  return { image, box: { x: cx - 56 * s, y: cy - 62 * s, width: 112 * s, height: 134 * s } };
}

/**
 * Draws a plain light document, turned slightly, on a dark textured
 * surface: the hardest case for a sharpness check, as only its edges carry
 * detail.
 *
 * @param width - Frame width.
 * @param height - Frame height.
 * @returns The scene, with the document's corners.
 */
export function documentScene(width = 480, height = 360): TestScene {
  const image = texturedBackground(width, height, 40, 50, 3);
  const k = width / 480;
  const corners: [Point, Point, Point, Point] = [
    { x: 110 * k, y: 70 * k },
    { x: 375 * k, y: 90 * k },
    { x: 355 * k, y: 300 * k },
    { x: 90 * k, y: 270 * k },
  ];
  const inside = (x: number, y: number) =>
    corners.every((a, i) => {
      const b = corners[(i + 1) % 4];
      return (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) >= 0;
    });
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const box = {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
  paint(image, box, inside, 225);
  return { image, box, corners };
}

/**
 * Blurs a frame, as defocus or motion would.
 *
 * @param image - Gray frame.
 * @param sigma - Standard deviation in pixels.
 * @returns A new frame.
 */
export const blurred = (image: Matrix<"u8">, sigma: number): Matrix<"u8"> =>
  gaussianBlur(image, { sigma });

/**
 * Scales every level, as less (below 1) or more (above 1) light would;
 * levels past white clip.
 *
 * @param image - Gray frame.
 * @param factor - Gain.
 * @returns A new frame.
 */
export const exposed = (image: Matrix<"u8">, factor: number): Matrix<"u8"> => {
  const out = createMatrix(image.width, image.height);
  for (let i = 0; i < image.data.length; i++) {
    out.data[i] = Math.min(255, Math.round(image.data[i] * factor));
  }
  return out;
};

/**
 * Adds seeded Gaussian sensor noise (Box–Muller), clamped to 0–255.
 *
 * @param image - Gray frame.
 * @param sigma - Standard deviation in gray levels.
 * @param seed - Seed.
 * @returns A new frame.
 */
export const noisy = (image: Matrix<"u8">, sigma: number, seed = 1): Matrix<"u8"> => {
  const out = createMatrix(image.width, image.height);
  const random = seeded(seed);
  for (let i = 0; i < image.data.length; i++) {
    const g = Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
    out.data[i] = Math.max(0, Math.min(255, Math.round(image.data[i] + g * sigma)));
  }
  return out;
};

/**
 * Turns a gray frame into RGBA pixels, as a detection frame grabbed from a video.
 *
 * @param image - Gray frame.
 * @returns `ImageData`-shaped pixels.
 */
export const toFrame = (image: Matrix<"u8">): ImageData => {
  const data = new Uint8ClampedArray(image.width * image.height * 4);
  for (let i = 0; i < image.data.length; i++) {
    data.set([image.data[i], image.data[i], image.data[i], 255], i * 4);
  }
  return { width: image.width, height: image.height, data, colorSpace: "srgb" } as ImageData;
};

/**
 * Lays the frame thinly over a flat gray, as a smudged lens or haze would.
 *
 * @param image - Gray frame.
 * @param amount - How much of the frame shows through, 0–1.
 * @returns A new frame.
 */
export const hazed = (image: Matrix<"u8">, amount: number): Matrix<"u8"> => {
  const out = createMatrix(image.width, image.height);
  for (let i = 0; i < image.data.length; i++) {
    out.data[i] = Math.round(image.data[i] * amount + 170 * (1 - amount));
  }
  return out;
};
