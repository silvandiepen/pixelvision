import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const arcLengthExample = defineExample<Record<string, never>>({
  slug: "arc-length",
  title: "arcLength",
  functions: ["arcLength"],
  category: "shape",
  description:
    "Measures the length of an outline or path. Its main use is scaling the tolerance of `approxPolygon` to the shape's size.",
  howItWorks: [
    "It adds up the straight-line distance between consecutive points, plus the edge from the last point back to the first when `closed` is true (the default).",
    "A traced outline steps from pixel to pixel, including diagonal steps of √2, so it comes out slightly longer than the smooth shape it follows.",
  ],
  howToTest:
    "Measures the shapes sample's triangle from its corners: two sides of √(70² + 94²) ≈ 117.2 and a base of 140 give 374.40 closed and 234.40 open. The traced outline must be within 10% of the closed length.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "exact", label: "2 x 117.2 + 140", equals: 374.4 },
    { key: "open", label: "Without the base", equals: 234.4 },
    { key: "tracedShare", label: "Traced outline close to it", min: 0.95, max: 1.1 },
  ],
});
