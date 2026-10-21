import { describe, expect, it } from "vitest";
import type { Point } from "../math/transforms.model";
import { drawMask } from "../test-svg";
import { detectLines, straightSpans } from "./snap";

/**
 * Samples round a 40 x 40 square, one per pixel, starting at the top-left
 * corner and running clockwise.
 *
 * @param top - The y of each top-side sample, by x.
 * @returns 160 samples.
 */
const square = (top: (x: number) => number = () => 0): Point[] => [
  ...Array.from({ length: 40 }, (_, i) => ({ x: i + 0.5, y: top(i + 0.5) })),
  ...Array.from({ length: 40 }, (_, i) => ({ x: 40, y: i + 0.5 })),
  ...Array.from({ length: 40 }, (_, i) => ({ x: 39.5 - i, y: 40 })),
  ...Array.from({ length: 40 }, (_, i) => ({ x: 0, y: 39.5 - i })),
];

describe("detectLines", () => {
  it("finds the sides of a square, in outline coordinates", () => {
    const lines = detectLines(
      drawMask(50, 50, (x, y) => x > 5 && x < 45 && y > 5 && y < 45),
      20,
    );
    // Pixel centres of the boundary pixels: the top row is y = 5, centre 5.5.
    expect(lines.some(({ from, to }) => from.y === 5.5 && to.y === 5.5)).toBe(true);
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });
});

describe("straightSpans", () => {
  const sides = [
    { from: { x: 2, y: 0.5 }, to: { x: 38, y: 0.5 } },
    { from: { x: 39.5, y: 2 }, to: { x: 39.5, y: 38 } },
  ];

  it("grows a span along its line beyond where the line was found", () => {
    const spans = straightSpans(square(), sides, 20);
    // The top side and the right side, each grown over the corner samples next to it.
    expect(spans).toHaveLength(2);
    expect(spans.map((s) => s.length).every((length) => length >= 39)).toBe(true);
  });

  it("finds nothing without lines, or when runs are too short", () => {
    expect(straightSpans(square(), [], 20)).toEqual([]);
    expect(straightSpans(square(), sides, 60)).toEqual([]);
  });

  it("ignores lines across the outline's direction", () => {
    const across = [{ from: { x: 20, y: -5 }, to: { x: 20, y: 5 } }];
    expect(straightSpans(square(), across, 5)).toEqual([]);
  });

  it("merges runs along one line that meet across the start of the outline", () => {
    // The top side's two halves sit 0.8 px apart and were found as two separate
    // lines, so each half seeds its own run. The left half's run grows back
    // over the corner, past the start of the outline; together the two runs
    // still lie along one line.
    const top = square((x) => (x < 20 ? 0.4 : -0.4));
    const halves = [
      { from: { x: 1, y: 0.4 }, to: { x: 19, y: 1.6 } },
      { from: { x: 21, y: -1.6 }, to: { x: 39, y: -0.4 } },
    ];
    expect(straightSpans(top, halves, 20)).toEqual([{ start: 159, length: 40 }]);
  });
});
