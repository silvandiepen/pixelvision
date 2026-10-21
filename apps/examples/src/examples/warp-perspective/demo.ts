import { fromImageData, perspectiveTransform, warpPerspective } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { rectangleCorners } from "../../utils/geometry";
import type { WarpPerspectiveDemoOptions } from "./demo.model";

/**
 * Tilts the image backwards: the bottom edge stays, the top edge shrinks
 * towards the middle, as if the picture were leaning away.
 *
 * @param input - The image and how far to tilt it (share of the width).
 * @returns The warped image.
 */
export function demo({ image, options }: DemoInput<WarpPerspectiveDemoOptions>): DemoOutput {
  const rgba = fromImageData(image);
  const { width, height } = rgba;
  const inset = options.tilt * width;

  // The warp maps output pixels to input pixels: output corners → input corners.
  // The output's top corners read from outside the input, which leans it back.
  // Corners are pixel centres: (0, 0) to (width - 1, height - 1).
  const outputCorners = rectangleCorners(width - 1, height - 1);
  const inputCorners = [
    { x: -inset, y: 0 },
    { x: width - 1 + inset, y: 0 },
    { x: width - 1, y: height - 1 },
    { x: 0, y: height - 1 },
  ];
  const transform = perspectiveTransform(outputCorners, inputCorners);
  const warped = warpPerspective(rgba, transform, { fill: 0 });

  let filledPixels = 0;
  for (let i = 0; i < width * height; i++) if (warped.data[i * 4 + 3] === 0) filledPixels++;
  // The bottom edge maps onto itself, and its middle pixel onto itself exactly.
  const middle = ((height - 1) * width + width / 2) * 4;
  let bottomMiddleDifference = 0;
  for (let c = 0; c < 4; c++) {
    const difference = Math.abs(warped.data[middle + c] - rgba.data[middle + c]);
    bottomMiddleDifference = Math.max(bottomMiddleDifference, difference);
  }

  return {
    images: [{ label: "Warped (fill shown black)", image: warped }],
    values: {
      filledPixels,
      topLeftFilled: warped.data[3] === 0,
      bottomMiddleDifference,
    },
  };
}
