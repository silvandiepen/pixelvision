import { extractDocument, findDocument } from "pixelvision";
import type { FoundDocument, Matrix, RGBAImage } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { DESK_CARD_CORNERS } from "../../samples/samples";
import type { DocumentAspect, ScanDocumentDemoOptions } from "./demo.model";

/** Width / height of common documents; `undefined` follows the photo. */
export const ASPECT_RATIOS: Record<DocumentAspect, number | undefined> = {
  auto: undefined,
  "id-card": 85.6 / 53.98,
  a4: 210 / 297,
};

/**
 * Finds a document in one frame and straightens it. The camera page runs
 * `findDocument` on every frame and calls `extractDocument` once the
 * corners are stable (see `isStable`).
 *
 * @param frame - A photo or camera frame.
 * @param aspect - The document's proportions.
 * @returns The corners and the straightened document, or `null`.
 */
export function scan(
  frame: RGBAImage,
  aspect: DocumentAspect,
): { found: FoundDocument; document: Matrix<"u8"> } | null {
  const found = findDocument(frame);
  if (!found) return null;
  const document = extractDocument(frame, found.corners, { aspectRatio: ASPECT_RATIOS[aspect] });
  return { found, document };
}

/**
 * Scans the input image.
 *
 * @param input - The photo and the document's proportions.
 * @returns The photo with the found outline, and the straightened document.
 */
export function demo({ image, options }: DemoInput<ScanDocumentDemoOptions>): DemoOutput {
  const result = scan(image, options.aspect);
  if (!result) {
    return { images: [{ label: "No document found", image }], values: { found: false } };
  }
  const { found, document } = result;
  // Compared with the card the desk sample drew, for the tests.
  const cornerError = Math.max(
    ...found.corners.map((c, i) =>
      Math.hypot(c.x - DESK_CARD_CORNERS[i].x, c.y - DESK_CARD_CORNERS[i].y),
    ),
  );

  return {
    images: [
      { label: "Found", image, overlay: { polygons: [found.corners] } },
      { label: `Straightened, ${document.width} x ${document.height}`, image: document },
    ],
    values: {
      found: true,
      cornerError: round(cornerError, 2),
      width: document.width,
      height: document.height,
      corners: found.corners.map((c) => `${round(c.x, 1)},${round(c.y, 1)}`).join(" "),
    },
  };
}
