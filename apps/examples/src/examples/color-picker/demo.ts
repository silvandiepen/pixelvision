import { connectedComponents, inRange, rgbToHsv } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { rectPolygon } from "../../utils/geometry";
import type { ColorPickerDemoOptions } from "./demo.model";

/** Hue ranges (0–179, degrees halved). Red wraps round 0, so it has two. */
const HUES: Record<ColorPickerDemoOptions["color"], [number, number][]> = {
  red: [
    [0, 8],
    [170, 179],
  ],
  yellow: [[20, 34]],
  green: [[35, 85]],
  blue: [[95, 125]],
  purple: [[126, 160]],
};

/**
 * Finds the largest patch of a chosen colour, at any brightness.
 *
 * @param input - The image, the colour and the least saturation.
 * @returns The mask and the patch's box.
 */
export function demo({ image, options }: DemoInput<ColorPickerDemoOptions>): DemoOutput {
  const hsv = rgbToHsv(image);
  const masks = HUES[options.color].map(([from, to]) =>
    inRange(hsv, [from, options.minSaturation, 50], [to, 255, 255]),
  );
  const mask = masks[0];
  for (const other of masks.slice(1)) {
    for (let i = 0; i < mask.data.length; i++) mask.data[i] |= other.data[i];
  }

  const [largest] = connectedComponents(mask).components.sort((a, b) => b.area - a.area);

  return {
    images: [
      { label: `${options.color[0].toUpperCase()}${options.color.slice(1)} pixels`, image: mask },
      {
        label: "Largest patch",
        image,
        overlay: { polygons: largest ? [rectPolygon(largest)] : [] },
      },
    ],
    values: {
      found: Boolean(largest),
      box: largest ? `${largest.x},${largest.y},${largest.width},${largest.height}` : "",
      area: largest?.area ?? 0,
    },
  };
}
