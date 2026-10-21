import { createMatrix, floodFill } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { rectPolygon } from "../../utils/geometry";
import type { FloodFillDemoOptions } from "./demo.model";

/**
 * Paints the green circle yellow, starting from its centre.
 *
 * @param input - The image, the tolerance per channel and whether it is measured from the seed.
 * @returns The painted image with the filled region's box, its area and size.
 */
export function demo({ image, options }: DemoInput<FloodFillDemoOptions>): DemoOutput {
  // floodFill works on 1 or 3 channels: drop the alpha channel.
  const rgb = createMatrix(image.width, image.height, { channels: 3 });
  for (let p = 0; p < image.width * image.height; p++) {
    rgb.data.set(image.data.subarray(p * 4, p * 4 + 3), p * 3);
  }

  const {
    image: painted,
    area,
    rect,
  } = floodFill(rgb, { x: 220, y: 70 }, [250, 200, 0], {
    loDiff: options.tolerance,
    upDiff: options.tolerance,
    fixedRange: options.fixedRange,
  });

  return {
    images: [
      {
        label: `${area} pixels filled`,
        image: painted,
        overlay: { polygons: [rectPolygon(rect)] },
      },
    ],
    values: {
      area,
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    },
  };
}
