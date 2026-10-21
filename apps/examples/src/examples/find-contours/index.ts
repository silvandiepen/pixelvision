import { defineExample } from "../define";
import { demo } from "./demo";
import type { FindContoursDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const findContoursExample = defineExample<FindContoursDemoOptions>({
  slug: "find-contours",
  title: "findContours",
  functions: ["findContours"],
  category: "shape",
  description:
    "Finds the outline of every separate white region in a black-and-white image, as a list of points. From there you can measure shapes, simplify them to polygons, or find a document.",
  howItWorks: [
    "It scans the image row by row. At the top-left pixel of each region not seen before, it walks around the region's edge clockwise with Moore-neighbour tracing, checking the 8 neighbours in turn, until it gets back to the start. The region is then marked so it's traced only once.",
    "Only outer outlines are returned (OpenCV's `RETR_EXTERNAL`): holes are ignored. Regions smaller than `minPixels` are skipped, which removes specks. Make the input with `threshold`, or with `canny` plus `dilate` for outlines of edges.",
  ],
  howToTest:
    "Thresholds the shapes sample so its four dark shapes are white, and checks that exactly four outlines are found and that the first starts at the red rectangle's top-left pixel, (24, 24).",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "minPixels",
      label: "Smallest region",
      description: "Ignore regions with fewer pixels than this.",
      min: 1,
      max: 2000,
      step: 1,
      default: 50,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "count", label: "Four shapes", equals: 4 },
    { key: "firstStart", label: "Starts at the rectangle's top-left pixel", equals: "24,24" },
  ],
});
