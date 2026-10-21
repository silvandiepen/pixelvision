import { createMatrix } from "./core/matrix";
import type { Matrix } from "./core/matrix.model";
import type { Point } from "./math/transforms.model";

/**
 * Draws a mask: a pixel is set when its centre is inside the shape.
 *
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param inside - Whether a point is inside.
 * @returns A `u8` mask, 255 inside.
 */
export const drawMask = (
  width: number,
  height: number,
  inside: (x: number, y: number) => boolean,
): Matrix<"u8"> => {
  const mask = createMatrix(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) mask.data[y * width + x] = inside(x + 0.5, y + 0.5) ? 255 : 0;
  }
  return mask;
};

/**
 * The same mask as dark shapes on white, as a gray image.
 *
 * @param mask - A mask, 255 inside.
 * @returns The gray image.
 */
export const ink = (mask: Matrix<"u8">): Matrix<"u8"> => {
  const gray = createMatrix(mask.width, mask.height);
  for (let i = 0; i < mask.width * mask.height; i++) gray.data[i] = mask.data[i] ? 20 : 235;
  return gray;
};

/**
 * Reads SVG path data into polylines, one per subpath, flattening cubic
 * curves. Handles `M L H V C Z` in both absolute and relative form, with
 * implicit repeats.
 *
 * @param d - Path data.
 * @returns The subpaths' points.
 */
export const parsePathData = (d: string): Point[][] => {
  const tokens = d.match(/[MmLlHhVvCcZz]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  const subpaths: Point[][] = [];
  let current: Point[] = [];
  let point = { x: 0, y: 0 };
  let start = point;
  let command = "";
  let i = 0;
  const number = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[a-z]/i.test(tokens[i])) command = tokens[i++];
    const relative = command === command.toLowerCase();
    const base = relative ? point : { x: 0, y: 0 };
    switch (command.toUpperCase()) {
      case "M":
        point = { x: base.x + number(), y: base.y + number() };
        start = point;
        current = [point];
        subpaths.push(current);
        command = relative ? "l" : "L";
        break;
      case "L":
        point = { x: base.x + number(), y: base.y + number() };
        current.push(point);
        break;
      case "H":
        point = { x: (relative ? point.x : 0) + number(), y: point.y };
        current.push(point);
        break;
      case "V":
        point = { x: point.x, y: (relative ? point.y : 0) + number() };
        current.push(point);
        break;
      case "C": {
        const from = point;
        const [c1, c2, end] = [0, 1, 2].map(() => ({ x: base.x + number(), y: base.y + number() }));
        for (let s = 1; s <= 16; s++) {
          const t = s / 16;
          const mt = 1 - t;
          const w = [mt * mt * mt, 3 * t * mt * mt, 3 * t * t * mt, t * t * t];
          current.push({
            x: w[0] * from.x + w[1] * c1.x + w[2] * c2.x + w[3] * end.x,
            y: w[0] * from.y + w[1] * c1.y + w[2] * c2.y + w[3] * end.y,
          });
        }
        point = end;
        break;
      }
      default:
        point = start;
    }
  }
  return subpaths;
};

/**
 * Reads every `<path>` of an SVG document.
 *
 * @param svg - The markup.
 * @returns Each path's fill (or `null`) and subpaths.
 */
export const parseSvg = (svg: string): { fill: string | null; subpaths: Point[][] }[] =>
  [...svg.matchAll(/<path( fill="([^"]*)")? d="([^"]*)"\/>/g)].map((match) => ({
    fill: match[2] ?? null,
    subpaths: parsePathData(match[3]),
  }));

/**
 * Fills polygons with the non-zero rule, sampling at pixel centres: a
 * scanline fill.
 *
 * @param polygons - Closed polylines.
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @returns A mask, 255 inside.
 */
export const rasterize = (polygons: Point[][], width: number, height: number): Uint8Array => {
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const yc = y + 0.5;
    const crossings: { x: number; winding: number }[] = [];
    for (const polygon of polygons) {
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i];
        const b = polygon[(i + 1) % polygon.length];
        if (a.y <= yc === b.y <= yc) continue;
        crossings.push({
          x: a.x + ((yc - a.y) / (b.y - a.y)) * (b.x - a.x),
          winding: b.y > a.y ? 1 : -1,
        });
      }
    }
    crossings.sort((p, q) => p.x - q.x);
    let winding = 0;
    for (let k = 0; k < crossings.length - 1; k++) {
      winding += crossings[k].winding;
      if (winding === 0) continue;
      for (let x = Math.ceil(crossings[k].x - 0.5); x + 0.5 < crossings[k + 1].x; x++) {
        if (x >= 0 && x < width) mask[y * width + x] = 255;
      }
    }
  }
  return mask;
};

/**
 * Intersection over union of two masks.
 *
 * @param a - One mask.
 * @param b - The other.
 * @returns 0–1; 1 when they're identical.
 */
export const iou = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let both = 0;
  let either = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) both++;
    if (a[i] || b[i]) either++;
  }
  return both / either;
};
