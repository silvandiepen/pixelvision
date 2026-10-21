import { defineExample } from "../define";
import { demo } from "./demo";
import type { IsConvexDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const isConvexExample = defineExample<IsConvexDemoOptions>({
  slug: "is-convex",
  title: "isConvex",
  functions: ["isConvex"],
  category: "shape",
  description:
    "Tells whether a polygon is convex: no dents, every corner bending the same way. A document found in a photo must be a convex quadrilateral; a crossed or dented one is a false find.",
  howItWorks: [
    "For each corner it takes the cross product of the edge arriving and the edge leaving, which is positive for a turn one way and negative for the other. The polygon is convex when all the turns have the same sign. A bow-tie (crossed edges) or an arrowhead fails.",
  ],
  howToTest:
    "Checks the default arrowhead, whose last corner points inwards, is not convex, and that the triangle left after removing that corner is.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "polygon",
      label: "Corners (x, y)",
      description: "The polygon's corners in order.",
      default: [
        [40, 40],
        [280, 120],
        [40, 200],
        [110, 120],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "convex", label: "The arrowhead has a dent", equals: false },
    { key: "convexWithoutLast", label: "The triangle without it is convex", equals: true },
  ],
});
