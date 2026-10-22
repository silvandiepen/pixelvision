import { defineExample } from "../define";
import { demo } from "./demo";
import type { DetectFastDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const detectFastExample = defineExample<DetectFastDemoOptions>({
  slug: "detect-fast",
  title: "detectFast",
  functions: ["detectFast"],
  category: "features",
  description:
    "Finds corners with the FAST detector: points where the image changes in two directions at once, which can be found again in the next frame. It's fast enough to run on every camera frame.",
  howItWorks: [
    "For each pixel it looks at the 16 pixels on a circle of radius 3 around it. The pixel is a corner when 9 of them in a row are all brighter, or all darker, than the centre by more than `threshold`. Most pixels are rejected after checking only a few circle pixels, which is what makes it fast.",
    "Each corner gets a score (how strongly it passes), and only corners that are the strongest in their 3 x 3 neighbourhood are kept. A lower threshold finds more, weaker corners; noise and texture start to count.",
  ],
  howToTest:
    "Runs on the card photo and checks that most corners land on the card (inside its labelled outline: its lettering, photo and edges) rather than on the wood grain, that the total stays in a sensible range, and that every corner has a positive score.",
  input: "image",
  sample: "card-photo",
  controls: [
    {
      type: "range",
      key: "threshold",
      label: "Threshold",
      description: "Minimum brightness difference between the centre and the circle, 0–255.",
      min: 1,
      max: 100,
      step: 1,
      default: 50,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "onCardShare", label: "Most corners on the card, not the wood", min: 0.8 },
    { key: "cornerCount", label: "Lettering and edges, not texture", min: 200, max: 700 },
    { key: "allScored", label: "Every corner has a score", equals: true },
  ],
});
