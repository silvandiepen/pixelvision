// Writes assets/sample.jpg: the seeded test scene the web starters are tested
// with (examples/e2e/tests/scene.ts), a light document on a dark, textured
// background, encoded as a JPEG like a phone photo.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import jpeg from "jpeg-js";

const width = 640;
const height = 480;
// The same corners as SCENE_CORNERS in examples/e2e/tests/scene.ts.
const corners = [
  { x: 150, y: 90 },
  { x: 500, y: 120 },
  { x: 470, y: 400 },
  { x: 120, y: 360 },
];

const data = new Uint8Array(width * height * 4);

/**
 * Fills a rectangle, clipped to the image.
 *
 * @param {number} x - Left edge.
 * @param {number} y - Top edge.
 * @param {number} w - Width.
 * @param {number} h - Height.
 * @param {number[]} rgb - The colour.
 */
function fillRect(x, y, w, h, rgb) {
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(width, Math.round(x + w));
  const y1 = Math.min(height, Math.round(y + h));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) data.set([...rgb, 255], (py * width + px) * 4);
  }
}

/**
 * Whether a point is inside the document (even-odd rule).
 *
 * @param {number} x - Horizontal position.
 * @param {number} y - Vertical position.
 * @returns {boolean} True inside.
 */
function inside(x, y) {
  let result = false;
  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const a = corners[i];
    const b = corners[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) result = !result;
  }
  return result;
}

let seed = 7;
const random = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
fillRect(0, 0, width, height, [0x3a, 0x30, 0x26]);
for (let i = 0; i < 1500; i++) {
  const shade = 40 + Math.floor(random() * 30);
  fillRect(random() * width, random() * height, 2 + random() * 10, 2, [
    shade,
    shade - 8,
    shade - 16,
  ]);
}
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (inside(x + 0.5, y + 0.5)) data.set([0xf2, 0xf0, 0xea, 255], (y * width + x) * 4);
  }
}

const out = join(dirname(dirname(fileURLToPath(import.meta.url))), "assets/sample.jpg");
writeFileSync(out, jpeg.encode({ width, height, data }, 90).data);
