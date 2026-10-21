import { findContours, grayscale, huMoments, moments, threshold } from "pixelvision";
import type { Point } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";

/**
 * Describes each dark shape by its seven Hu invariants, and checks they
 * don't change when a square is turned and scaled.
 *
 * @param input - The image.
 * @returns The invariants of every shape.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const contours = findContours(threshold(grayscale(image), { invert: true }), { minPixels: 50 });
  const names = ["Rectangle", "Circle", "Triangle", "Tilted square"];
  const hu = contours.map((contour) => huMoments(moments(contour)));

  // A square, then the same square turned 30° and twice the size.
  const square: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];
  const angle = Math.PI / 6;
  const turned = square.map(({ x, y }) => ({
    x: 2 * (x * Math.cos(angle) - y * Math.sin(angle)) + 50,
    y: 2 * (x * Math.sin(angle) + y * Math.cos(angle)) + 20,
  }));
  const [a, b] = [huMoments(moments(square)), huMoments(moments(turned))];
  const unchanged = a.every((value, i) => Math.abs(value - b[i]) <= 1e-12 + 1e-9 * Math.abs(value));

  return {
    images: [{ label: "Shapes", image, overlay: { polygons: contours } }],
    tables: [
      {
        label: "Hu invariants (the first three)",
        columns: ["Shape", "h1", "h2", "h3"],
        rows: hu.map((h, i) => [
          names[i] ?? `#${i}`,
          round(h[0], 5),
          round(h[1], 7),
          round(h[2], 7),
        ]),
      },
    ],
    values: {
      squareH1: round(a[0], 6),
      turnedAndScaled: unchanged,
      tiltedSquareH1: round(hu[3]?.[0] ?? 0, 4),
      circleH1: round(hu[1]?.[0] ?? 0, 4),
    },
  };
}
