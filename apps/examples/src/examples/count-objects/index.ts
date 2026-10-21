import { defineExample } from "../define";
import { PEBBLES } from "../../samples/samples";
import { demo } from "./demo";
import type { CountObjectsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const countObjectsExample = defineExample<CountObjectsDemoOptions>({
  slug: "count-objects",
  title: "Count objects",
  functions: ["connectedComponents", "threshold", "otsuLevel"],
  category: "pipeline",
  description:
    "Counts the separate objects in a picture, such as pebbles, pills, cells or coins, and gives each one a box, a size and a number.",
  howItWorks: [
    "`threshold` at the level `otsuLevel` picks, inverted, turns the dark objects white and the table black.",
    "`connectedComponents` gives every separate white region its own label, with its box, pixel count and centre. Regions smaller than the minimum area are noise and aren't counted.",
    "Objects that touch merge into one region. Separate them first with an opening (see `morphology`) or with an `erode` before labelling.",
  ],
  howToTest: `The pebbles sample draws ${PEBBLES.length} pebbles that don't touch. Exactly that many objects must be counted, each centred within 1.5 pixels of a pebble the sample drew.`,
  input: "image",
  sample: "pebbles",
  controls: [
    {
      type: "range",
      key: "minArea",
      label: "Smallest object",
      description: "Regions with fewer pixels are ignored as noise.",
      min: 1,
      max: 400,
      step: 1,
      default: 30,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "count", label: `${PEBBLES.length} pebbles`, equals: PEBBLES.length },
    { key: "matched", label: "Each one on a drawn pebble", equals: PEBBLES.length },
  ],
});
