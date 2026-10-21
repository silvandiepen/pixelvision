import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const detectSkinExample = defineExample<Record<string, never>>({
  slug: "detect-skin",
  title: "detectSkin",
  functions: ["detectSkin"],
  category: "detection",
  description:
    "Marks pixels whose colour falls in a common skin-tone range. It's a rough, lighting-sensitive filter: use it to find candidate regions (e.g. hands in a webcam feed), not as a detector on its own.",
  howItWorks: [
    "A pixel counts as skin when R > 95, G > 40 and B > 20, red is the largest channel, red exceeds green by more than 15, and the largest channel exceeds the smallest by more than 15 (the RGB rule of Peer et al.). The output is a mask: 255 for skin, 0 otherwise.",
  ],
  howToTest:
    "Runs on the colour swatches sample, whose top row holds four 80 x 80 skin tones and whose other eight swatches (including a saturated yellow and red that nearly qualify) don't: exactly 4 x 6,400 = 25,600 pixels must be marked.",
  input: "image",
  sample: "palette",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "skinPixels", label: "Exactly the four skin swatches", equals: 25600 },
    { key: "skinShare", label: "A third of the image", equals: 0.3333 },
  ],
});
