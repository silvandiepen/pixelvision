import { fromImageData } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { FromImageDataDemoOptions } from "./demo.model";

/**
 * Wraps canvas pixels as a 4-channel matrix and reads one pixel back.
 *
 * @param input - The image and the pixel to inspect.
 * @returns The matrix and the inspected pixel's channels.
 */
export function demo({ image, options }: DemoInput<FromImageDataDemoOptions>): DemoOutput {
  const matrix = fromImageData(image);
  const x = Math.min(options.x, matrix.width - 1);
  const y = Math.min(options.y, matrix.height - 1);
  const i = (y * matrix.width + x) * matrix.channels;

  let differences = 0;
  for (let k = 0; k < matrix.width * matrix.height * 4; k++) {
    if (matrix.data[k] !== image.data[k]) differences++;
  }

  return {
    images: [{ label: "Matrix", image: matrix, overlay: { points: [{ x: x + 0.5, y: y + 0.5 }] } }],
    tables: [
      {
        label: `Pixel (${x}, ${y})`,
        columns: ["R", "G", "B", "A"],
        rows: [Array.from(matrix.data.subarray(i, i + 4))],
      },
    ],
    values: {
      type: matrix.type,
      channels: matrix.channels,
      differences,
      copied: matrix.data.buffer !== image.data.buffer,
    },
  };
}
