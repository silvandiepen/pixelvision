import { defineExample } from "../define";
import { demo } from "./demo";
import type { DetectYapeDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const detectYapeExample = defineExample<DetectYapeDemoOptions>({
  slug: "detect-yape",
  title: "detectYape",
  functions: ["detectYape"],
  category: "features",
  description:
    "Finds keypoints with YAPE (Yet Another Point Extractor): corners and spots that stay detectable when the image rotates or changes scale a little.",
  howItWorks: [
    "Around each pixel it reads a circle of radius `radius`. A fast state machine walks the circle and rejects the pixel when the circle looks like an edge or a flat area: runs of pixels similar to the centre (within `tau`) are allowed only in limited arrangements.",
    "Survivors are scored by a Laplacian-like sum of the circle against the centre, and kept when they're the strongest within `radius`. Every pixel is tested, so corners are found on both sides of a shape, and each call starts from clean scores, so one frame never affects the next.",
  ],
  howToTest:
    "Runs on the blurred card photo and checks the number of keypoints and that most of them land on the card (inside its labelled outline) rather than on the wood grain.",
  input: "image",
  sample: "card-photo",
  controls: [
    {
      type: "range",
      key: "radius",
      label: "Radius",
      description: "Radius of the sampling circle, 3–7 pixels.",
      min: 3,
      max: 7,
      step: 1,
      default: 5,
    },
    {
      type: "range",
      key: "tau",
      label: "Tau",
      description:
        "How close to the centre's brightness a circle pixel must be to count as similar.",
      min: 1,
      max: 40,
      step: 1,
      default: 25,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "pointCount", label: "Keypoints, not texture", min: 60, max: 300 },
    { key: "onCardShare", label: "Most keypoints on the card, not the wood", min: 0.7 },
  ],
});
