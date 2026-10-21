import { fromImageData, perspectiveTransform, warpPerspective } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { rectangleCorners } from "../../utils/geometry";
import type { StraightenDocumentDemoOptions } from "./demo.model";

/**
 * Cuts out the quadrilateral marked by four corners and straightens it into
 * a rectangle the shape of a business card (85.6 x 54 mm).
 *
 * @param input - The image, the four corners (top-left, top-right,
 *   bottom-right, bottom-left) and the output width.
 * @returns The straightened card.
 */
export function demo({ image, options }: DemoInput<StraightenDocumentDemoOptions>): DemoOutput {
  const photo = fromImageData(image);
  const width = options.width;
  const height = Math.round((width * 54) / 85.6);

  // warpPerspective maps output pixels to input pixels: output corners → photo corners.
  const toPhoto = perspectiveTransform(rectangleCorners(width, height), options.corners);
  const card = warpPerspective(photo, toPhoto, { width, height });

  // Colour at a point given as a share of the card's width and height.
  const at = (u: number, v: number) => {
    const i = (Math.floor(v * height) * width + Math.floor(u * width)) * 4;
    return Array.from(card.data.subarray(i, i + 3));
  };
  const [hr, hg, hb] = at(0.5, 0.12);
  const [wr, wg, wb] = at(0.5, 0.5);
  const [sr, sg, sb] = at(0.84, 0.77);

  return {
    images: [{ label: `Straightened, ${width} x ${height}`, image: card }],
    values: {
      width,
      height,
      headerIsBlue: hb > 180 && hr < 80 && hg < 160,
      middleIsWhite: Math.min(wr, wg, wb) > 200,
      stampIsRed: sr > 180 && sg < 80 && sb < 80,
    },
  };
}
