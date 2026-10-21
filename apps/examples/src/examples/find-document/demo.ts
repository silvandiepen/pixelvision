import { findDocument } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { round } from "../../utils/format";
import { DESK_CARD_CORNERS } from "../../samples/samples";
import type { FindDocumentDemoOptions } from "./demo.model";

/**
 * Finds the document in the image and outlines it.
 *
 * @param input - The image, working size and smallest document area.
 * @returns The image with the found corners.
 */
export function demo({ image, options }: DemoInput<FindDocumentDemoOptions>): DemoOutput {
  const found = findDocument(image, { maxSize: options.maxSize, minArea: options.minArea });

  // How far each corner is from where the desk sample drew the card.
  const cornerError = found
    ? Math.max(
        ...found.corners.map((corner, i) =>
          Math.hypot(corner.x - DESK_CARD_CORNERS[i].x, corner.y - DESK_CARD_CORNERS[i].y),
        ),
      )
    : Infinity;

  return {
    images: [
      {
        label: found ? "Found document" : "No document found",
        image,
        overlay: found ? { polygons: [found.corners], points: found.corners } : undefined,
      },
    ],
    tables: found
      ? [
          {
            label: "Corners",
            columns: ["", "x", "y"],
            rows: found.corners.map((corner, i) => [
              ["top-left", "top-right", "bottom-right", "bottom-left"][i],
              round(corner.x, 1),
              round(corner.y, 1),
            ]),
          },
        ]
      : [],
    values: {
      found: found !== null,
      area: found ? round(found.area, 3) : 0,
      cornerError: round(cornerError, 2),
    },
  };
}
