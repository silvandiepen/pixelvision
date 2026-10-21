import { assertInteger } from "../core/assert";
import type { Point } from "../math/transforms.model";
import type { PathSegment, SvgOptions, VectorPath } from "./vectorize.model";

const ESCAPES: Record<string, string> = { "&": "&amp;", '"': "&quot;", "<": "&lt;" };

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
      const text = (value / factor)
        .toFixed(precision)
        .replace(/(\.\d*?)0+$/, "$1")
        .replace(/\.$/, "")
        .replace(/^(-?)0\./, "$1.");
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
 * Writes paths as a standalone SVG document the size of the source image.
 *
 * @param paths - The paths, in drawing order.
 * @param width - Image width in pixels.
 * @param height - Image height in pixels.
 * @param options - Precision and fill colour.
 * @returns The SVG markup.
 * @throws {RangeError} When `precision` isn't a whole number from 0 to 6.
 */
export function writeSvg(
  paths: readonly VectorPath[],
  width: number,
  height: number,
  options: SvgOptions = {},
): string {
  const precision = options.precision ?? 1;
  assertInteger("toSvg", "precision", precision, 0);
  if (precision > 6) throw new RangeError(`toSvg: precision must be at most 6, got ${precision}`);
  const escape = (text: string) => text.replace(/[&"<]/g, (c) => ESCAPES[c]);
  const fill = options.fill === undefined ? "" : ` fill="${escape(options.fill)}"`;
  const body = paths
    .map((path) => {
      const colour = path.color ? ` fill="${path.color}"` : "";
      return `<path${colour} d="${pathData(path.segments, precision)}"/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"${fill}>${body}</svg>`;
}
