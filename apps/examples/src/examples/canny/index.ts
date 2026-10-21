import { defineExample } from "../define";
import { demo } from "./demo";
import type { CannyDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const cannyExample = defineExample<CannyDemoOptions>({
  slug: "canny",
  title: "canny",
  functions: ["canny"],
  category: "image",
  description:
    "Finds edges with the Canny detector: thin, connected one-pixel lines where brightness changes sharply. Blur first on real photos (see the edge detection pipeline).",
  howItWorks: [
    "1. Gradients: Sobel `gx` and `gy` at every pixel; the edge strength is `|gx| + |gy|`.",
    "2. Non-maximum suppression: a pixel stays only if it's stronger than both neighbours along the gradient direction (one of four directions), which thins wide ramps to a one-pixel ridge.",
    "3. Hysteresis: pixels above `high` start an edge, and edges grow through connected neighbours above `low`. Weak pixels next to a strong edge survive; isolated weak ones (noise) don't. The thresholds are in units of `|gx| + |gy|`.",
  ],
  howToTest:
    "Runs on the shapes sample and checks that the edge count is in the range of the shapes' outlines, that the whole left side of the red rectangle is found, and that the output is purely 0 and 255.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "low",
      label: "Low threshold",
      description: "Strength below which a pixel is never an edge.",
      min: 0,
      max: 400,
      step: 1,
      default: 40,
    },
    {
      type: "range",
      key: "high",
      label: "High threshold",
      description: "Strength above which a pixel always starts an edge.",
      min: 0,
      max: 800,
      step: 1,
      default: 120,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "edgePixels", label: "About the length of the outlines", min: 1000, max: 2200 },
    { key: "leftSideRows", label: "Left side of the red rectangle found on every row", equals: 60 },
    { key: "onlyBlackAndWhite", label: "Binary output", equals: true },
  ],
});
