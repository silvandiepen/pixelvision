import { hlsToRgb, rgbToHls } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { HlsToRgbDemoOptions } from "./demo.model";

/**
 * Lightens every pixel by changing only its HLS lightness, then converts
 * back to RGB.
 *
 * @param input - The image and how many levels to lighten by.
 * @returns The lightened image and a few swatches before and after.
 */
export function demo({ image, options }: DemoInput<HlsToRgbDemoOptions>): DemoOutput {
  const hls = rgbToHls(image);
  const unchanged = hlsToRgb(hls);
  for (let i = 1; i < hls.data.length; i += 3) {
    hls.data[i] = Math.min(255, Math.max(0, hls.data[i] + options.lighten));
  }
  const lighter = hlsToRgb(hls);
  const rgb = (m: Matrix<"u8">, x: number, y: number) => {
    const i = (y * m.width + x) * 3;
    return `${m.data[i]},${m.data[i + 1]},${m.data[i + 2]}`;
  };

  return {
    images: [
      { label: "Converted and back", image: unchanged },
      { label: `Lightness ${options.lighten >= 0 ? "+" : ""}${options.lighten}`, image: lighter },
    ],
    tables: [
      {
        label: "Swatches (R, G, B)",
        columns: ["Swatch", "Back unchanged", "Lightened"],
        rows: [
          ["Red", rgb(unchanged, 40, 120), rgb(lighter, 40, 120)],
          ["Gray", rgb(unchanged, 280, 120), rgb(lighter, 280, 120)],
          ["White", rgb(unchanged, 200, 200), rgb(lighter, 200, 200)],
        ],
      },
    ],
    values: {
      grayBack: rgb(unchanged, 280, 120),
      grayLighter: rgb(lighter, 280, 120),
      whiteLighter: rgb(lighter, 200, 200),
      redLighter: rgb(lighter, 40, 120),
    },
  };
}
