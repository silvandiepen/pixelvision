import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const otsuLevelExample = defineExample<Record<string, never>>({
  slug: "otsu-level",
  title: "otsuLevel",
  functions: ["otsuLevel"],
  category: "image",
  description:
    "Finds the gray level that best separates an image into a dark and a bright part, so you don't have to pick a threshold by hand.",
  howItWorks: [
    "For every possible level it splits the histogram in two and computes the between-class variance: the product of the two classes' pixel shares times the squared difference of their means. The level where that is largest separates the two groups best (Otsu, 1979). It's one pass over the 256-bin histogram, so it costs almost nothing after the histogram.",
    "It assumes the image has two main groups of gray values. The tall bar in the chart marks the level.",
  ],
  howToTest:
    "Runs on the low-contrast sample, whose values only span about 94 to 158, and checks the level falls inside that narrow range, with the dark class mean below it and the bright class mean above it.",
  input: "image",
  sample: "low-contrast",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "level", label: "Inside the narrow gray range", min: 95, max: 160 },
    { key: "darkMean", label: "Dark class below the level", min: 90, max: 140 },
    { key: "brightMean", label: "Bright class above the level", min: 120, max: 160 },
  ],
});
