import { defineExample } from "../define";
import { demo } from "./demo";
import type { AdaptiveThresholdDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const adaptiveThresholdExample = defineExample<AdaptiveThresholdDemoOptions>({
  slug: "adaptive-threshold",
  title: "adaptiveThreshold",
  functions: ["adaptiveThreshold"],
  category: "image",
  description:
    "Turns a gray image into black and white with a separate level for every neighbourhood, so text stays readable on a page that's lit unevenly or in shadow.",
  howItWorks: [
    "For each pixel it averages the `blockSize` x `blockSize` square round it and compares the pixel with that average minus `offset`. Ink is darker than the paper right next to it even where the whole page is in shadow, so it's found everywhere; a single level (see `threshold`) either loses the ink in the light or swallows the paper in the dark.",
    '`invert: true` makes the darker pixels white, which is what you want for ink. The block should be larger than the strokes: a solid area wider than the block looks like its own surroundings. `method: "gaussian"` weights near pixels more. The plain mean matches OpenCV exactly.',
  ],
  howToTest:
    "The page sample draws lines of word-shaped bars and lights the page from the top left, so the shaded paper at the bottom right (about 50) is darker than the lit ink at the top left (about 85). Scoring against the bars it drew: the adaptive threshold must find over 90 % of the ink and mark under 2 % of the paper. A single Otsu level must mark far more of the paper, because the shaded paper falls below it.",
  input: "image",
  sample: "page",
  controls: [
    {
      type: "range",
      key: "blockSize",
      label: "Block size",
      description: "Odd neighbourhood size; larger than the strokes.",
      min: 3,
      max: 51,
      step: 2,
      default: 15,
    },
    {
      type: "range",
      key: "offset",
      label: "Offset",
      description: "How much darker than its surroundings a pixel must be.",
      min: 0,
      max: 40,
      step: 1,
      default: 10,
    },
    {
      type: "select",
      key: "method",
      label: "Method",
      description: "Plain mean, or a Gaussian-weighted one.",
      options: [
        { label: "Mean", value: "mean" },
        { label: "Gaussian", value: "gaussian" },
      ],
      default: "mean",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "adaptiveFound", label: "Finds the ink", min: 0.9 },
    { key: "adaptiveWrong", label: "Leaves the paper", max: 0.02 },
    { key: "globalWrong", label: "One level marks shaded paper", min: 0.1 },
  ],
});
