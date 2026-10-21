import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const equalizeHistogramExample = defineExample<Record<string, never>>({
  slug: "equalize-histogram",
  title: "equalizeHistogram",
  functions: ["equalizeHistogram"],
  category: "image",
  description:
    "Raises the contrast of a dull or badly lit image by spreading its gray levels evenly over 0–255.",
  howItWorks: [
    "It counts how many pixels have each gray level (the histogram), then accumulates the counts: the cumulative share of pixels at or below a level, times 255, becomes that level's new value. Crowded ranges of levels get stretched apart and empty ranges squeezed, so the output histogram is roughly flat.",
  ],
  howToTest:
    "Equalises the low-contrast sample, whose values only span about 90–160, and checks that the output reaches from (nearly) 0 to 255 and that its standard deviation, a measure of contrast, at least triples.",
  input: "image",
  sample: "low-contrast",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "inputMin", label: "Dull input: darkest about 90", min: 80, max: 100 },
    { key: "inputMax", label: "Dull input: brightest about 160", min: 150, max: 170 },
    { key: "outputMin", label: "Reaches black", max: 5 },
    { key: "outputMax", label: "Reaches white", equals: 255 },
    { key: "contrastGain", label: "At least three times the contrast", min: 3 },
  ],
});
