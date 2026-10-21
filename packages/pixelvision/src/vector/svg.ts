import { assertInteger } from "../core/assert";
import type { Point } from "../math/transforms.model";
import type { PathSegment, PrimitiveShape, SvgOptions, VectorShape } from "./vectorize.model";

const ESCAPES: Record<string, string> = { "&": "&amp;", '"': "&quot;", "<": "&lt;" };

/**
 * Writes a number with at most `precision` decimals, without trailing
 * zeros or a leading zero (`0.5` is `.5`).
 *
 * @param value - The number.
 * @param precision - Decimal places.
 * @returns The text.
 */
export function formatNumber(value: number, precision: number): string {
  const text = value
    .toFixed(precision)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "")
    .replace(/^(-?)0\./, "$1.");
  return text === "-0" ? "0" : text;
}

/**
 * Writes path segments as compact SVG path data: absolute `M`, then
 * relative `l`/`h`/`v`/`c` and `z`, coordinates rounded to `precision`
 * decimals, repeated commands and needless separators left out. Relative
 * steps are taken between rounded points, so rounding never accumulates.
 *
 * @param segments - The segments.
 * @param precision - Decimal places.
 * @returns The path data.
 */
export function pathData(segments: readonly PathSegment[], precision: number): string {
  const factor = 10 ** precision;
  const snap = (p: Point): Point => ({ x: Math.round(p.x * factor), y: Math.round(p.y * factor) });
  let d = "";
  let command = "";
  let previous = "";
  const write = (letter: string, values: number[]) => {
    if (letter !== command) {
      d += letter;
      command = letter;
      previous = "";
    }
    for (const value of values) {
      const text = formatNumber(value / factor, precision);
      // A minus sign, or a second decimal point, already starts a new number.
      const joined = text[0] === "-" || (text[0] === "." && previous.includes("."));
      d += previous && !joined ? ` ${text}` : text;
      previous = text;
    }
  };
  let current: Point = { x: 0, y: 0 };
  let start = current;
  segments.forEach((segment, i) => {
    if (segment.type === "Z") {
      write("z", []);
      current = start;
      return;
    }
    const points = segment.points.map(snap);
    const end = points[points.length - 1];
    const dx = end.x - current.x;
    const dy = end.y - current.y;
    if (segment.type === "M") {
      write("M", [end.x, end.y]);
      start = end;
    } else if (segment.type === "C") {
      write(
        "c",
        points.flatMap((p) => [p.x - current.x, p.y - current.y]),
      );
    } else {
      // Drop a line that rounds to nothing, or that `z` would draw anyway.
      const closing = segments[i + 1]?.type === "Z" && end.x === start.x && end.y === start.y;
      if ((dx === 0 && dy === 0) || closing) return;
      if (dx === 0) write("v", [dy]);
      else if (dy === 0) write("h", [dx]);
      else write("l", [dx, dy]);
    }
    current = end;
  });
  return d;
}

/**
 * Writes a primitive as one closed subpath of absolute SVG path data, with
 * elliptical arcs for circles, ellipses and rounded corners.
 *
 * @param shape - The primitive.
 * @param precision - Decimal places.
 * @returns The path data.
 */
export function primitiveData(shape: PrimitiveShape, precision: number): string {
  const n = (value: number) => formatNumber(value, precision);
  const point = (p: Point) => `${n(p.x)} ${n(p.y)}`;
  if (shape.kind === "polygon") {
    return `M${shape.points.map(point).join("L")}z`;
  }
  if (shape.kind === "rect") {
    const { x, y, width, height, rx, angle } = shape;
    const turn = (angle * Math.PI) / 180;
    const [cx, cy] = [x + width / 2, y + height / 2];
    const at = (u: number, v: number) =>
      point({
        x: cx + u * Math.cos(turn) - v * Math.sin(turn),
        y: cy + u * Math.sin(turn) + v * Math.cos(turn),
      });
    const [w, h] = [width / 2, height / 2];
    if (rx === 0) return `M${at(-w, -h)}L${at(w, -h)}L${at(w, h)}L${at(-w, h)}z`;
    const arc = `A${n(rx)} ${n(rx)} 0 0 1 `;
    return (
      `M${at(-w + rx, -h)}L${at(w - rx, -h)}${arc}${at(w, -h + rx)}L${at(w, h - rx)}` +
      `${arc}${at(w - rx, h)}L${at(-w + rx, h)}${arc}${at(-w, h - rx)}L${at(-w, -h + rx)}` +
      `${arc}${at(-w + rx, -h)}z`
    );
  }
  const [rx, ry, angle] =
    shape.kind === "circle" ? [shape.r, shape.r, 0] : [shape.rx, shape.ry, shape.angle];
  const turn = (angle * Math.PI) / 180;
  const ux = rx * Math.cos(turn);
  const uy = rx * Math.sin(turn);
  // Two half arcs, from one end of the x axis to the other and back.
  const arc = `A${n(rx)} ${n(ry)} ${n(angle)} 1 1 `;
  const start = point({ x: shape.cx + ux, y: shape.cy + uy });
  return `M${start}${arc}${point({ x: shape.cx - ux, y: shape.cy - uy })}${arc}${start}z`;
}

/**
 * Writes one shape as an SVG element.
 *
 * @param shape - The shape.
 * @param precision - Decimal places.
 * @param ink - Colour for an uncoloured ring's stroke.
 * @returns The element.
 */
const shapeElement = (shape: VectorShape, precision: number, ink: string): string => {
  const n = (value: number) => formatNumber(value, precision);
  const fill = shape.color ? ` fill="${shape.color}"` : "";
  const turned = (angle: number, cx: number, cy: number) =>
    n(angle) === "0" ? "" : ` transform="rotate(${n(angle)} ${n(cx)} ${n(cy)})"`;
  switch (shape.kind) {
    case "path":
      return shape.parts
        ? `<path${fill} fill-rule="evenodd" d="${shape.parts.map((part) => primitiveData(part, precision)).join("")}"/>`
        : `<path${fill} d="${pathData(shape.segments, precision)}"/>`;
    case "circle": {
      const at = `cx="${n(shape.cx)}" cy="${n(shape.cy)}" r="${n(shape.r)}"`;
      if (shape.strokeWidth === undefined) return `<circle${fill} ${at}/>`;
      const stroke = shape.color ?? ink;
      return `<circle fill="none" stroke="${stroke}" stroke-width="${n(shape.strokeWidth)}" ${at}/>`;
    }
    case "ellipse": {
      const { cx, cy, rx, ry, angle } = shape;
      return `<ellipse${fill} cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}"${turned(angle, cx, cy)}/>`;
    }
    case "rect": {
      const { x, y, width, height, rx, angle } = shape;
      const corner = n(rx) === "0" ? "" : ` rx="${n(rx)}"`;
      const spin = turned(angle, x + width / 2, y + height / 2);
      return `<rect${fill} x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}"${corner}${spin}/>`;
    }
    default:
      return `<polygon${fill} points="${shape.points.map((p) => `${n(p.x)},${n(p.y)}`).join(" ")}"/>`;
  }
};

/**
 * Writes shapes as a standalone SVG document the size of the source image.
 *
 * @param shapes - The shapes, in drawing order.
 * @param width - Image width in pixels.
 * @param height - Image height in pixels.
 * @param options - Precision and fill colour.
 * @returns The SVG markup.
 * @throws {RangeError} When `precision` isn't a whole number from 0 to 6.
 */
export function writeSvg(
  shapes: readonly VectorShape[],
  width: number,
  height: number,
  options: SvgOptions = {},
): string {
  const precision = options.precision ?? 1;
  assertInteger("toSvg", "precision", precision, 0);
  if (precision > 6) throw new RangeError(`toSvg: precision must be at most 6, got ${precision}`);
  const escape = (text: string) => text.replace(/[&"<]/g, (c) => ESCAPES[c]);
  const fill = options.fill === undefined ? "" : ` fill="${escape(options.fill)}"`;
  const ink = options.fill === undefined ? "#000" : escape(options.fill);
  const body = shapes.map((shape) => shapeElement(shape, precision, ink)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"${fill}>${body}</svg>`;
}
