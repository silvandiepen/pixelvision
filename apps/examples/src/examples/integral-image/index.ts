import { defineExample } from "../define";
import { demo } from "./demo";
import type { IntegralImageDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const integralImageExample = defineExample<IntegralImageDemoOptions>({
  slug: "integral-image",
  title: "integralImage",
  functions: ["integralImage"],
  category: "image",
  description:
    "Builds a summed-area table: after one pass over the image, the sum of any rectangle takes four lookups. Face detectors and local thresholds use it to evaluate thousands of boxes quickly.",
  howItWorks: [
    "Entry `S(x, y)` holds the sum of every pixel above and left of `(x, y)`; the table is one larger than the image in both directions, with a zero first row and column. Each entry is the pixel plus the entry to its left and the one above, minus the one diagonally up-left (counted twice).",
    "A rectangle from `(x0, y0)` up to (not including) `(x1, y1)` then sums to `S(x1, y1) - S(x0, y1) - S(x1, y0) + S(x0, y0)`. Pass `squares: true` for sums of squares (local variance) or `tilted: true` for 45° rectangles. Tables are `f64`, so they don't overflow.",
  ],
  howToTest:
    "Sums the red rectangle of the shapes sample (96 x 72 pixels of gray 76) with four lookups and checks it is exactly 525,312 and equals adding every pixel one by one; the table is 321 entries wide.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "x",
      label: "Left",
      description: "Left edge of the rectangle to sum.",
      min: 0,
      max: 319,
      step: 1,
      default: 24,
    },
    {
      type: "range",
      key: "y",
      label: "Top",
      description: "Top edge of the rectangle to sum.",
      min: 0,
      max: 239,
      step: 1,
      default: 24,
    },
    {
      type: "range",
      key: "width",
      label: "Width",
      description: "Width of the rectangle.",
      min: 1,
      max: 320,
      step: 1,
      default: 96,
    },
    {
      type: "range",
      key: "height",
      label: "Height",
      description: "Height of the rectangle.",
      min: 1,
      max: 240,
      step: 1,
      default: 72,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "tableWidth", label: "One wider than the image", equals: 321 },
    { key: "rectangleSum", label: "96 x 72 x 76", equals: 525312 },
    { key: "matchesDirectSum", label: "Same as adding pixel by pixel", equals: true },
  ],
});
