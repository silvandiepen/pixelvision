import { defineExample } from "../define";
import { demo } from "./demo";
import type { GroupRectanglesDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const groupRectanglesExample = defineExample<GroupRectanglesDemoOptions>({
  slug: "group-rectangles",
  title: "groupRectangles",
  functions: ["groupRectangles"],
  category: "detection",
  description:
    "Merges overlapping detections into one box each, and drops boxes that too few detections agree on. `detectHaar` uses it; call it yourself when you run a detector with grouping off.",
  howItWorks: [
    "A detector fires several times around a real object, at slightly different positions and sizes, and only now and then on its own. Rectangles are put in the same group when each side is within a quarter of the width of the other's (OpenCV's similarity rule), and groups join transitively.",
    "Groups with fewer than `minNeighbors` members are dropped; each remaining group becomes the average of its rectangles, rounded as OpenCV does, with `neighbors` set to the group size. Small results inside larger, better-supported ones are removed too.",
  ],
  howToTest:
    "Groups three clusters of raw rectangles: four around (40, 40), three around (180, 100), and one on its own. With a minimum of 2 neighbours, exactly two groups must remain, with 4 and 3 members.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "rectangles",
      label: "Raw rectangles (x, y, w, h)",
      description: "One raw detection per row.",
      default: [
        [40, 40, 60, 60],
        [42, 38, 62, 62],
        [38, 42, 58, 58],
        [41, 41, 60, 61],
        [180, 100, 80, 80],
        [184, 104, 78, 78],
        [178, 98, 82, 82],
        [250, 20, 40, 40],
      ],
    },
    {
      type: "range",
      key: "minNeighbors",
      label: "Min neighbours",
      description: "Smallest group that's kept.",
      min: 1,
      max: 5,
      step: 1,
      default: 2,
    },
  ],
  code,
  demo,
  expectations: [{ key: "groupCount", label: "Two groups; the lone box is dropped", equals: 2 }],
});
