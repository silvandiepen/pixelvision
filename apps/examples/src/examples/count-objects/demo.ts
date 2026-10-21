import { connectedComponents, grayscale, otsuLevel, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { rectPolygon } from "../../utils/geometry";
import { PEBBLES } from "../../samples/samples";
import type { CountObjectsDemoOptions } from "./demo.model";

/**
 * Counts the dark objects on a light background.
 *
 * @param input - The image and the smallest object to count, in pixels.
 * @returns A box and number per object.
 */
export function demo({ image, options }: DemoInput<CountObjectsDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const mask = threshold(gray, { level: otsuLevel(gray), invert: true }); // objects white
  const objects = connectedComponents(mask).components.filter((c) => c.area >= options.minArea);

  // For the tests: every pebble the sample drew has an object centred on it.
  const matched = PEBBLES.filter((p) =>
    objects.some((o) => Math.hypot(o.centroid.x - p.x, o.centroid.y - p.y) < 1.5),
  ).length;

  return {
    images: [
      {
        label: `${objects.length} objects`,
        image,
        overlay: { polygons: objects.map(rectPolygon), points: objects.map((o) => o.centroid) },
      },
    ],
    tables: [
      {
        label: "Objects",
        columns: ["#", "centre", "size", "area (px)"],
        rows: objects.map((o, i) => [
          i + 1,
          `(${round(o.centroid.x, 1)}, ${round(o.centroid.y, 1)})`,
          `${o.width} x ${o.height}`,
          o.area,
        ]),
      },
    ],
    values: { count: objects.length, matched },
  };
}
