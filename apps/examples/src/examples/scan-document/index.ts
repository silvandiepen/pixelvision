import { defineExample } from "../define";
import { demo } from "./demo";
import type { ScanDocumentDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";
import liveCode from "../../composables/useDocumentScan/useDocumentScan.ts?raw";

export const scanDocumentExample = defineExample<ScanDocumentDemoOptions>({
  slug: "scan-document",
  title: "Scan a document with the camera",
  functions: ["findDocument", "createDocumentTracker", "extractDocument"],
  category: "pipeline",
  description:
    "Point the camera at a document. When it has been found and held still for a moment, it's captured and straightened. You can also upload a photo.",
  howItWorks: [
    "Every frame (about 10 a second), `findDocument` converts the frame to gray, scales it down, blurs it, and builds two masks: Canny edges thickened with `dilate`, and an Otsu threshold that separates a light document from a dark background by brightness. It traces the outer contours of both, simplifies each with Douglas–Peucker at a growing tolerance until it has four corners, and keeps the largest convex four-cornered shape.",
    "`createDocumentTracker` turns those per-frame results into a calm outline: each corner is the median of the last 5 detections, a detection that jumps away is ignored until it repeats 3 times, and up to 4 missed frames keep the outline. Once 8 detections agree with the outline to within 5% of the document's diagonal, the full-resolution frame is captured and `extractDocument` straightens it with a perspective warp, to the proportions you pick: auto (from the photo), an ID card (85.6 : 53.98) or A4 (210 : 297).",
    "Limits: the whole document must be in view, and it needs some contrast with the background. A white page on a white desk, glare across an edge or a corner outside the frame stops it being found.",
  ],
  howToTest:
    "Runs the scan on the desk sample and checks that the corners are within 4 pixels of the card the sample drew and that the ID card output has the right proportions. In the browsers, a test also feeds a generated scene to the page as a fake camera and as an upload, and checks the found corners and the auto-capture.",
  input: "image",
  sample: "desk",
  webcam: false,
  live: "document-scanner",
  controls: [
    {
      type: "select",
      key: "aspect",
      label: "Proportions",
      description: "The document's true width / height, or follow its edges in the photo.",
      options: [
        { label: "Auto", value: "auto" },
        { label: "ID card", value: "id-card" },
        { label: "A4", value: "a4" },
      ],
      default: "id-card",
    },
  ],
  code: `${code}\n// useDocumentScan.ts (the camera loop)\n${liveCode}`,
  demo,
  expectations: [
    { key: "found", label: "Finds the card", equals: true },
    { key: "cornerError", label: "Every corner within 4 px of the drawn one", max: 4 },
    { key: "width", label: "As wide as the card's longest edge", equals: 176 },
    { key: "height", label: "ID card proportions: 176 / (85.6 / 53.98)", equals: 111 },
  ],
});
