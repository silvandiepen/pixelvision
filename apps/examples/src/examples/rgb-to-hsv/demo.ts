import { createMatrix, rgbToHsv } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";

/**
 * Converts the image to HSV and shows hue, saturation and value as three
 * gray images.
 *
 * @param input - The image.
 * @returns The three channels.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const hsv = rgbToHsv(image);
  const channel = (c: number): Matrix<"u8"> => {
    const out = createMatrix(hsv.width, hsv.height);
    for (let i = 0; i < out.data.length; i++) out.data[i] = hsv.data[i * 3 + c];
    return out;
  };
  const at = (x: number, y: number) => {
    const i = (y * hsv.width + x) * 3;
    return { h: hsv.data[i], s: hsv.data[i + 1], v: hsv.data[i + 2] };
  };
  // Hue runs 0–179 (degrees halved); stretch it to 0–255 to show it as gray.
  const hue = channel(0);
  for (let i = 0; i < hue.data.length; i++) hue.data[i] = Math.round((hue.data[i] * 255) / 179);

  const red = at(60, 60);
  const green = at(220, 70);
  const blue = at(110, 190);
  return {
    images: [
      { label: "Hue (0–179, stretched)", image: hue },
      { label: "Saturation", image: channel(1) },
      { label: "Value", image: channel(2) },
    ],
    tables: [
      {
        label: "Sampled pixels (H, S, V)",
        columns: ["Shape", "H", "S", "V"],
        rows: [
          ["Red rectangle", red.h, red.s, red.v],
          ["Green circle", green.h, green.s, green.v],
          ["Blue triangle", blue.h, blue.s, blue.v],
        ],
      },
    ],
    values: {
      redHue: red.h,
      redSaturation: red.s,
      greenHue: green.h,
      blueHue: blue.h,
      backgroundSaturation: at(300, 10).s,
    },
  };
}
