import { adaptiveThreshold, grayscale, threshold, vectorize } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { maskIou, rasterizePaths } from "../../utils/vector";
import { LOGO_BADGE, LOGO_SQUARE } from "../../samples/samples";
import type { VectorizeDemoOptions } from "./demo.model";

/**
 * Traces the image into vector paths and writes them as an SVG.
 *
 * @param input - The image and the tracing options.
 * @returns The SVG next to the source, a table of the paths, and the checks' values.
 */
export function demo({ image, options }: DemoInput<VectorizeDemoOptions>): DemoOutput {
  const result = vectorize(image, {
    threshold: options.threshold as "otsu" | "adaptive" | number,
    tolerance: options.tolerance,
    corners: options.corners,
    curves: options.curves,
    snapLines: options.snapLines,
    colors: options.colors > 0 ? options.colors : undefined,
  });
  const svg = result.toSvg({ precision: 1 });
  const types = result.paths.map((path) => path.segments.map((s) => s.type).join(""));

  // The path drawn round a point: the smallest whose bounds contain it.
  const pathAt = (x: number, y: number) => {
    let best = -1;
    let bestArea = Infinity;
    result.paths.forEach((path, i) => {
      const points = path.segments.flatMap((segment) => segment.points);
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const area = (x1 - x0) * (y1 - y0);
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1 && area < bestArea) [best, bestArea] = [i, area];
    });
    return result.paths[best]?.segments ?? [];
  };
  const [left, top, side] = LOGO_SQUARE;
  const square = pathAt(left + side / 2, top + side / 2);
  const disc = pathAt(LOGO_BADGE.x, LOGO_BADGE.y);

  const values: DemoOutput["values"] = {
    paths: result.paths.length,
    holes: result.paths.reduce((sum, path) => sum + path.holes, 0),
    squareCorners: square.filter((s) => s.type === "M" || s.type === "L").length,
    discAllCurves: /^MC+Z$/.test(disc.map((s) => s.type).join("")),
    bytes: svg.length,
  };
  if (!options.colors) {
    // The same black-and-white split vectorize makes, to compare the SVG against.
    const gray = grayscale(image);
    const mask =
      options.threshold === "adaptive"
        ? adaptiveThreshold(gray, { blockSize: 25, offset: 10, invert: true })
        : threshold(gray, {
            level: options.threshold === "otsu" ? undefined : Number(options.threshold),
            invert: true,
          });
    const drawn = rasterizePaths(result.paths, result.width, result.height);
    values.iou = round(maskIou(drawn, mask.data), 4);
  }

  return {
    svgs: [{ label: `SVG: ${result.paths.length} paths`, markup: svg, fileName: "vectorized.svg" }],
    tables: [
      {
        label: "Paths",
        columns: ["#", "colour", "holes", "lines", "curves"],
        rows: result.paths.map((path, i) => [
          i,
          path.color ?? "fill",
          path.holes,
          types[i].split("L").length - 1,
          types[i].split("C").length - 1,
        ]),
      },
    ],
    values,
  };
}
