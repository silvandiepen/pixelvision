import { canny, grayscale, houghLines } from "pixelvision";
import type { DemoInput, DemoOutput, Segment } from "../example.model";
import { round } from "../../utils/format";
import { lineThrough, sameLine } from "../../utils/geometry";
import { houghLineToSegment } from "../../utils/visualize";
import { SHAPES_TRIANGLE } from "../../samples/samples";
import type { HoughLinesDemoOptions } from "./demo.model";

/**
 * Finds straight lines in the edges of the image.
 *
 * @param input - The image, vote threshold, angle step (degrees) and line limit.
 * @returns The edges with the lines drawn over them, and the lines.
 */
export function demo({ image, options }: DemoInput<HoughLinesDemoOptions>): DemoOutput {
  const edges = canny(grayscale(image), { low: 40, high: 120 });
  const lines = houghLines(edges, {
    threshold: options.threshold,
    thetaStep: (options.thetaStep * Math.PI) / 180,
    maxLines: options.maxLines,
  });

  const segments = lines
    .map((line) => houghLineToSegment(line, edges.width, edges.height))
    .filter((segment): segment is Segment => segment !== null);

  // Which sides of the triangle in the shapes sample were found (within 3 px and 2°)?
  const triangleSidesFound = SHAPES_TRIANGLE.filter((corner, i) => {
    const side = lineThrough(corner, SHAPES_TRIANGLE[(i + 1) % 3]);
    return lines.some((line) => sameLine(line, side, 3, (2 * Math.PI) / 180));
  }).length;

  return {
    images: [{ label: "Edges and lines", image: edges, overlay: { lines: segments } }],
    tables: [
      {
        label: "Lines, strongest first",
        columns: ["rho (px)", "theta (°)", "votes"],
        rows: lines.map((line) => [
          round(line.rho, 1),
          round((line.theta * 180) / Math.PI, 1),
          line.votes,
        ]),
      },
    ],
    values: {
      lineCount: lines.length,
      strongestVotes: lines[0]?.votes ?? 0,
      triangleSidesFound,
    },
  };
}
