import { defineExample } from "../define";
import { DESK_CARD_CORNERS } from "../../samples/samples";
import { demo } from "./demo";
import type { ExtractDocumentDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const extractDocumentExample = defineExample<ExtractDocumentDemoOptions>({
  slug: "extract-document",
  title: "extractDocument",
  functions: ["extractDocument"],
  category: "detection",
  description:
    "Straightens and crops a document from its four corners, for example the ones `findDocument` returns: the result is the document seen head-on.",
  howItWorks: [
    "It computes the perspective transform from an upright rectangle to the four corners and samples the photo through it with `warpPerspective`, so every output pixel is read from where it lands in the photo.",
    "Without options the size follows the document's longest edges in the photo, so a page seen at an angle comes out a little squashed. Pass `aspectRatio` to get its true proportions: 85.6 / 53.98 for an ID card, 210 / 297 for A4. The output keeps the input's channels; draw it with `toImageData`.",
  ],
  howToTest:
    "Straightens the card in the desk sample from its drawn corners with the ID card ratio, and checks the size, the blue header at the top and the white middle.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "points",
      key: "corners",
      label: "Corners",
      description: "Top-left, top-right, bottom-right, bottom-left. Drag them on the input image.",
      default: DESK_CARD_CORNERS.map((point) => ({ ...point })),
    },
    {
      type: "select",
      key: "aspect",
      label: "Proportions",
      description: "The document's true width / height, or follow its edges in the photo.",
      options: [
        { label: "Auto (from the photo)", value: "auto" },
        { label: "ID card (85.6 : 53.98)", value: "id-card" },
        { label: "A4 (210 : 297)", value: "a4" },
      ],
      default: "id-card",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "channels", label: "Keeps RGBA", equals: 4 },
    { key: "headerIsBlue", label: "Blue header on top", equals: true },
    { key: "middleIsWhite", label: "White in the middle", equals: true },
  ],
});
