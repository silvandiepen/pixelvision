import { cloneMatrix, grayscale } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { countDifferences } from "../../utils/stats";

/**
 * Clones a gray image and paints a black box into the copy only.
 *
 * @param input - The image.
 * @returns The original and the changed copy.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const original = grayscale(image);
  const copy = cloneMatrix(original);

  // Paint a 64 x 48 black box into the copy.
  for (let y = 16; y < 64; y++) {
    copy.data.fill(0, y * copy.width + 16, y * copy.width + 80);
  }

  return {
    images: [
      { label: "Original", image: original },
      { label: "Copy, after painting", image: copy },
    ],
    values: {
      sameShape:
        copy.width === original.width &&
        copy.height === original.height &&
        copy.channels === original.channels &&
        copy.type === original.type,
      separateStorage: copy.data !== original.data,
      originalChanged: countDifferences(original, grayscale(image)),
      copyChanged: countDifferences(original, copy),
    },
  };
}
