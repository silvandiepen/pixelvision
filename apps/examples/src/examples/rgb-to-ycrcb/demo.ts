import { inRange, rgbToYCrCb } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countNonZero } from "../../utils/stats";

/**
 * Converts the swatches to YCrCb and marks skin tones with the classic
 * Cr/Cb box.
 *
 * @param input - The image.
 * @returns The skin mask and the values of two swatches.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const ycrcb = rgbToYCrCb(image);
  // Skin of any brightness: Cr 133–173, Cb 77–127 (Chai & Ngan).
  const skin = inRange(ycrcb, [0, 133, 77], [255, 173, 127]);
  const at = (x: number, y: number) => {
    const i = (y * ycrcb.width + x) * 3;
    return `${ycrcb.data[i]},${ycrcb.data[i + 1]},${ycrcb.data[i + 2]}`;
  };

  return {
    images: [{ label: "Cr 133–173 and Cb 77–127", image: skin }],
    tables: [
      {
        label: "Swatches (Y, Cr, Cb)",
        columns: ["Swatch", "YCrCb"],
        rows: [
          ["Skin (224, 172, 105)", at(120, 40)],
          ["Red (220, 38, 38)", at(40, 120)],
          ["Gray (128, 128, 128)", at(280, 120)],
          ["Yellow (240, 220, 10)", at(40, 200)],
        ],
      },
    ],
    values: {
      skinPixels: countNonZero(skin),
      skin: at(120, 40),
      red: at(40, 120),
      gray: at(280, 120),
    },
  };
}
