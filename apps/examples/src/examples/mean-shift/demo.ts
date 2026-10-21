import { calcBackProject, calcHist, createMatrix, meanShift, rgbToHsv } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { rectPolygon } from "../../utils/geometry";
import type { MeanShiftDemoOptions } from "./demo.model";

/**
 * Finds the green circle by its hue, starting from a window that only
 * partly covers it.
 *
 * @param input - The image, where the window starts, its size and the iteration limit.
 * @returns The back-projection with the start and end windows.
 */
export function demo({ image, options }: DemoInput<MeanShiftDemoOptions>): DemoOutput {
  const hsv = rgbToHsv(image);
  // Learn the circle's hue from a disc inside it (centre 220, 70).
  const mask = createMatrix(image.width, image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (Math.hypot(x + 0.5 - 220, y + 0.5 - 70) <= 40) mask.data[y * image.width + x] = 255;
    }
  }
  const hue = calcHist(hsv, { bins: 16, range: [0, 180], mask }).data.subarray(0, 16);
  const likelihood = calcBackProject(hsv, hue, {
    range: [0, 180],
    scale: 255 / Math.max(...hue),
  });

  const { size } = options;
  const start = { x: options.startX, y: 70 - size / 2 - 10, width: size, height: size };
  const { window, iterations } = meanShift(likelihood, start, {
    maxIterations: options.maxIterations,
  });

  return {
    images: [
      {
        label: "Start and end windows",
        image: likelihood,
        overlay: { polygons: [rectPolygon(start), rectPolygon(window)] },
      },
    ],
    values: {
      centreX: window.x + window.width / 2,
      centreY: window.y + window.height / 2,
      moved: window.x - start.x,
      iterations,
    },
  };
}
