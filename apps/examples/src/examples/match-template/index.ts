import { defineExample } from "../define";
import { demo } from "./demo";
import type { MatchTemplateDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const matchTemplateExample = defineExample<MatchTemplateDemoOptions>({
  slug: "match-template",
  title: "matchTemplate",
  functions: ["matchTemplate", "minMaxLoc"],
  category: "detection",
  description:
    "Finds where a small image appears in a larger one: slides the template over every position and scores how well it fits. Good for a fixed logo, icon or marker at its original size.",
  howItWorks: [
    "For each position it compares the template with the window under it. `sqdiff` sums squared differences (0 is perfect). The normalised scores divide by the energies of template and window: `sqdiff-normed` and `ccorr-normed` lie in 0–1, and `ccoeff-normed` (the default) is the correlation coefficient, −1 to 1, which ignores changes of brightness and contrast. Find the best with `minMaxLoc`: the minimum for the `sqdiff` methods, the maximum otherwise.",
    "The correlation is summed exactly, so an identical window scores exactly 0 or 1. Scores agree with OpenCV's `matchTemplate` up to the rounding of OpenCV's single-precision Fourier transform. The cost is image area times template area, so keep templates small.",
  ],
  howToTest:
    "Cuts the 32 x 32 patch at (204, 16) from the gray shapes sample: the top of the green circle with noisy background. The window at (204, 16) is identical to the template, so it scores exactly 1 with `ccoeff-normed`, and the background noise makes every other window differ, so `minMaxLoc` must find the best score there.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "method",
      label: "Method",
      description: "How each position is scored.",
      options: [
        { label: "Correlation coefficient", value: "ccoeff-normed" },
        { label: "Normalised correlation", value: "ccorr-normed" },
        { label: "Normalised squared difference", value: "sqdiff-normed" },
        { label: "Squared difference", value: "sqdiff" },
      ],
      default: "ccoeff-normed",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "bestAt", label: "Found where it was cut", equals: "204,16" },
    { key: "bestScore", label: "A perfect score of 1", equals: 1 },
  ],
});
