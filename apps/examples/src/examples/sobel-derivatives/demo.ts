import { grayscale, sobelDerivatives } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { valueAt } from "../../utils/stats";
import { gradientMagnitude, gradientsToColor } from "../../utils/visualize";
import type { SobelDerivativesDemoOptions } from "./demo.model";

/**
 * Computes the horizontal and vertical gradient of every pixel.
 *
 * @param input - The image and how to show the gradients.
 * @returns The gradients as colour (gx red/cyan, gy green/magenta) or as edge strength.
 */
export function demo({ image, options }: DemoInput<SobelDerivativesDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const gradients = sobelDerivatives(gray); // [gx, gy] per pixel, i32

  return {
    images: [
      {
        label: options.view === "color" ? "gx (red/cyan), gy (green/magenta)" : "|gx| + |gy|",
        image:
          options.view === "color" ? gradientsToColor(gradients) : gradientMagnitude(gradients),
      },
    ],
    tables: [
      {
        label: "Gradients at the left edge of the red rectangle, and inside it",
        columns: ["Pixel", "gx", "gy"],
        rows: [
          ["(24, 60)", valueAt(gradients, 24, 60, 0), valueAt(gradients, 24, 60, 1)],
          ["(72, 60)", valueAt(gradients, 72, 60, 0), valueAt(gradients, 72, 60, 1)],
        ],
      },
    ],
    values: {
      type: gradients.type,
      channels: gradients.channels,
      gxAtLeftEdge: valueAt(gradients, 24, 60, 0),
      gyAtLeftEdge: valueAt(gradients, 24, 60, 1),
      gxInside: valueAt(gradients, 72, 60, 0),
      gyInside: valueAt(gradients, 72, 60, 1),
    },
  };
}
