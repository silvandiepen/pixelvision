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
    "The image is converted to gray, scaled down so its longer side is at most `maxSize`, and blurred. Several masks are built from it, because no single one works on every photo: Canny edges, thickened with `dilate` so small gaps close; the bright and the dark region from an Otsu threshold; the same split again inside the bright (or dark) region, which parts a white page from a light table or from glare; and the smooth region inside faint edges, found with edge thresholds that follow the photo's own contrast, for a page that barely stands out.",
    "The outer contours of every mask are simplified with Douglas–Peucker until they have four corners. Each convex four-cornered shape between `minArea` and `maxArea` is scored by its area, by how much of its outline lies on edges in the photo, and down for a corner on the image border (a page merged with glare or a neighbouring object usually has one). The best few are refined: each side moves onto the strongest edge nearby, a line is fitted through it, and the corners are where the lines meet, so a card's rounded corners come out where its straight edges meet. A side that isn't straight, such as a torn receipt edge, stays as it was.",
    "On seven labelled photos of whole documents (in `packages/parity`), it finds six, with the worst corner 3 to 15 px off on a 1024 px photo, including a white page on a pale table, a page on a busy desk and one shot at a steep angle; jscanify (Canny, Otsu, the largest contour) finds one. Neither finds a flyer held up against a bright window. It needs the whole document in view; with `reportCut`, a document running off the edge is reported as cut.",
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
