import { createMatrix, grayscale, matchTemplate, minMaxLoc } from "pixelvision";
import type { TemplateMatchMethod } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { rectPolygon } from "../../utils/geometry";
import { normalizeToGray } from "../../utils/visualize";
import type { MatchTemplateDemoOptions } from "./demo.model";

/**
 * Cuts a 32 x 32 patch from the image and finds it again.
 *
 * @param input - The image and the scoring method.
 * @returns The patch, the score map and where the best score is.
 */
export function demo({ image, options }: DemoInput<MatchTemplateDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  // The top edge of the green circle, with the noisy background above it.
  const at = { x: 204, y: 16 };
  const size = 32;
  const template = createMatrix(size, size);
  for (let y = 0; y < size; y++) {
    const row = (at.y + y) * gray.width + at.x;
    template.data.set(gray.data.subarray(row, row + size), y * size);
  }

  const method = options.method as TemplateMatchMethod;
  const scores = matchTemplate(gray, template, { method });
  const { min, max, minLoc, maxLoc } = minMaxLoc(scores);
  // Squared differences are best when smallest; correlations when largest.
  const lowest = method.startsWith("sqdiff");
  const best = lowest ? minLoc : maxLoc;
  const found = { ...best, width: size, height: size };

  return {
    images: [
      { label: "Template", image: template },
      { label: "Found", image: gray, overlay: { polygons: [rectPolygon(found)] } },
      {
        label: `Scores (${lowest ? "dark" : "bright"} is better)`,
        image: normalizeToGray(scores.data, scores.width, scores.height),
        overlay: { points: [best] },
      },
    ],
    values: {
      bestAt: `${best.x},${best.y}`,
      bestScore: lowest ? min : max,
    },
  };
}
