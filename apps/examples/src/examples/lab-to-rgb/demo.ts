import { labToRgb, rgbToLab } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { LabToRgbDemoOptions } from "./demo.model";

/**
 * Converts the image to L*a*b* and back, and again with every pixel's
 * lightness set to one value: the colours stay, only their brightness
 * evens out.
 *
 * @param input - The image and the lightness L* (0–100) to give every pixel.
 * @returns The round trip and the evened-out image.
 */
export function demo({ image, options }: DemoInput<LabToRgbDemoOptions>): DemoOutput {
  const lab = rgbToLab(image);
  const back = labToRgb(lab);
  const level = Math.round((options.lightness * 255) / 100);
  for (let i = 0; i < lab.data.length; i += 3) lab.data[i] = level;
  const even = labToRgb(lab);
  const rgb = (m: Matrix<"u8">, x: number, y: number) => {
    const i = (y * m.width + x) * 3;
    return [m.data[i], m.data[i + 1], m.data[i + 2]];
  };
  const [grayR, grayG, grayB] = rgb(even, 280, 120);

  return {
    images: [
      { label: "Converted and back", image: back },
      { label: `Every pixel at L* ${options.lightness}`, image: even },
    ],
    values: {
      redBack: rgb(back, 40, 120).join(","),
      grayBack: rgb(back, 280, 120).join(","),
      whiteBack: rgb(back, 200, 200).join(","),
      grayR,
      grayG,
      grayB,
    },
  };
}
