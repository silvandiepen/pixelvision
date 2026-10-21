import { grayscale, keypointOrientation, warpAffine } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import type { KeypointOrientationDemoOptions } from "./demo.model";

/**
 * Measures the orientation at the image centre, then rotates the image and
 * measures again: the orientation turns with the image.
 *
 * @param input - The image and the rotation in degrees.
 * @returns Both images with an arrow along each orientation.
 */
export function demo({ image, options }: DemoInput<KeypointOrientationDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const centre = { x: Math.floor(gray.width / 2), y: Math.floor(gray.height / 2), score: 0 };

  // Rotate around the centre (the warp maps output to input, so undo the turn).
  const t = (options.rotation * Math.PI) / 180;
  const [cos, sin] = [Math.cos(t), Math.sin(t)];
  const rotated = warpAffine(gray, [
    cos,
    sin,
    centre.x - cos * centre.x - sin * centre.y,
    -sin,
    cos,
    centre.y + sin * centre.x - cos * centre.y,
  ]);

  const before = keypointOrientation(gray, centre);
  const after = keypointOrientation(rotated, centre);
  const arrow = (angle: number) => ({
    from: centre,
    to: { x: centre.x + 30 * Math.cos(angle), y: centre.y + 30 * Math.sin(angle) },
  });

  // Difference wrapped into (-180°, 180°].
  let turned = ((after - before) * 180) / Math.PI;
  turned = ((((turned + 180) % 360) + 360) % 360) - 180;

  return {
    images: [
      {
        label: `Original: ${round((before * 180) / Math.PI, 1)}°`,
        image: gray,
        overlay: { lines: [arrow(before)], points: [centre] },
      },
      {
        label: `Rotated: ${round((after * 180) / Math.PI, 1)}°`,
        image: rotated,
        overlay: { lines: [arrow(after)], points: [centre] },
      },
    ],
    values: { before: round(before, 4), after: round(after, 4), turnedDegrees: round(turned, 2) },
  };
}
