import { connectedComponents, grayscale, threshold } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { rectPolygon } from "../../utils/geometry";
import { normalizeToGray } from "../../utils/visualize";
import type { ConnectedComponentsDemoOptions } from "./demo.model";

/**
 * Labels the dark shapes of the image and measures each one.
 *
 * @param input - The image, and whether diagonal neighbours connect.
 * @returns The labels and every region's box, area and centre.
 */
export function demo({ image, options }: DemoInput<ConnectedComponentsDemoOptions>): DemoOutput {
  const mask = threshold(grayscale(image), { invert: true }); // dark shapes become white
  const { labels, components } = connectedComponents(mask, options.connectivity === 4 ? 4 : 8);
  const [rectangle] = components;

  return {
    images: [
      { label: "Mask", image: mask },
      {
        label: `${components.length} regions, by label`,
        image: normalizeToGray(labels.data, labels.width, labels.height),
        overlay: {
          polygons: components.map(rectPolygon),
          points: components.map((c) => c.centroid),
        },
      },
    ],
    tables: [
      {
        label: "Regions",
        columns: ["label", "x", "y", "width", "height", "area", "centre"],
        rows: components.map((c) => [
          c.label,
          c.x,
          c.y,
          c.width,
          c.height,
          c.area,
          `(${round(c.centroid.x, 1)}, ${round(c.centroid.y, 1)})`,
        ]),
      },
    ],
    values: {
      count: components.length,
      rectangleArea: rectangle?.area ?? 0,
      rectangleCentre: rectangle ? `${rectangle.centroid.x},${rectangle.centroid.y}` : "",
      squareArea: components[3]?.area ?? 0,
    },
  };
}
