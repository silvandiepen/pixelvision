import { defineExample } from "../define";
import { demo } from "./demo";
import type { ConvexHullDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const convexHullExample = defineExample<ConvexHullDemoOptions>({
  slug: "convex-hull",
  title: "convexHull",
  functions: ["convexHull"],
  category: "shape",
  description:
    "Wraps a set of points in the smallest convex polygon, like a rubber band round pins. Comparing a shape with its hull tells a star from a pentagon, or an open hand from a fist.",
  howItWorks: [
    "Andrew's monotone chain: sort the points by x, then walk along them twice, once for the lower edge and once for the upper, dropping any point where the chain turns the wrong way. Points on a straight edge of the hull are left out.",
    "The hull comes back clockwise on screen (y points down), starting at the top-left-most point, so the same shape always gives the same list. Divide a shape's area by its hull's area for its solidity: 1 when it's convex, lower the deeper its dents.",
  ],
  howToTest:
    "Draws a five-pointed star whose inner corners are at 0.45 of the outer radius. Its hull must be the pentagon through the five tips, clockwise, starting at the top tip. The star fills 0.45 / cos 36° = 0.556 of that pentagon, which is what the solidity must be.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "tips",
      label: "Tips",
      description: "Points of the star.",
      min: 3,
      max: 10,
      step: 1,
      default: 5,
    },
    {
      type: "range",
      key: "inner",
      label: "Inner radius",
      description: "Inner corners' distance from the centre, as a share of the tips'.",
      min: 0.1,
      max: 1,
      step: 0.05,
      default: 0.45,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "corners", label: "The five tips", equals: 5 },
    { key: "clockwise", label: "Clockwise", equals: true },
    { key: "startsAtTop", label: "Starts at the top tip", equals: true },
    { key: "solidity", label: "0.45 / cos 36°", equals: 0.556 },
  ],
});
