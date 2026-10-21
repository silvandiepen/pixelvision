import { canny, dilate, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { countNonZero } from "../../utils/stats";
import type { DilateDemoOptions } from "./demo.model";

/**
 * Thickens the Canny edges of the image.
 *
 * @param input - The image, the neighbourhood radius and the iterations.
 * @returns The edges before and after.
 */
export function demo({ image, options }: DemoInput<DilateDemoOptions>): DemoOutput {
  const edges = canny(grayscale(image), { low: 40, high: 120 });
  const thick = dilate(edges, { radius: options.radius, iterations: options.iterations });

  return {
    images: [
      { label: "Edges", image: edges },
      { label: "Dilated", image: thick },
    ],
    values: {
      growth: round(countNonZero(thick) / countNonZero(edges), 2),
      // Dilation only adds: every edge pixel is still set.
      keepsEveryPixel: edges.data.every((value, i) => value === 0 || thick.data[i] === 255),
    },
  };
}
