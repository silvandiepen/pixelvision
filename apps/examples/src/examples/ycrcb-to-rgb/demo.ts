import { rgbToYCrCb, yCrCbToRgb } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { YCrCbToRgbDemoOptions } from "./demo.model";

/**
 * Scales the colour difference (Cr, Cb) round its centre and converts back:
 * 0 % leaves only the luma, 100 % the original colours.
 *
 * @param input - The image and the saturation in percent.
 * @returns The adjusted image and a few swatches.
 */
export function demo({ image, options }: DemoInput<YCrCbToRgbDemoOptions>): DemoOutput {
  const ycrcb = rgbToYCrCb(image);
  const scaled = rgbToYCrCb(image);
  const factor = options.saturation / 100;
  for (let i = 0; i < scaled.data.length; i += 3) {
    for (const c of [1, 2]) {
      const value = 128 + (scaled.data[i + c] - 128) * factor;
      scaled.data[i + c] = Math.min(255, Math.max(0, Math.round(value)));
    }
  }
  const back = yCrCbToRgb(ycrcb);
  const adjusted = yCrCbToRgb(scaled);
  const rgb = (m: Matrix<"u8">, x: number, y: number) => {
    const i = (y * m.width + x) * 3;
    return `${m.data[i]},${m.data[i + 1]},${m.data[i + 2]}`;
  };
  for (let i = 1; i < ycrcb.data.length; i += 3) ycrcb.data[i] = ycrcb.data[i + 1] = 128;
  const lumaOnly = yCrCbToRgb(ycrcb);

  return {
    images: [
      { label: `Colour at ${options.saturation} %`, image: adjusted },
      { label: "Luma only (Cr = Cb = 128)", image: lumaOnly },
    ],
    values: {
      redBack: rgb(back, 40, 120),
      grayBack: rgb(back, 280, 120),
      redAdjusted: rgb(adjusted, 40, 120),
      redLumaOnly: rgb(lumaOnly, 40, 120),
    },
  };
}
