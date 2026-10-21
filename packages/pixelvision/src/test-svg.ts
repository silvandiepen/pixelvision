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
 * Flattens an SVG elliptical arc (endpoint form) to points after its start.
 *
 * @param from - Start point.
 * @param rx - Horizontal radius.
 * @param ry - Vertical radius.
 * @param degrees - Rotation of the ellipse.
 * @param large - Large-arc flag.
 * @param sweep - Sweep flag.
 * @param to - End point.
 * @returns 32 points along the arc, ending at `to`.
 */
const arcPoints = (
  from: Point,
  rx: number,
  ry: number,
  degrees: number,
  large: boolean,
  sweep: boolean,
  to: Point,
): Point[] => {
  const phi = (degrees * Math.PI) / 180;
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)];
  const hx = (from.x - to.x) / 2;
  const hy = (from.y - to.y) / 2;
  const x1 = cos * hx + sin * hy;
  const y1 = -sin * hx + cos * hy;
  const grow = Math.sqrt(Math.max(1, (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)));
  [rx, ry] = [rx * grow, ry * grow];
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const coef =
    (large === sweep ? -1 : 1) *
    Math.sqrt(Math.max(0, num / (rx * rx * y1 * y1 + ry * ry * x1 * x1)));
  const cxp = (coef * rx * y1) / ry;
  const cyp = (-coef * ry * x1) / rx;
  const cx = cos * cxp - sin * cyp + (from.x + to.x) / 2;
  const cy = sin * cxp + cos * cyp + (from.y + to.y) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const start = angle(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let delta = angle((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  return Array.from({ length: 32 }, (_, k) => {
    const t = start + (delta * (k + 1)) / 32;
    return {
      x: cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
      y: cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
    };
  });
};

/**
 * Reads SVG path data into polylines, one per subpath, flattening cubic
 * curves and elliptical arcs. Handles `M L H V C A Z` in both absolute and
 * relative form, with implicit repeats.
 *
 * @param d - Path data.
 * @returns The subpaths' points.
 */
export const parsePathData = (d: string): Point[][] => {
  const tokens = d.match(/[MmLlHhVvCcAaZz]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
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
      case "A": {
        const [rx, ry, degrees, large, sweep] = [0, 1, 2, 3, 4].map(() => number());
        const end = { x: base.x + number(), y: base.y + number() };
        current.push(...arcPoints(point, rx, ry, degrees, large === 1, sweep === 1, end));
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

/** One element of an SVG document, as polygons to fill. */
export interface SvgItem {
  /** The element's name. */
  tag: string;
  /** Its attributes. */
  attributes: Record<string, string>;
  /** The outline and holes, as closed polylines. */
  polygons: Point[][];
  /** Whether the even-odd rule fills it (otherwise non-zero). */
  evenOdd: boolean;
}

/**
 * Points round an ellipse, in a frame turned by `degrees`.
 *
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param rx - Radius along x.
 * @param ry - Radius along y.
 * @param degrees - Rotation.
 * @param reverse - Run anticlockwise on screen.
 * @returns 256 points.
 */
const ellipsePoints = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  degrees: number,
  reverse = false,
): Point[] => {
  const phi = (degrees * Math.PI) / 180;
  return Array.from({ length: 256 }, (_, k) => {
    const t = ((reverse ? -k : k) * 2 * Math.PI) / 256;
    const [u, v] = [rx * Math.cos(t), ry * Math.sin(t)];
    return {
      x: cx + u * Math.cos(phi) - v * Math.sin(phi),
      y: cy + u * Math.sin(phi) + v * Math.cos(phi),
    };
  });
};

/**
 * Reads every drawn element of an SVG document (`path`, `circle`,
 * `ellipse`, `rect`, `polygon`) into polygons, as a browser would fill it:
 * a stroked, unfilled circle as the ring its stroke covers, a `transform`
 * rotation applied, rounded rectangle corners as arcs.
 *
 * @param svg - The markup.
 * @returns The elements, in order.
 */
export const parseSvgItems = (svg: string): SvgItem[] =>
  [...svg.matchAll(/<(path|circle|ellipse|rect|polygon)((?: [\w-]+="[^"]*")*)\/>/g)].map(
    ([, tag, text]) => {
      const attributes = Object.fromEntries(
        [...text.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]),
      );
      const a = (key: string) => Number(attributes[key] ?? 0);
      const rotation = /rotate\(([-\d.]+) ([-\d.]+) ([-\d.]+)\)/.exec(attributes.transform ?? "");
      const turn = (points: Point[]): Point[] => {
        if (!rotation) return points;
        const [deg, ox, oy] = rotation.slice(1).map(Number);
        const phi = (deg * Math.PI) / 180;
        return points.map((p) => ({
          x: ox + (p.x - ox) * Math.cos(phi) - (p.y - oy) * Math.sin(phi),
          y: oy + (p.x - ox) * Math.sin(phi) + (p.y - oy) * Math.cos(phi),
        }));
      };
      let polygons: Point[][];
      if (tag === "path") {
        polygons = parsePathData(attributes.d);
      } else if (tag === "circle") {
        const half = attributes["stroke-width"] ? a("stroke-width") / 2 : 0;
        polygons = [ellipsePoints(a("cx"), a("cy"), a("r") + half, a("r") + half, 0)];
        if (half)
          polygons.push(ellipsePoints(a("cx"), a("cy"), a("r") - half, a("r") - half, 0, true));
      } else if (tag === "ellipse") {
        polygons = [turn(ellipsePoints(a("cx"), a("cy"), a("rx"), a("ry"), 0))];
      } else if (tag === "rect") {
        const [x, y, w, h, r] = [a("x"), a("y"), a("width"), a("height"), a("rx")];
        const d = r
          ? `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}` +
            `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
            `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
          : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
        polygons = parsePathData(d).map(turn);
      } else {
        const numbers = attributes.points.split(/[ ,]/).map(Number);
        polygons = [
          Array.from({ length: numbers.length / 2 }, (_, i) => ({
            x: numbers[2 * i],
            y: numbers[2 * i + 1],
          })),
        ];
      }
      return { tag, attributes, polygons, evenOdd: attributes["fill-rule"] === "evenodd" };
    },
  );

/**
 * Fills every element of an SVG document into one mask, each with its own
 * fill rule.
 *
 * @param svg - The markup.
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param skip - Leave out elements with this fill (e.g. the background layer).
 * @returns A mask, 255 inside any element.
 */
export const rasterizeSvg = (
  svg: string,
  width: number,
  height: number,
  skip?: string,
): Uint8Array => {
  const mask = new Uint8Array(width * height);
  for (const item of parseSvgItems(svg)) {
    if (skip && (item.attributes.fill === skip || item.attributes.stroke === skip)) continue;
    const filled = rasterize(item.polygons, width, height, item.evenOdd);
    for (let i = 0; i < mask.length; i++) if (filled[i]) mask[i] = 255;
  }
  return mask;
};

/**
 * Fills polygons with the non-zero (or even-odd) rule, sampling at pixel
 * centres: a scanline fill.
 *
 * @param polygons - Closed polylines.
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param evenOdd - Use the even-odd rule instead.
 * @returns A mask, 255 inside.
 */
export const rasterize = (
  polygons: Point[][],
  width: number,
  height: number,
  evenOdd = false,
): Uint8Array => {
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
      winding += evenOdd ? 1 : crossings[k].winding;
      if (evenOdd ? winding % 2 === 0 : winding === 0) continue;
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

/** The badge of the logo sheet: a ring, with a disc in its middle. */
export const LOGO_BADGE = { x: 80, y: 88, outer: 56, inner: 44, disc: 20 };

/** The square of the logo sheet: `[left, top, width, height]`, on whole pixels. */
export const LOGO_SQUARE = [40, 168, 48, 48] as const;

/** The triangle of the logo sheet. */
export const LOGO_TRIANGLE: readonly Point[] = [
  { x: 120, y: 216 },
  { x: 150, y: 166 },
  { x: 180, y: 216 },
];

/** The pill of the logo sheet: the segment between its two end centres, and its radius. */
export const LOGO_PILL = { left: 216, right: 280, y: 192, radius: 16 };

/**
 * Whether a point is inside a polygon (even-odd).
 *
 * @param polygon - Corners in order.
 * @param x - Point x.
 * @param y - Point y.
 * @returns `true` inside.
 */
export const insidePolygon = (polygon: readonly Point[], x: number, y: number): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
};

/**
 * Whether a point is inside an axis-aligned ellipse.
 *
 * @param x - Point x.
 * @param y - Point y.
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param rx - Horizontal radius.
 * @param ry - Vertical radius.
 * @returns `true` inside.
 */
const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;

/**
 * Whether a point is on the wordmark "OAB", in glyph units.
 *
 * @param x - Point x.
 * @param y - Point y.
 * @returns `true` on a letter.
 */
const inWordmark = (x: number, y: number): boolean => {
  if (inEllipse(x, y, 35, 50, 22, 32) && !inEllipse(x, y, 35, 50, 11, 20)) return true;
  const a = [70, 85, 95, 15, 115, 15, 140, 85, 124, 85, 118, 67, 92, 67, 86, 85];
  const counter = [96, 55, 105, 28, 114, 55];
  const points = (xy: number[]) =>
    Array.from({ length: xy.length / 2 }, (_, i) => ({ x: xy[2 * i], y: xy[2 * i + 1] }));
  if (insidePolygon(points(a), x, y) && !insidePolygon(points(counter), x, y)) return true;
  const b =
    x >= 150 &&
    (inEllipse(x, y, 162, 32.5, 20, 17.5) ||
      inEllipse(x, y, 162, 66.5, 23, 18.5) ||
      (x <= 162 && y >= 15 && y <= 85));
  const counters =
    x > 162 && (inEllipse(x, y, 162, 32.5, 10, 8) || inEllipse(x, y, 162, 66.5, 12, 9));
  return b && !counters;
};

/**
 * Draws the logo sheet of the examples app, pixel for pixel: on noisy paper,
 * a navy ring with an orange disc inside, the wordmark "OAB", a teal square,
 * a navy triangle and an orange pill, all anti-aliased (4x4 samples per
 * pixel) except the square.
 *
 * @returns A 320x240 RGBA image.
 */
export const drawLogo = (): { width: number; height: number; data: Uint8ClampedArray } => {
  const width = 320;
  const height = 240;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set([247, 245, 240, 255], i);
  // Seeded noise (mulberry32, seed 29), the same offset on every channel.
  let state = 29;
  for (let i = 0; i < data.length; i += 4) {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const offset = Math.round(((((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1) * 3);
    for (let c = 0; c < 3; c++) data[i + c] += offset;
  }
  const fill = (
    bounds: number[],
    colour: number[],
    inside: (x: number, y: number) => boolean,
  ): void => {
    for (let y = Math.max(0, Math.floor(bounds[1])); y <= Math.ceil(bounds[3]); y++) {
      for (let x = Math.max(0, Math.floor(bounds[0])); x <= Math.ceil(bounds[2]); x++) {
        let hits = 0;
        for (let sy = 0; sy < 4; sy++) {
          for (let sx = 0; sx < 4; sx++) if (inside(x + (sx + 0.5) / 4, y + (sy + 0.5) / 4)) hits++;
        }
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3 && hits > 0; c++) {
          data[i + c] = Math.round(data[i + c] + ((colour[c] - data[i + c]) * hits) / 16);
        }
      }
    }
  };
  const navy = [30, 41, 82];
  const orange = [234, 88, 12];
  const { x, y, outer, inner, disc } = LOGO_BADGE;
  fill([x - outer, y - outer, x + outer, y + outer], navy, (px, py) => {
    const d = Math.hypot(px - x, py - y);
    return d <= outer && d >= inner;
  });
  fill([x - disc, y - disc, x + disc, y + disc], orange, (px, py) => {
    return (px - x) ** 2 + (py - y) ** 2 <= disc * disc;
  });
  fill([160, 30, 310, 100], navy, (px, py) => inWordmark((px - 160) / 0.8, (py - 30) / 0.8));
  const [left, top, side] = LOGO_SQUARE;
  fill([left, top, left + side - 1, top + side - 1], [13, 148, 136], () => true);
  fill([120, 166, 180, 216], navy, (px, py) => insidePolygon(LOGO_TRIANGLE, px, py));
  const pill = LOGO_PILL;
  fill([pill.left - pill.radius, 176, pill.right + pill.radius, 208], orange, (px, py) => {
    const cx = Math.min(Math.max(px, pill.left), pill.right);
    return Math.hypot(px - cx, py - pill.y) <= pill.radius;
  });
  return { width, height, data };
};
