import { fromImageData, grayscale, inRange, minMaxLoc } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";

/**
 * Finds the darkest and brightest gray pixels, over the whole image and
 * inside the green circle only.
 *
 * @param input - The image.
 * @returns Both extremes and where they are.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const gray = grayscale(image);
  const whole = minMaxLoc(gray);
  // Only the pixels painted exactly the circle's green.
  const circle = inRange(fromImageData(image), [34, 197, 94, 0], [34, 197, 94, 255]);
  const inside = minMaxLoc(gray, circle);

  return {
    images: [
      {
        label: "Darkest and brightest",
        image: gray,
        overlay: { points: [whole.minLoc, whole.maxLoc] },
      },
      { label: "Mask: the green circle", image: circle },
    ],
    tables: [
      {
        label: "Extremes",
        columns: ["Where", "Min", "at", "Max", "at"],
        rows: [
          [
            "Whole image",
            whole.min,
            `${whole.minLoc.x}, ${whole.minLoc.y}`,
            whole.max,
            `${whole.maxLoc.x}, ${whole.maxLoc.y}`,
          ],
          [
            "Circle only",
            inside.min,
            `${inside.minLoc.x}, ${inside.minLoc.y}`,
            inside.max,
            `${inside.maxLoc.x}, ${inside.maxLoc.y}`,
          ],
        ],
      },
    ],
    values: {
      min: whole.min,
      minFromCorner: Math.round(Math.hypot(whole.minLoc.x - 232, whole.minLoc.y - 128)),
      max: whole.max,
      maxRow: whole.maxLoc.y,
      circleMin: inside.min,
      circleMax: inside.max,
    },
  };
}
