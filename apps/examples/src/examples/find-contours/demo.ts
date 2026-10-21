import { findContours, grayscale, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { FindContoursDemoOptions } from "./demo.model";

/**
 * Outlines every dark shape in the image.
 *
 * @param input - The image and the smallest region to keep.
 * @returns The mask with every outline drawn on it.
 */
export function demo({ image, options }: DemoInput<FindContoursDemoOptions>): DemoOutput {
  const mask = threshold(grayscale(image), { invert: true }); // dark shapes become white
  const contours = findContours(mask, { minPixels: options.minPixels });

  return {
    images: [
      { label: `${contours.length} outlines`, image: mask, overlay: { polygons: contours } },
    ],
    tables: [
      {
        label: "Outlines",
        columns: ["#", "points", "starts at"],
        rows: contours.map((c, i) => [i, c.length, `(${c[0].x}, ${c[0].y})`]),
      },
    ],
    values: {
      count: contours.length,
      // The red rectangle (24, 24) is the region whose top-left pixel comes first.
      firstStart: `${contours[0]?.[0].x},${contours[0]?.[0].y}`,
    },
  };
}
