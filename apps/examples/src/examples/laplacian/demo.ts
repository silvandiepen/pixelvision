import { grayscale, laplacian } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { normalizeToGray } from "../../utils/visualize";
import type { LaplacianDemoOptions } from "./demo.model";

/**
 * Computes the Laplacian of the gray image and shows its strength.
 *
 * @param input - The image and the kernel size.
 * @returns The absolute Laplacian, scaled for display.
 */
export function demo({ image, options }: DemoInput<LaplacianDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const result = laplacian(gray, { size: options.size === 3 ? 3 : 1 });
  const at = (x: number, y: number) => result.data[y * result.width + x];

  return {
    images: [
      {
        label: "|Laplacian|",
        image: normalizeToGray(result.data.map(Math.abs), result.width, result.height),
      },
    ],
    values: {
      // Inside the flat red rectangle the brightness doesn't curve at all.
      flatInside: at(72, 60),
      // Just outside its left edge (column 23): light pixel next to dark ones.
      edge: at(23, 60),
    },
  };
}
