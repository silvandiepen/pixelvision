import { defineExample } from "../define";
import { PHOTO_CARD_CORNERS } from "../../samples/samples";
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
    "Uses the card corners labelled by hand on the card photo and checks the straightened card: the dark SPECIMEN title at the top left, plain light card to the right of it, and the blue waves at the bottom right, where they are on the card.",
  input: "image",
  sample: "card-photo",
  controls: [
    {
      type: "points",
      key: "corners",
      label: "Corners",
      description:
        "The document's corners in the photo: top-left, top-right, bottom-right, bottom-left. Drag them on the input image.",
      default: PHOTO_CARD_CORNERS.map((point) => ({ ...point })),
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
    { key: "titleIsDark", label: "Dark title at the top left", equals: true },
    { key: "cardIsLight", label: "Plain light card beside it", equals: true },
    { key: "wavesAreBlue", label: "Blue waves at the bottom right", equals: true },
  ],
});
