import { hsvToRgb, rgbToHsv } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { HsvToRgbDemoOptions } from "./demo.model";

/**
 * Turns every colour round the colour wheel by changing only its hue, then
 * converts back to RGB.
 *
 * @param input - The image and the hue shift (0–179, degrees halved).
 * @returns The recoloured image and a few swatches.
 */
export function demo({ image, options }: DemoInput<HsvToRgbDemoOptions>): DemoOutput {
  const hsv = rgbToHsv(image);
  for (let i = 0; i < hsv.data.length; i += 3) hsv.data[i] = (hsv.data[i] + options.shift) % 180;
  const shifted = hsvToRgb(hsv);
  const rgb = (m: Matrix<"u8">, x: number, y: number) => {
    const i = (y * m.width + x) * 3;
    return `${m.data[i]},${m.data[i + 1]},${m.data[i + 2]}`;
  };

  return {
    images: [{ label: `Hue + ${options.shift * 2}°`, image: shifted }],
    tables: [
      {
        label: "Middle row (R, G, B)",
        columns: ["Swatch", "Shifted"],
        rows: [
          ["Red", rgb(shifted, 40, 120)],
          ["Blue", rgb(shifted, 200, 120)],
          ["Gray", rgb(shifted, 280, 120)],
        ],
      },
    ],
    values: {
      red: rgb(shifted, 40, 120),
      blue: rgb(shifted, 200, 120),
      gray: rgb(shifted, 280, 120),
    },
  };
}
