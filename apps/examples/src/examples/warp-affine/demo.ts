import { fromImageData, warpAffine } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { WarpAffineDemoOptions } from "./demo.model";

/**
 * Rotates and scales the image around its centre.
 *
 * @param input - The image, angle in degrees and scale.
 * @returns The warped image.
 */
export function demo({ image, options }: DemoInput<WarpAffineDemoOptions>): DemoOutput {
  const rgba = fromImageData(image);
  // A whole pixel as the centre, so the centre pixel maps exactly onto itself.
  const cx = Math.floor(rgba.width / 2);
  const cy = Math.floor(rgba.height / 2);
  const radians = (options.angle * Math.PI) / 180;

  // Output → input: undo the rotation and scale around the centre.
  const cos = Math.cos(radians) / options.scale;
  const sin = Math.sin(radians) / options.scale;
  const transform = [cos, sin, cx - cos * cx - sin * cy, -sin, cos, cy + sin * cx - cos * cy];
  const warped = warpAffine(rgba, transform, { fill: 0 });

  const centre = (cy * rgba.width + cx) * 4;
  let centreDifference = 0;
  for (let c = 0; c < 4; c++) {
    centreDifference = Math.max(
      centreDifference,
      Math.abs(warped.data[centre + c] - rgba.data[centre + c]),
    );
  }

  return {
    images: [{ label: `Rotated ${options.angle}°, scaled ${options.scale}x`, image: warped }],
    values: {
      centreDifference,
      topLeftFilled: warped.data[3] === 0,
      width: warped.width,
    },
  };
}
