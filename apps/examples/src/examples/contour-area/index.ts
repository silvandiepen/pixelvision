import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const contourAreaExample = defineExample<Record<string, never>>({
  slug: "contour-area",
  title: "contourArea",
  functions: ["contourArea"],
  category: "shape",
  description:
    "Computes the area inside a polygon or traced outline, e.g. to ignore small shapes or to pick the largest one.",
  howItWorks: [
    "The shoelace formula: walking round the polygon, it adds up `x[i] · y[i+1] − x[i+1] · y[i]` for every edge and halves the total. The sign tells the direction: positive for clockwise in image coordinates (y points down), which is how `findContours` traces.",
    "A traced outline runs through the centres of the region's edge pixels, so its area is a little smaller than the drawn shape's: about half a pixel all round.",
  ],
  howToTest:
    "Computes the area of the shapes sample's triangle from its corners, (40, 212), (110, 118), (180, 212): half of 140 x 94 is exactly 6,580. The traced outline's area must be within a few per cent below that.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "exact", label: "½ x 140 x 94", equals: 6580 },
    { key: "tracedShare", label: "Traced outline close to it", min: 0.95, max: 1 },
  ],
});
