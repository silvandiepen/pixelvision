import { defineExample } from "../define";
import { PAGE_WORDS } from "../../samples/samples";
import { demo } from "./demo";
import type { CleanUpScanDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const cleanUpScanExample = defineExample<CleanUpScanDemoOptions>({
  slug: "clean-up-scan",
  title: "Clean up a scan",
  functions: ["adaptiveThreshold", "medianBlur", "morphology", "connectedComponents"],
  category: "pipeline",
  description:
    "Turns a phone photo of a page, with its shadows and uneven light, into crisp black text on white paper: smaller to store, and easier to read and to run text recognition on.",
  howItWorks: [
    "`medianBlur` with a 3 x 3 window first removes the sensor's grain without softening the strokes.",
    "`adaptiveThreshold` compares every pixel with its own neighbourhood, so ink is found in the shadow as well as in the light, where a single level would turn the shaded paper black.",
    "An opening (`morphology`) removes the specks left where the paper's grain happened to dip, and the mask is flipped to black on white.",
    "Run it after `findDocument` and `extractDocument` straighten the page.",
  ],
  howToTest:
    "Uses the page sample, lit from one corner so its shaded paper is darker than its brightest ink. Scored against the words it drew: over 90 % of the ink must be kept, under 1 % of the paper marked, no specks (regions under 6 pixels) left, and one region per drawn word.",
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
  ],
  code,
  demo,
  expectations: [
    { key: "inkFound", label: "Ink kept", min: 0.9 },
    { key: "paperMarked", label: "Paper clean", max: 0.01 },
    { key: "specksAfter", label: "No specks", equals: 0 },
    {
      key: "words",
      label: `One region per word (${PAGE_WORDS.length})`,
      equals: PAGE_WORDS.length,
    },
  ],
});
