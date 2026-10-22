import { defineExample } from "../define";
import { demo } from "./demo";
import type { PyrDownDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const pyrDownExample = defineExample<PyrDownDemoOptions>({
  slug: "pyr-down",
  title: "pyrDown",
  functions: ["pyrDown"],
  category: "image",
  description:
    "Halves the width and height by averaging each 2 x 2 block: one step down an image pyramid, used to find features and track motion at several scales.",
  howItWorks: [
    "Output pixel `(x, y)` is the rounded-down mean of input pixels `(2x, 2y)`, `(2x + 1, 2y)`, `(2x, 2y + 1)` and `(2x + 1, 2y + 1)`. An odd last row or column is dropped. Repeat it for more levels: each one has a quarter of the pixels.",
  ],
  howToTest:
    "Builds two levels from the 640 x 427 card photo and checks the result is 160 x 106 (427 halves to 213, then 106) with nearly the same average brightness.",
  input: "image",
  sample: "card-photo",
  controls: [
    {
      type: "range",
      key: "levels",
      label: "Levels",
      description: "How many times to halve the image.",
      min: 1,
      max: 4,
      step: 1,
      default: 2,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "width", label: "640 / 4", equals: 160 },
    { key: "height", label: "427 / 4, rounding down each time", equals: 106 },
    { key: "meanShift", label: "Brightness about the same (averages round down)", max: 2 },
  ],
});
