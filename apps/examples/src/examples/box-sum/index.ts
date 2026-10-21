import { defineExample } from "../define";
import { demo } from "./demo";
import type { BoxSumDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const boxSumExample = defineExample<BoxSumDemoOptions>({
  slug: "box-sum",
  title: "boxSum",
  functions: ["boxSum"],
  category: "image",
  description:
    "Adds up every pixel's neighbourhood in a square window, without averaging: `boxBlur` before the division. Use it for local counts (e.g. on a mask) and means you scale yourself.",
  howItWorks: [
    "The same sliding running sum as `boxBlur`, along rows and then columns, so any radius costs the same. The result is an `i32` matrix, so sums of up to millions of bright pixels don't wrap around.",
  ],
  howToTest:
    "Sums 3 x 3 windows of the gray shapes sample and checks that a window inside the flat red rectangle (gray 76) sums to exactly 9 x 76 = 684, as an `i32`.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "radius",
      label: "Radius",
      description: "Pixels on each side of the centre; the window is 2 x radius + 1 wide.",
      min: 0,
      max: 12,
      step: 1,
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "type", label: "32-bit integer sums", equals: "i32" },
    { key: "sumInRed", label: "9 x 76 inside the red rectangle", equals: 684 },
  ],
});
