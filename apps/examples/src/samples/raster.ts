import type { RGBAImage } from "pixelvision";
import type { Color, Vec } from "./raster.model";

/** Sub-pixel samples per axis for anti-aliased shapes. */
const SUPERSAMPLE = 4;

/**
 * Tests whether a point lies inside a polygon (even-odd rule).
 *
 * @param polygon - Corners in order.
 * @param x - Horizontal position.
 * @param y - Vertical position.
 * @returns `true` when inside.
 */
export function insidePolygon(polygon: readonly Vec[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Maps a point given in unit-square coordinates (`u`, `v` in 0–1) onto a
 * quadrilateral by bilinear interpolation of its corners.
 *
 * @param quad - Corners: top-left, top-right, bottom-right, bottom-left.
 * @param u - Position along the top edge, 0–1.
 * @param v - Position along the left edge, 0–1.
 * @returns The point inside the quadrilateral.
 */
export function quadPoint(quad: readonly Vec[], u: number, v: number): Vec {
  const [tl, tr, br, bl] = quad;
  const top = { x: tl.x + (tr.x - tl.x) * u, y: tl.y + (tr.y - tl.y) * u };
  const bottom = { x: bl.x + (br.x - bl.x) * u, y: bl.y + (br.y - bl.y) * u };
  return { x: top.x + (bottom.x - top.x) * v, y: top.y + (bottom.y - top.y) * v };
}

/**
 * Creates an opaque RGBA image filled with one colour.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param color - Fill colour.
 * @returns The image.
 */
export function createImage(width: number, height: number, color: Color): RGBAImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = 255;
  }
  return { width, height, data };
}

/**
 * Blends a colour into one pixel.
 *
 * @param image - Image to draw on.
 * @param index - Index of the pixel's red value.
 * @param color - Colour to blend in.
 * @param coverage - Opacity, 0–1.
 */
function blend(image: RGBAImage, index: number, color: Color, coverage: number): void {
  const { data } = image;
  data[index] = Math.round(data[index] + (color[0] - data[index]) * coverage);
  data[index + 1] = Math.round(data[index + 1] + (color[1] - data[index + 1]) * coverage);
  data[index + 2] = Math.round(data[index + 2] + (color[2] - data[index + 2]) * coverage);
}

/**
 * Fills a shape with anti-aliased edges: each pixel is covered by the share
 * of its 4x4 sub-pixel samples that fall inside.
 *
 * @param image - Image to draw on.
 * @param bounds - Pixel bounds to scan: `[left, top, right, bottom]`.
 * @param color - Fill colour.
 * @param inside - Whether a point lies in the shape.
 */
export function fillShape(
  image: RGBAImage,
  bounds: readonly [number, number, number, number],
  color: Color,
  inside: (x: number, y: number) => boolean,
): void {
  const left = Math.max(0, Math.floor(bounds[0]));
  const top = Math.max(0, Math.floor(bounds[1]));
  const right = Math.min(image.width - 1, Math.ceil(bounds[2]));
  const bottom = Math.min(image.height - 1, Math.ceil(bounds[3]));
  const total = SUPERSAMPLE * SUPERSAMPLE;
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      let hits = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          if (inside(x + (sx + 0.5) / SUPERSAMPLE, y + (sy + 0.5) / SUPERSAMPLE)) hits++;
        }
      }
      if (hits > 0) blend(image, (y * image.width + x) * 4, color, hits / total);
    }
  }
}

/**
 * Fills a polygon with anti-aliased edges.
 *
 * @param image - Image to draw on.
 * @param polygon - Corners in order.
 * @param color - Fill colour.
 */
export function fillPolygon(image: RGBAImage, polygon: readonly Vec[], color: Color): void {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  fillShape(
    image,
    [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    color,
    (x, y) => insidePolygon(polygon, x, y),
  );
}

/**
 * Fills a circle with anti-aliased edges.
 *
 * @param image - Image to draw on.
 * @param center - Centre point.
 * @param radius - Radius in pixels.
 * @param color - Fill colour.
 */
export function fillCircle(image: RGBAImage, center: Vec, radius: number, color: Color): void {
  const r2 = radius * radius;
  fillShape(
    image,
    [center.x - radius, center.y - radius, center.x + radius, center.y + radius],
    color,
    (x, y) => (x - center.x) ** 2 + (y - center.y) ** 2 <= r2,
  );
}

/**
 * Fills an axis-aligned rectangle with hard edges (whole pixels only).
 *
 * @param image - Image to draw on.
 * @param rect - `[left, top, width, height]` in whole pixels.
 * @param color - Fill colour.
 */
export function fillRect(
  image: RGBAImage,
  rect: readonly [number, number, number, number],
  color: Color,
): void {
  const [left, top, width, height] = rect;
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) {
      blend(image, (y * image.width + x) * 4, color, 1);
    }
  }
}

/**
 * Adds seeded noise to every colour channel.
 *
 * @param image - Image to change.
 * @param amount - Largest change per channel.
 * @param random - Seeded generator from {@link seededRandom}.
 */
export function addNoise(image: RGBAImage, amount: number, random: () => number): void {
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const offset = Math.round((random() * 2 - 1) * amount);
    data[i] += offset;
    data[i + 1] += offset;
    data[i + 2] += offset;
  }
}
