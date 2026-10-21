import { defineExample } from "../define";
import { demo } from "./demo";
import type { ApproxPolygonDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const approxPolygonExample = defineExample<ApproxPolygonDemoOptions>({
  slug: "approx-polygon",
  title: "approxPolygon",
  functions: ["approxPolygon"],
  category: "shape",
  description:
    "Simplifies a traced outline of hundreds of points to a polygon with a few corners, so you can tell a rectangle from a triangle or find the four corners of a page.",
  howItWorks: [
    "Douglas–Peucker, as OpenCV's `approxPolyDP`: it starts from two far-apart points of the outline, finds the outline point furthest from the straight line between them, and keeps it as a corner when it's more than `epsilon` away. It repeats on each half until every part of the outline is within `epsilon` of the polygon.",
    "Pick `epsilon` relative to the outline's size: around 2% of `arcLength` turns a sheet of paper into its 4 corners. Too small keeps the wobble; too large cuts corners off.",
  ],
  howToTest:
    "Simplifies the four outlines of the shapes sample with a tolerance of 2% of their length and checks the corner counts (4 for the rectangle, 8 for the circle, 3 for the triangle, 4 for the square), and that the triangle's corners are within 3 pixels of where they were drawn.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "tolerance",
      label: "Tolerance",
      description:
        "Largest distance between outline and polygon, as a share of the outline's length.",
      min: 0.001,
      max: 0.1,
      step: 0.001,
      default: 0.02,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "corners", label: "Rectangle 4, circle 8, triangle 3, square 4", equals: "4,8,3,4" },
    { key: "triangleCornerError", label: "Triangle corners where they were drawn", max: 3 },
  ],
});
