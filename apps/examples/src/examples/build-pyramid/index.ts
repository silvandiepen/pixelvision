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
    "Builds four levels from the 640 x 427 gray card photo and checks the sizes are exactly 640 x 427, 320 x 213, 160 x 106 and 80 x 53 (odd sizes round down), and that level 0 is the input itself.",
  input: "image",
  sample: "card-photo",
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
    { key: "sizes", label: "Each half the one before", equals: "640x427,320x213,160x106,80x53" },
    { key: "levelZeroIsInput", label: "Level 0 isn't copied", equals: true },
  ],
});
