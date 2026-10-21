import { defineExample } from "../define";
import { demo } from "./demo";
import type { ClaheDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const claheExample = defineExample<ClaheDemoOptions>({
  slug: "clahe",
  title: "clahe",
  functions: ["clahe", "equalizeHistogram"],
  category: "image",
  description:
    "Contrast Limited Adaptive Histogram Equalization: brings out detail in shadows and highlights region by region, without blowing out the image or amplifying noise as a global equalisation does.",
  howItWorks: [
    "The image is cut into tiles and each tile's histogram is equalised on its own. Before that, every histogram bin is clipped at `clipLimit` times its fair share (tile pixels / 256) and the excess is spread over all bins, which caps how steep the mapping can get. Each pixel then blends the mappings of the four nearest tiles, so there are no seams.",
    "This follows OpenCV's `createCLAHE(clipLimit, tileGridSize).apply` exactly, including how it mirrors an image that doesn't divide into the grid. A clip limit of 2–4 is typical; 0 turns limiting off.",
  ],
  howToTest:
    "The low-contrast sample spans only 64 levels (94–158). Clipping caps a bin at clipLimit · area / 256, and redistribution adds at most area / 256 + 1 more, so the mapping rises at most (clipLimit + 1) · 255 / 256 + 255 / area levels per input level: 3.2 for clip 2 and 40 x 30 tiles. Noise in a flat patch can therefore grow at most 3.2 times, while the values spread over a wider range than before. A global equalisation has no such cap: it stretches the same 64 levels over 0–255 and amplifies the noise more than 3.2 times.",
  input: "image",
  sample: "low-contrast",
  controls: [
    {
      type: "range",
      key: "clipLimit",
      label: "Clip limit",
      description: "Steepest allowed mapping, in multiples of the average bin.",
      min: 0,
      max: 10,
      step: 0.5,
      default: 2,
    },
    {
      type: "range",
      key: "tiles",
      label: "Tiles",
      description: "Tiles across and down.",
      min: 1,
      max: 16,
      step: 1,
      default: 8,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "inputRange", label: "64 levels in", equals: 64 },
    { key: "outputRange", label: "A wider range out", min: 65 },
    { key: "noiseGain", label: "Noise grows at most 3.2 times", min: 1, max: 3.2 },
    { key: "globalNoiseGain", label: "Global equalisation amplifies it more", min: 3.2 },
  ],
});
