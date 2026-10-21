// A light page on a dark textured background, the same in every run.
export const CORNERS = [
  { x: 70, y: 50 },
  { x: 250, y: 66 },
  { x: 236, y: 196 },
  { x: 58, y: 182 },
];

/**
 * Draws the page.
 *
 * @returns RGBA pixels, 320×240.
 */
export function scene() {
  const width = 320;
  const height = 240;
  const data = new Uint8ClampedArray(width * height * 4);
  const inside = (x, y) =>
    CORNERS.every((a, i) => {
      const b = CORNERS[(i + 1) % 4];
      return (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) >= 0;
    });
  let seed = 3;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const n = (seed >>> 24) / 255;
      const v = inside(x, y) ? 215 + n * 12 : 40 + n * 50;
      data.set([v, v, v, 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
}
