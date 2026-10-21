import { filter2D, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { normalizeToGray } from "../../utils/visualize";
import { valueAt } from "../../utils/stats";
import type { Filter2DDemoOptions } from "./demo.model";

/**
 * Filters the gray swatches with the kernel, as bytes and as floats.
 *
 * @param input - The image and the kernel.
 * @returns The byte result, the float result scaled for display, and values at an edge.
 */
export function demo({ image, options }: DemoInput<Filter2DDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const bytes = filter2D(gray, options.kernel);
  const floats = filter2D(gray, options.kernel, { type: "f32" });

  // The gray swatch (128) sits above the near-black one (20); the edge runs
  // between rows 159 and 160.
  return {
    images: [
      { label: "Gray", image: gray },
      { label: "Filtered (bytes, 0–255)", image: bytes },
      {
        label: "Filtered (floats, scaled to fit)",
        image: normalizeToGray(floats.data, floats.width, floats.height),
      },
    ],
    values: {
      flat: valueAt(bytes, 280, 120),
      aboveEdge: valueAt(bytes, 280, 159),
      belowEdge: valueAt(bytes, 280, 160),
      belowEdgeFloat: valueAt(floats, 280, 160),
    },
  };
}
