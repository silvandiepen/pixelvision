import {
  adaptiveThreshold,
  connectedComponents,
  grayscale,
  medianBlur,
  morphology,
} from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { PAGE_WORDS } from "../../samples/samples";
import type { CleanUpScanDemoOptions } from "./demo.model";

/**
 * Turns a photo of a page, shadows and all, into clean black text on white.
 *
 * @param input - The photo, the neighbourhood size and the offset.
 * @returns The clean page.
 */
export function demo({ image, options }: DemoInput<CleanUpScanDemoOptions>): DemoOutput {
  const gray = medianBlur(grayscale(image), 3); // drop sensor noise first
  const ink = adaptiveThreshold(gray, {
    blockSize: options.blockSize,
    offset: options.offset,
    invert: true, // ink white, for the clean-up
  });
  const cleaned = morphology(ink, "open", { radius: 1 }); // remove specks
  const page = cleaned.data.map((value) => 255 - value); // black ink on white paper
  const output = { ...cleaned, data: page };

  // Score against where the sample drew its words.
  const drawn = new Uint8Array(ink.width * ink.height);
  for (const [left, top, width, height] of PAGE_WORDS) {
    for (let y = top; y < top + height; y++)
      drawn.fill(1, y * ink.width + left, y * ink.width + left + width);
  }
  let found = 0;
  let wrong = 0;
  let total = 0;
  for (let i = 0; i < drawn.length; i++) {
    if (drawn[i]) total++;
    if (cleaned.data[i] && drawn[i]) found++;
    if (cleaned.data[i] && !drawn[i]) wrong++;
  }
  const specks = (mask: typeof ink) =>
    connectedComponents(mask).components.filter((c) => c.area < 6).length;

  return {
    images: [
      { label: "Photo", image },
      { label: "Clean page", image: output },
    ],
    values: {
      inkFound: round(found / total, 3),
      paperMarked: round(wrong / (drawn.length - total), 4),
      specksBefore: specks(ink),
      specksAfter: specks(cleaned),
      words: connectedComponents(cleaned).components.length,
    },
  };
}
