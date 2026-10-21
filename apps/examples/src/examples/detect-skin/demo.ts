import { detectSkin } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { countNonZero } from "../../utils/stats";

/**
 * Marks the pixels whose colour is in a common skin-tone range.
 *
 * @param input - The image.
 * @returns The mask: white for skin.
 */
export function demo({ image }: DemoInput<Record<string, never>>): DemoOutput {
  const mask = detectSkin(image);
  const skinPixels = countNonZero(mask);

  return {
    images: [{ label: "Skin mask", image: mask }],
    values: {
      skinPixels,
      skinShare: round(skinPixels / (mask.width * mask.height), 4),
    },
  };
}
