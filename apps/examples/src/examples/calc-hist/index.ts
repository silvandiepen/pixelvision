import { defineExample } from "../define";
import { demo } from "./demo";
import type { CalcHistDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const calcHistExample = defineExample<CalcHistDemoOptions>({
  slug: "calc-hist",
  title: "calcHist",
  functions: ["calcHist"],
  category: "image",
  description:
    "Counts how many pixels fall into each value range, one histogram per channel, optionally only under a mask. The basis for comparing images, finding dominant colours and choosing thresholds.",
  howItWorks: [
    "The range (0–256 by default, the upper end left out) is cut into equal bins and every value is counted in its bin: with 32 bins, bin k holds values 8k to 8k + 7. The result is an `i32` matrix with one row per channel. With a mask, only pixels where the mask is non-zero count.",
    "Counts are identical to OpenCV's `calcHist` with uniform bins.",
  ],
  howToTest:
    "The palette sample is 12 flat swatches of 80 x 80 = 6,400 pixels. Every channel counts all 320 · 240 = 76,800 pixels. With 32 bins, the top red bin (248–255) holds the two swatches with red 255 and 250: 12,800 pixels. The second blue bin (8–15) holds only the yellow swatch (blue 10): 6,400. Under a mask of the top row, the red histogram counts the four skin swatches: 25,600.",
  input: "image",
  sample: "palette",
  controls: [
    {
      type: "select",
      key: "bins",
      label: "Bins",
      description: "Number of equal slices of 0–255.",
      options: [
        { label: "16", value: 16 },
        { label: "32", value: 32 },
        { label: "64", value: 64 },
        { label: "256", value: 256 },
      ],
      default: 32,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "redTotal", label: "Every pixel counted once", equals: 76800 },
    { key: "redTopBin", label: "Red 255 and 250: two swatches", equals: 12800 },
    { key: "blueSecondBin", label: "Blue 10: one swatch", equals: 6400 },
    { key: "topRowRedTotal", label: "Mask: four swatches", equals: 25600 },
  ],
});
