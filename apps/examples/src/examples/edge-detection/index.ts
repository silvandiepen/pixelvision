import { defineExample } from "../define";
import { demo } from "./demo";
import type { EdgeDetectionDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const edgeDetectionExample = defineExample<EdgeDetectionDemoOptions>({
  slug: "edge-detection",
  title: "Edge detection",
  functions: ["grayscale", "gaussianBlur", "canny"],
  category: "pipeline",
  description:
    "The classic edge detection pipeline on a photo: convert to gray, blur away the noise, then find edges with Canny.",
  howItWorks: [
    "Canny works on one channel, so the colour image is converted to gray first. Photos have sensor noise and texture (here, the wood grain) that Canny would happily report as edges, so a Gaussian blur smooths it out; a larger kernel removes more texture but also rounds corners and drops faint edges.",
    "Canny then thins the gradients to one-pixel ridges and keeps strong edges plus the weak pixels connected to them. Lower thresholds find more, including texture; higher ones keep only the clearest outlines.",
  ],
  howToTest:
    "Runs the pipeline on the desk sample and checks that the middle of each of the card's four sides (whose positions the sample generator knows) has an edge pixel within 2 pixels, and that the total edge count stays in range, i.e. the wood grain is suppressed.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "select",
      key: "kernelSize",
      label: "Blur kernel",
      description: "Gaussian kernel size; bigger removes more texture.",
      options: [3, 5, 7, 9].map((value) => ({ label: `${value}`, value })),
      default: 5,
    },
    {
      type: "range",
      key: "low",
      label: "Low threshold",
      description: "Weak edges are kept only when connected to strong ones.",
      min: 0,
      max: 300,
      step: 1,
      default: 40,
    },
    {
      type: "range",
      key: "high",
      label: "High threshold",
      description: "Edges stronger than this always start an edge.",
      min: 0,
      max: 600,
      step: 1,
      default: 100,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "cardSidesFound", label: "All four card sides found", equals: 4 },
    { key: "edgePixels", label: "Outlines, not wood grain", min: 1200, max: 4000 },
  ],
});
