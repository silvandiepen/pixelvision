import { flip, fromImageData } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countDifferences } from "../../utils/stats";
import type { FlipDemoOptions } from "./demo.model";

/**
 * Mirrors the image, then mirrors it back.
 *
 * @param input - The image and the direction.
 * @returns The mirrored image.
 */
export function demo({ image, options }: DemoInput<FlipDemoOptions>): DemoOutput {
  const rgba = fromImageData(image);
  const mirrored = flip(rgba, options.direction);
  const back = flip(mirrored, options.direction);

  // Pixel (10, 20) should now sit at the mirrored position.
  const { width, height } = rgba;
  const [x, y] = options.direction === "horizontal" ? [width - 1 - 10, 20] : [10, height - 1 - 20];
  const source = (20 * width + 10) * 4;
  const target = (y * width + x) * 4;
  let moved = true;
  for (let c = 0; c < 4; c++) moved &&= mirrored.data[target + c] === rgba.data[source + c];

  return {
    images: [{ label: `Flipped ${options.direction}ly`, image: mirrored }],
    values: { pixelMoved: moved, twiceIsOriginal: countDifferences(back, rgba) === 0 },
  };
}
