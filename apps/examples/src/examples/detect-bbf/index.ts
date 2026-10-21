import { defineExample } from "../define";
import { demo } from "./demo";
import type { BbfResources, DetectBbfDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const detectBbfExample = defineExample<DetectBbfDemoOptions, BbfResources>({
  slug: "detect-bbf",
  title: "detectBbf",
  functions: ["detectBbf"],
  category: "detection",
  description:
    "Finds faces with a BBF (Brightness Binary Feature) cascade: faster than Haar, a little less accurate. Try it with the webcam.",
  howItWorks: [
    "BBF comes from libccv. Instead of summing rectangles over an integral image as Haar does, each feature compares the brightness of a few single pixels, across three levels of an image pyramid. Those comparisons are cheap, so a window is accepted or rejected quickly.",
    "Every window size is tried, `interval` sizes per halving of the image, and overlapping hits are merged; `minNeighbors` sets how many raw hits a face needs. The face cascade is its own entry point, `pixelvision/cascades/bbf-face`, so it's only downloaded where it's used. libccv has since deprecated BBF in favour of neural detectors.",
  ],
  howToTest:
    "There are no face photos in the repository yet, and BBF doesn't fire on the schematic face that the Haar page uses (Haar finds it, BBF finds nothing), so the automated test checks the honest part: on the desk sample it reports no face, with no false positives. Faces are checked by hand with the webcam.",
  input: "image",
  sample: "desk",
  resources: async () => (await import("pixelvision/cascades/bbf-face")).bbfFace,
  controls: [
    {
      type: "range",
      key: "interval",
      label: "Sizes per octave",
      description:
        "Window sizes tried for every halving of the image. More finds more sizes, slower.",
      min: 1,
      max: 8,
      step: 1,
      default: 4,
    },
    {
      type: "range",
      key: "minNeighbors",
      label: "Grouping",
      description: "Raw detections a face needs. 0 shows them ungrouped.",
      min: 0,
      max: 6,
      step: 1,
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [{ key: "count", label: "No false faces on the desk", equals: 0 }],
});
