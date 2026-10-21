import { defineExample } from "../define";
import { demo } from "./demo";
import type { AffineTransformDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const affineTransformExample = defineExample<AffineTransformDemoOptions>({
  slug: "affine-transform",
  title: "affineTransform",
  functions: ["affineTransform"],
  category: "math",
  description:
    "Computes the affine transform (rotation, scale, shear and translation) that maps three points onto three others. Pass it to `warpAffine`.",
  howItWorks: [
    "An affine transform has six unknowns: `u = a·x + b·y + c` and `v = d·x + e·y + f`. Each point pair gives two equations, so three pairs fix it, and the six equations are solved directly.",
    "Unlike a perspective transform, parallel lines stay parallel: the mapped grid is made of parallelograms. The result is 3 x 3 with last row `[0, 0, 1]`, so it combines with perspective transforms. Collinear source points throw a `RangeError`.",
  ],
  howToTest:
    "Maps the three default source points through the computed matrix and checks each lands on its target within 1e-6 pixels, and that the last row is exactly `0, 0, 1`.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "from",
      label: "From (x, y)",
      description: "Three source points, not on one line.",
      default: [
        [30, 40],
        [140, 40],
        [30, 160],
      ],
    },
    {
      type: "matrix",
      key: "to",
      label: "To (x, y)",
      description: "Where each source point should land.",
      default: [
        [200, 30],
        [290, 90],
        [160, 140],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "maxError", label: "Points land on their targets", max: 1e-6 },
    { key: "lastRow", label: "Affine: last row 0, 0, 1", equals: "0,0,1" },
  ],
});
