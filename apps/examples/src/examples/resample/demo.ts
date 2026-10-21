import { fromImageData, resample } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { mean } from "../../utils/stats";
import type { ResampleDemoOptions } from "./demo.model";

/**
 * Resizes the colour image by a scale factor.
 *
 * @param input - The image and the scale.
 * @returns The resized image.
 */
export function demo({ image, options }: DemoInput<ResampleDemoOptions>): DemoOutput {
  const rgba = fromImageData(image);
  const width = Math.max(1, Math.round(rgba.width * options.scale));
  const height = Math.max(1, Math.round(rgba.height * options.scale));
  const resized = resample(rgba, { width, height });

  return {
    images: [{ label: `${width} x ${height}`, image: resized }],
    values: {
      width: resized.width,
      height: resized.height,
      channels: resized.channels,
      meanShift: round(Math.abs(mean(resized) - mean(rgba)), 3),
    },
  };
}
