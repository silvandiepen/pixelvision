import { defineExample } from "../define";
import { demo } from "./demo";
import type { FindLinesDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const findLinesExample = defineExample<FindLinesDemoOptions>({
  slug: "find-lines",
  title: "Find lines",
  functions: ["grayscale", "gaussianBlur", "canny", "houghLines"],
  category: "pipeline",
  description:
    "Finds the straight lines in a photo, such as the sides of a document, a table edge or lane markings, and draws them.",
  howItWorks: [
    "The image goes through the edge detection pipeline (gray → blur → Canny), then every edge pixel votes in the Hough transform for all the lines through it. Lines that collect enough votes win, strongest first.",
    "Long straight edges collect many votes; curved or short ones (the mug, the text on the card) don't. Raise the vote threshold to keep only the longest lines.",
  ],
  howToTest:
    "Runs on the card photo and compares the lines with the card's four sides, computed from its corners labelled by hand: each side must match a detected line within 5 pixels and 3°.",
  input: "image",
  sample: "card-photo",
  controls: [
    {
      type: "range",
      key: "threshold",
      label: "Votes",
      description: "Minimum number of edge pixels on a line.",
      min: 10,
      max: 200,
      step: 1,
      default: 100,
    },
    {
      type: "range",
      key: "maxLines",
      label: "Max lines",
      description: "Return at most this many lines.",
      min: 1,
      max: 30,
      step: 1,
      default: 12,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "cardSidesFound", label: "All four card sides found", equals: 4 },
    { key: "lineCount", label: "A handful of lines", min: 4, max: 12 },
  ],
});
