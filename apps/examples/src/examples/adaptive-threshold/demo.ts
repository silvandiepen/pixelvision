import { adaptiveThreshold, grayscale, otsuLevel, threshold } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { PAGE_WORDS } from "../../samples/samples";
import type { AdaptiveThresholdDemoOptions } from "./demo.model";

/**
 * Picks out the ink of an unevenly lit page, once with a single level for
 * the whole page and once with a level per neighbourhood.
 *
 * @param input - The page, the neighbourhood size, the offset and the method.
 * @returns Both results, and how well each found the ink.
 */
export function demo({ image, options }: DemoInput<AdaptiveThresholdDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  // Ink becomes white in both.
  const global = threshold(gray, { level: otsuLevel(gray), invert: true });
  const local = adaptiveThreshold(gray, {
    blockSize: options.blockSize,
    offset: options.offset,
    method: options.method,
    invert: true,
  });

  // Score against where the sample drew its words.
  const ink = new Uint8Array(gray.width * gray.height);
  for (const [left, top, width, height] of PAGE_WORDS) {
    for (let y = top; y < top + height; y++)
      ink.fill(1, y * gray.width + left, y * gray.width + left + width);
  }
  const score = (mask: Matrix<"u8">) => {
    let found = 0;
    let wrong = 0;
    let inkPixels = 0;
    for (let i = 0; i < ink.length; i++) {
      if (ink[i]) inkPixels++;
      if (mask.data[i] && ink[i]) found++;
      if (mask.data[i] && !ink[i]) wrong++;
    }
    return { found: found / inkPixels, wrong: wrong / (ink.length - inkPixels) };
  };
  const g = score(global);
  const l = score(local);

  return {
    images: [
      { label: "One level for the page (Otsu)", image: global },
      { label: `Adaptive, ${options.blockSize} x ${options.blockSize}`, image: local },
    ],
    tables: [
      {
        label: "Against the drawn words",
        columns: ["", "ink found", "paper marked as ink"],
        rows: [
          ["One level", `${round(g.found * 100, 1)} %`, `${round(g.wrong * 100, 1)} %`],
          ["Adaptive", `${round(l.found * 100, 1)} %`, `${round(l.wrong * 100, 1)} %`],
        ],
      },
    ],
    values: {
      adaptiveFound: round(l.found, 3),
      adaptiveWrong: round(l.wrong, 3),
      globalWrong: round(g.wrong, 3),
    },
  };
}
