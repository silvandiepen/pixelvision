import { defineExample } from "../define";
import { demo } from "./demo";
import type { HoughLinesPDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const houghLinesPExample = defineExample<HoughLinesPDemoOptions>({
  slug: "hough-lines-p",
  title: "houghLinesP",
  functions: ["houghLinesP", "canny"],
  category: "image",
  description:
    "Finds straight line segments, with their end points, in an edge image. Feed it the output of `canny`; use it for the sides of a document, a table or a road marking.",
  howItWorks: [
    "Edge pixels vote one at a time, in random order, for the lines through them. As soon as a line has `threshold` votes, the segment through the pixel that voted is traced along the edge in both directions, bridging gaps of up to `maxLineGap` pixels. Its pixels are removed and their votes subtracted, so they can't start a second, overlapping segment. Segments shorter than `minLineLength` are dropped.",
    "The order comes from a seeded generator, so the same image, options and seed always give the same segments. The default seed gives exactly the segments of OpenCV's `HoughLinesP`. Another seed can end a slanted segment a few pixels sooner, or split it, because a line found at 1° resolution drifts off a slanted edge.",
  ],
  howToTest:
    "Runs on the edges of the shapes sample, bridging gaps of up to 10 pixels where noise makes an edge step between two rows. The red rectangle covers x 24–119, y 24–95, and the blue triangle has corners (40, 212), (110, 118) and (180, 212). Each of the 4 rectangle sides and 3 triangle sides must be traced by one segment: both ends within 2 pixels of the side's line, covering at least 80% of its length.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "threshold",
      label: "Votes",
      description: "Votes a line needs before a segment is traced along it.",
      min: 10,
      max: 120,
      step: 1,
      default: 40,
    },
    {
      type: "range",
      key: "minLineLength",
      label: "Shortest",
      description: "Segments shorter than this many pixels are dropped.",
      min: 0,
      max: 100,
      step: 1,
      default: 30,
    },
    {
      type: "range",
      key: "maxLineGap",
      label: "Largest gap",
      description: "Missing edge pixels bridged within one segment.",
      min: 0,
      max: 20,
      step: 1,
      default: 10,
    },
    {
      type: "select",
      key: "seed",
      label: "Seed",
      description: "Seed of the random voting order.",
      options: [
        { label: "OpenCV's default", value: -1 },
        { label: "1", value: 1 },
        { label: "42", value: 42 },
      ],
      default: -1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "rectangleSidesFound", label: "All 4 rectangle sides traced", equals: 4 },
    { key: "triangleSidesFound", label: "All 3 triangle sides traced", equals: 3 },
  ],
});
