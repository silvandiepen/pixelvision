import { calcBackProject, calcHist, createMatrix, rgbToHsv } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countNonZero } from "../../utils/stats";
import type { CalcBackProjectDemoOptions } from "./demo.model";

/**
 * Learns the hue of the green circle, then lights up every pixel of that
 * hue.
 *
 * @param input - The image and the number of hue bins.
 * @returns The mask the histogram was learnt from, the histogram and the back-projection.
 */
export function demo({ image, options }: DemoInput<CalcBackProjectDemoOptions>): DemoOutput {
  const hsv = rgbToHsv(image);
  const { bins } = options;
  // Learn from a disc of radius 40 inside the green circle (centre 220, 70).
  const mask = createMatrix(image.width, image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (Math.hypot(x + 0.5 - 220, y + 0.5 - 70) <= 40) mask.data[y * image.width + x] = 255;
    }
  }
  // Hue is channel 0, 0–179.
  const hue = calcHist(hsv, { bins, range: [0, 180], mask }).data.subarray(0, bins);
  const largest = Math.max(...hue);
  const likelihood = calcBackProject(hsv, hue, { range: [0, 180], scale: 255 / largest });
  const at = (x: number, y: number) => likelihood.data[y * image.width + x];

  return {
    images: [
      { label: "Learnt from", image: mask },
      { label: "Back-projection", image: likelihood },
    ],
    charts: [{ label: "Hue histogram", values: Array.from(hue) }],
    values: {
      circleCentre: at(220, 70),
      background: at(300, 10),
      rectangle: at(60, 60),
      triangle: at(110, 190),
      litPixels: countNonZero(likelihood),
    },
  };
}
