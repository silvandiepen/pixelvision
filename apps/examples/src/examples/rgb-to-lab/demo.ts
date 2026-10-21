import { createMatrix, rgbToLab } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";

/**
 * Converts the swatches to L*a*b* and shows L, a and b as three gray
 * images.
 *
 * @param input - The image.
 * @returns The three channels and the values of four swatches.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const lab = rgbToLab(image);
  const channel = (c: number): Matrix<"u8"> => {
    const out = createMatrix(lab.width, lab.height);
    for (let i = 0; i < out.data.length; i++) out.data[i] = lab.data[i * 3 + c];
    return out;
  };
  const at = (x: number, y: number) => {
    const i = (y * lab.width + x) * 3;
    return { l: lab.data[i], a: lab.data[i + 1], b: lab.data[i + 2] };
  };

  const red = at(40, 120);
  const green = at(120, 120);
  const blue = at(200, 120);
  const gray = at(280, 120);
  return {
    images: [
      { label: "L (lightness)", image: channel(0) },
      { label: "a (green ← → red)", image: channel(1) },
      { label: "b (blue ← → yellow)", image: channel(2) },
    ],
    tables: [
      {
        label: "Middle row (L, a, b as stored)",
        columns: ["Swatch", "L", "a", "b"],
        rows: [
          ["Red", red.l, red.a, red.b],
          ["Green", green.l, green.a, green.b],
          ["Blue", blue.l, blue.a, blue.b],
          ["Gray", gray.l, gray.a, gray.b],
        ],
      },
    ],
    values: {
      redL: red.l,
      redA: red.a,
      redB: red.b,
      greenA: green.a,
      blueB: blue.b,
      grayL: gray.l,
      grayA: gray.a,
      grayB: gray.b,
    },
  };
}
