import { createMatrix, fromImageData, grayscale, toImageData } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { ToImageDataDemoOptions } from "./demo.model";

/**
 * Builds a 1-, 3- or 4-channel matrix from the image and converts it back
 * to RGBA pixels for drawing.
 *
 * @param input - The image and the channel count to convert from.
 * @returns The RGBA result.
 */
export function demo({ image, options }: DemoInput<ToImageDataDemoOptions>): DemoOutput {
  let matrix: Matrix<"u8">;
  if (options.channels === 1) {
    matrix = grayscale(image);
  } else if (options.channels === 3) {
    matrix = createMatrix(image.width, image.height, { channels: 3 });
    for (let i = 0; i < image.width * image.height; i++) {
      matrix.data.set(image.data.subarray(i * 4, i * 4 + 3), i * 3);
    }
  } else {
    matrix = fromImageData(image);
  }

  const rgba = toImageData(matrix);
  // Draw it with: context.putImageData(new ImageData(rgba.data, rgba.width), 0, 0)

  let mismatches = 0;
  for (let i = 0; i < matrix.width * matrix.height; i++) {
    for (let c = 0; c < 3; c++) {
      const expected = matrix.data[i * matrix.channels + (matrix.channels === 1 ? 0 : c)];
      if (rgba.data[i * 4 + c] !== expected) mismatches++;
    }
    const alpha = matrix.channels === 4 ? matrix.data[i * 4 + 3] : 255;
    if (rgba.data[i * 4 + 3] !== alpha) mismatches++;
  }

  return {
    images: [{ label: `RGBA from ${options.channels} channel(s)`, image: rgba }],
    values: {
      length: rgba.data.length,
      mismatches,
      isClamped: rgba.data instanceof Uint8ClampedArray,
    },
  };
}
