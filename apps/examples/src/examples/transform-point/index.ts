import { defineExample } from "../define";
import { demo } from "./demo";
import type { TransformPointDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const transformPointExample = defineExample<TransformPointDemoOptions>({
  slug: "transform-point",
  title: "transformPoint",
  functions: ["transformPoint"],
  category: "math",
  description:
    "Applies a 3 x 3 transform (affine or perspective) to a single point, e.g. to find where a corner ends up after a warp.",
  howItWorks: [
    "The point is extended to `(x, y, 1)` and multiplied by the matrix, giving `(u, v, w)`; the result is `(u / w, v / w)`. For an affine matrix `w` is always 1; for a perspective one the division is what makes distant things smaller.",
  ],
  howToTest:
    "Applies the default matrix, which scales by 2 and moves by (10, 20), to (5, 7) and checks the result is exactly (20, 34).",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "transform",
      label: "Transform",
      description: "3 x 3 matrix, row by row.",
      default: [
        [2, 0, 10],
        [0, 2, 20],
        [0, 0, 1],
      ],
    },
    {
      type: "range",
      key: "x",
      label: "x",
      description: "Point x.",
      min: -100,
      max: 100,
      step: 1,
      default: 5,
    },
    {
      type: "range",
      key: "y",
      label: "y",
      description: "Point y.",
      min: -100,
      max: 100,
      step: 1,
      default: 7,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "x", label: "2 · 5 + 10", equals: 20 },
    { key: "y", label: "2 · 7 + 20", equals: 34 },
  ],
});
