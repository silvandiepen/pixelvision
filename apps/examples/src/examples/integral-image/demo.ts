import { grayscale, integralImage } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { normalizeToGray } from "../../utils/visualize";
import type { IntegralImageDemoOptions } from "./demo.model";

/**
 * Builds the integral image and sums a rectangle with four lookups.
 *
 * @param input - The image and the rectangle to sum.
 * @returns The table (scaled for display) and the rectangle's sum.
 */
export function demo({ image, options }: DemoInput<IntegralImageDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const { sum } = integralImage(gray);
  if (!sum) throw new Error("The sum table is on by default");
  const stride = gray.width + 1;
  const at = (x: number, y: number) => sum.data[y * stride + x];

  const x0 = Math.min(options.x, gray.width - 1);
  const y0 = Math.min(options.y, gray.height - 1);
  const x1 = Math.min(x0 + options.width, gray.width);
  const y1 = Math.min(y0 + options.height, gray.height);
  const rectangleSum = at(x1, y1) - at(x0, y1) - at(x1, y0) + at(x0, y0);

  let directSum = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) directSum += gray.data[y * gray.width + x];
  }

  const box = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
  return {
    images: [
      { label: "Gray, with the rectangle", image: gray, overlay: { polygons: [box] } },
      {
        label: "Sum table (scaled to 0–255)",
        image: normalizeToGray(sum.data, sum.width, sum.height),
      },
    ],
    tables: [
      {
        label: "Rectangle sum",
        columns: ["Four lookups", "Adding every pixel", "Mean"],
        rows: [[rectangleSum, directSum, rectangleSum / ((x1 - x0) * (y1 - y0))]],
      },
    ],
    values: {
      tableWidth: sum.width,
      total: at(gray.width, gray.height),
      rectangleSum,
      matchesDirectSum: rectangleSum === directSum,
    },
  };
}
