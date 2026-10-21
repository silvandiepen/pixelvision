import { defineExample } from "../define";
import { demo } from "./demo";
import type { BuildPyramidDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const buildPyramidExample = defineExample<BuildPyramidDemoOptions>({
  slug: "build-pyramid",
  title: "buildPyramid",
  functions: ["buildPyramid"],
  category: "tracking",
  description:
    "Builds an image pyramid: the image, then each level half the size of the one before. Trackers use the small levels to follow large movements and the large ones for precision.",
  howItWorks: [
    "Level 0 is the image itself (not copied). Each next level is `pyrDown` of the one before: every 2 x 2 block averaged into one pixel. Pass the pyramid to `trackPoints` instead of the image to reuse it: this frame's pyramid becomes the next frame's previous one.",
  ],
  howToTest:
    "Builds four levels from the 320 x 240 gray sample and checks the sizes are exactly 320 x 240, 160 x 120, 80 x 60 and 40 x 30, and that level 0 is the input itself.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "levels",
      label: "Levels",
      description: "Number of levels, including the full-size one.",
      min: 1,
      max: 6,
      step: 1,
      default: 4,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "levels", label: "Four levels", equals: 4 },
    { key: "sizes", label: "Each half the one before", equals: "320x240,160x120,80x60,40x30" },
    { key: "levelZeroIsInput", label: "Level 0 isn't copied", equals: true },
  ],
});
