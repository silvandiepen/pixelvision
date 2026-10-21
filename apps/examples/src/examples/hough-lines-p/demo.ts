import { canny, grayscale, houghLinesP } from "pixelvision";
import type { LineSegment, Point } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { SHAPES_TRIANGLE } from "../../samples/samples";
import type { HoughLinesPDemoOptions } from "./demo.model";

/**
 * Tells whether a segment runs along a side: both its ends within `tolerance`
 * pixels of the side's line, and it covers at least 80% of the side.
 *
 * @param segment - A detected segment.
 * @param a - One end of the side.
 * @param b - The other end.
 * @param tolerance - Largest distance from the side's line, in pixels.
 * @returns `true` when the segment traces the side.
 */
function tracesSide(segment: LineSegment, a: Point, b: Point, tolerance: number): boolean {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const distance = (p: Point) =>
    Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / length;
  const covered = Math.hypot(segment.to.x - segment.from.x, segment.to.y - segment.from.y);
  return (
    distance(segment.from) <= tolerance &&
    distance(segment.to) <= tolerance &&
    covered >= 0.8 * length
  );
}

/**
 * Finds line segments in the edges of the image.
 *
 * @param input - The image, vote threshold, shortest segment, largest gap and seed.
 * @returns The edges with the segments drawn over them, and the segments.
 */
export function demo({ image, options }: DemoInput<HoughLinesPDemoOptions>): DemoOutput {
  const edges = canny(grayscale(image), { low: 40, high: 120 });
  const segments = houghLinesP(edges, {
    threshold: options.threshold,
    minLineLength: options.minLineLength,
    maxLineGap: options.maxLineGap,
    // −1 picks the default seed.
    seed: options.seed < 0 ? undefined : options.seed,
  });

  // The red rectangle covers x 24–119, y 24–95: its sides lie on these lines.
  const rectangle: Point[] = [
    { x: 24, y: 24 },
    { x: 119, y: 24 },
    { x: 119, y: 95 },
    { x: 24, y: 95 },
  ];
  const sidesFound = (corners: readonly Point[]) =>
    corners.filter((corner, i) => {
      const next = corners[(i + 1) % corners.length];
      return segments.some((segment) => tracesSide(segment, corner, next, 2));
    }).length;

  return {
    images: [
      {
        label: "Edges and segments",
        image: edges,
        overlay: { lines: segments, points: segments.flatMap(({ from, to }) => [from, to]) },
      },
    ],
    tables: [
      {
        label: "Segments, in the order found",
        columns: ["from", "to", "length (px)"],
        rows: segments.map(({ from, to }) => [
          `${from.x}, ${from.y}`,
          `${to.x}, ${to.y}`,
          Math.round(Math.hypot(to.x - from.x, to.y - from.y)),
        ]),
      },
    ],
    values: {
      segmentCount: segments.length,
      rectangleSidesFound: sidesFound(rectangle),
      triangleSidesFound: sidesFound(SHAPES_TRIANGLE),
    },
  };
}
