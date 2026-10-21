import { defineExample } from "../define";
import { DESK_CARD_CORNERS } from "../../samples/samples";
import { demo } from "./demo";
import type { StraightenDocumentDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const straightenDocumentExample = defineExample<StraightenDocumentDemoOptions>({
  slug: "straighten-document",
  title: "Straighten a document",
  functions: ["perspectiveTransform", "warpPerspective", "fromImageData"],
  category: "pipeline",
  description:
    "Turns a photo of a card, page or screen taken at an angle into a flat, head-on view. Drag the four corners onto the document's corners.",
  howItWorks: [
    "Pick the four corners of the document in the photo, in order: top-left, top-right, bottom-right, bottom-left. `perspectiveTransform` computes the homography from the corners of the output rectangle to those four points.",
    "`warpPerspective` then fills every output pixel by looking up where it lands in the photo, with bilinear interpolation. Because the warp maps output → input, the transform goes from the rectangle to the photo, not the other way round. The output size sets the aspect ratio; here it's a business card's 85.6 : 54.",
  ],
  howToTest:
    "Uses the exact card corners the desk sample was drawn with and checks the straightened card: a blue header at the top, white in the middle, and the red stamp at the bottom right, where the generator put them.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "points",
      key: "corners",
      label: "Corners",
      description:
        "The document's corners in the photo: top-left, top-right, bottom-right, bottom-left. Drag them on the input image.",
      default: DESK_CARD_CORNERS.map((point) => ({ ...point })),
    },
    {
      type: "range",
      key: "width",
      label: "Output width",
      description: "Width of the straightened image; the height follows the card's aspect ratio.",
      min: 100,
      max: 640,
      step: 1,
      default: 300,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "height", label: "Card aspect ratio: 300 x 189", equals: 189 },
    { key: "headerIsBlue", label: "Blue header on top", equals: true },
    { key: "middleIsWhite", label: "White card in the middle", equals: true },
    { key: "stampIsRed", label: "Red stamp bottom right", equals: true },
  ],
});
