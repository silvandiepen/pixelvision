import { extractDocument } from "pixelvision";
import type { Quad } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import type { ExtractDocumentDemoOptions } from "./demo.model";

/** Width / height of common documents. */
const ASPECT_RATIOS = { auto: undefined, "id-card": 85.6 / 53.98, a4: 210 / 297 };

/**
 * Straightens the quadrilateral marked by four corners into an upright
 * rectangle.
 *
 * @param input - The image, the corners (top-left, top-right, bottom-right,
 *   bottom-left) and the document's proportions.
 * @returns The straightened document.
 */
export function demo({ image, options }: DemoInput<ExtractDocumentDemoOptions>): DemoOutput {
  const corners = options.corners as unknown as Quad;
  const flat = extractDocument(image, corners, { aspectRatio: ASPECT_RATIOS[options.aspect] });

  // Colour at a point given as a share of the document's width and height.
  const at = (u: number, v: number) => {
    const i =
      (Math.floor(v * flat.height) * flat.width + Math.floor(u * flat.width)) * flat.channels;
    return Array.from(flat.data.subarray(i, i + 3));
  };
  // Where the specimen card has its title and plain card.
  const [tr, tg, tb] = at(0.3, 0.2);
  const [cr, cg, cb] = at(0.6, 0.35);

  return {
    images: [{ label: `Straightened, ${flat.width} x ${flat.height}`, image: flat }],
    values: {
      width: flat.width,
      height: flat.height,
      channels: flat.channels,
      titleIsDark: Math.max(tr, tg, tb) < 100 && tb > tr,
      cardIsLight: Math.min(cr, cg, cb) > 180,
    },
  };
}
