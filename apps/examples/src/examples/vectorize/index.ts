import { defineExample } from "../define";
import { demo } from "./demo";
import type { VectorizeDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const vectorizeExample = defineExample<VectorizeDemoOptions>({
  slug: "vectorize",
  title: "vectorize",
  functions: ["vectorize"],
  category: "shape",
  description:
    "Turns a raster image into vector shapes and writes them as a compact SVG: outlines with their holes, sharp corners where the drawing has them and smooth Bézier curves everywhere else. Good for logos, icons, signatures, line art and scanned drawings.",
  howItWorks: [
    "The image is first split into shape and background: dark on light, with Otsu's automatic level, an adaptive level for line art under uneven light, or a level you choose. Every boundary between the two is then traced along the pixel edges, outlines and holes alike, so letters keep their counters and a ring stays a ring. Holes run the opposite way round to their outline, so they stay empty under either fill rule.",
    "The traced outline is a staircase of pixel edges. Its corners are found where it turns more sharply than `corners` degrees and placed where the straight sides on either side meet. Everything between two corners is smoothed and fitted with cubic Bézier curves (Schneider's method) within `tolerance` pixels, or with straight lines only when `curves` is off.",
    "`snapLines` finds straight lines with the probabilistic Hough transform and draws the outline along each as one exact segment. It helps on drawings, diagrams and floor plans, where long edges should come out perfectly straight with crisp corners; on organic shapes it changes little. `colors` reduces the image to a few colours (median cut) and traces each as a layer, largest first, each layer reaching under the ones above it so no gaps show between them.",
  ],
  howToTest:
    "Traces the logo sheet with the default options. Every shape drawn there is one path (8), the counters and the ring's middle are holes (5: the ring, the O, the A and the two in the B), the square comes out as exactly its 4 corners, and the disc in the badge is all curves. The SVG, filled again at pixel centres, covers the same pixels as the traced black-and-white image to an IoU above 0.98.",
  input: "image",
  sample: "logo",
  controls: [
    {
      type: "select",
      key: "threshold",
      label: "Threshold",
      description:
        "How shape and background are told apart: automatically (Otsu), against each pixel's neighbourhood (adaptive), or at a fixed gray level.",
      options: [
        { label: "Automatic (Otsu)", value: "otsu" },
        { label: "Adaptive", value: "adaptive" },
        { label: "Level 96", value: 96 },
        { label: "Level 160", value: 160 },
      ],
      default: "otsu",
    },
    {
      type: "range",
      key: "tolerance",
      label: "Tolerance",
      description:
        "Largest distance, in pixels, between the traced outline and the curves that replace it. Larger gives fewer, smoother segments.",
      min: 0.1,
      max: 3,
      step: 0.1,
      default: 0.5,
    },
    {
      type: "range",
      key: "corners",
      label: "Corner angle",
      description:
        "Turns sharper than this many degrees stay sharp corners; gentler ones are rounded off.",
      min: 0,
      max: 180,
      step: 5,
      default: 60,
    },
    {
      type: "toggle",
      key: "curves",
      label: "Curves",
      description: "Fit Bézier curves; off gives straight polygons only.",
      default: true,
    },
    {
      type: "toggle",
      key: "snapLines",
      label: "Snap to lines",
      description:
        "Draw outline runs along straight lines (found with houghLinesP) as exact lines.",
      default: false,
    },
    {
      type: "select",
      key: "colors",
      label: "Colours",
      description: "Trace in colour, as stacked layers of this many colours.",
      options: [
        { label: "Black and white", value: 0 },
        { label: "2 colours", value: 2 },
        { label: "4 colours", value: 4 },
        { label: "6 colours", value: 6 },
        { label: "8 colours", value: 8 },
      ],
      default: 0,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "paths", label: "One path per shape drawn", equals: 8 },
    { key: "holes", label: "Ring 1, O 1, A 1, B 2", equals: 5 },
    { key: "squareCorners", label: "The square is exactly its 4 corners", equals: 4 },
    { key: "discAllCurves", label: "The disc is all curves", equals: true },
    { key: "iou", label: "The SVG covers the traced pixels", min: 0.98 },
  ],
});
