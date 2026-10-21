import { defineExample } from "../define";
import { demo } from "./demo";
import type { FindDocumentDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const findDocumentExample = defineExample<FindDocumentDemoOptions>({
  slug: "find-document",
  title: "findDocument",
  functions: ["findDocument"],
  category: "detection",
  description:
    "Finds a document (a sheet of paper, an ID card, a receipt, a book page) in a photo or camera frame and returns its four corners.",
  howItWorks: [
    "The image is converted to gray and scaled down so its longer side is at most `maxSize`, then blurred. Two masks are built from it: Canny edges, thickened with `dilate` so small gaps in the outline close, and an Otsu threshold, which separates a light document from a dark background (or the reverse) by brightness alone.",
    "The outer contours of both masks are simplified with Douglas–Peucker at a growing tolerance until a shape has four corners. The largest convex four-cornered shape between `minArea` and `maxArea` of the image wins, and its corners are scaled back to full size, ordered top-left, top-right, bottom-right, bottom-left.",
    "It needs the whole document in view, with some contrast to the background. A white page on a white table, or a page with a corner cut off by the frame, isn't found.",
  ],
  howToTest:
    "Runs on the desk sample and compares the four corners with the card corners the sample was drawn with: each must be within 4 pixels.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "maxSize",
      label: "Working size",
      description:
        "Longer side of the scaled-down copy it searches. Smaller is faster, larger is more exact.",
      min: 100,
      max: 800,
      step: 10,
      default: 400,
    },
    {
      type: "range",
      key: "minArea",
      label: "Smallest document",
      description: "Smallest document, as a share of the image area.",
      min: 0.01,
      max: 0.5,
      step: 0.01,
      default: 0.02,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "found", label: "Finds the card", equals: true },
    { key: "cornerError", label: "Every corner within 4 px of the drawn one", max: 4 },
  ],
});
