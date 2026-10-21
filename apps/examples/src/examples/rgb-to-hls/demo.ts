import { createMatrix, rgbToHls } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";

/**
 * Converts the swatches to HLS and shows hue, lightness and saturation as
 * three gray images.
 *
 * @param input - The image.
 * @returns The three channels and the values of four swatches.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const hls = rgbToHls(image);
  const channel = (c: number): Matrix<"u8"> => {
    const out = createMatrix(hls.width, hls.height);
    for (let i = 0; i < out.data.length; i++) out.data[i] = hls.data[i * 3 + c];
    return out;
  };
  const at = (x: number, y: number) => {
    const i = (y * hls.width + x) * 3;
    return { h: hls.data[i], l: hls.data[i + 1], s: hls.data[i + 2] };
  };
  // Hue runs 0–179 (degrees halved); stretch it to 0–255 to show it as gray.
  const hue = channel(0);
  for (let i = 0; i < hue.data.length; i++) hue.data[i] = Math.round((hue.data[i] * 255) / 179);

  // Swatch centres: red, green, blue and gray in the middle row.
  const red = at(40, 120);
  const green = at(120, 120);
  const blue = at(200, 120);
  const gray = at(280, 120);
  return {
    images: [
      { label: "Hue (0–179, stretched)", image: hue },
      { label: "Lightness", image: channel(1) },
      { label: "Saturation", image: channel(2) },
    ],
    tables: [
      {
        label: "Middle row (H, L, S)",
        columns: ["Swatch", "H", "L", "S"],
        rows: [
          ["Red", red.h, red.l, red.s],
          ["Green", green.h, green.l, green.s],
          ["Blue", blue.h, blue.l, blue.s],
          ["Gray", gray.h, gray.l, gray.s],
        ],
      },
    ],
    values: {
      redHue: red.h,
      redLightness: red.l,
      redSaturation: red.s,
      greenHue: green.h,
      blueHue: blue.h,
      blueLightness: blue.l,
      blueSaturation: blue.s,
      grayLightness: gray.l,
      graySaturation: gray.s,
    },
  };
}
