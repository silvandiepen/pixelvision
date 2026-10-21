import { defineExample } from "../define";
import { demo } from "./demo";
import type { PerspectiveTransformDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const perspectiveTransformExample = defineExample<PerspectiveTransformDemoOptions>({
  slug: "perspective-transform",
  title: "perspectiveTransform",
  functions: ["perspectiveTransform"],
  category: "math",
  description:
    "Computes the perspective transform (homography) that maps four points onto four others: the maths behind straightening a photographed document.",
  howItWorks: [
    "A homography is a 3 x 3 matrix `H` with 8 degrees of freedom (the last entry is fixed to 1). Each point pair `(x, y) → (u, v)` gives two linear equations, `u = (h0·x + h1·y + h2) / (h6·x + h7·y + 1)` and the same for `v`, so four pairs give exactly the 8 equations to solve.",
    "Straight lines stay straight, but parallel lines may meet: the grid on the right converges like a floor in a photo. Three collinear points make the system degenerate, and it throws a `RangeError` (jsfeat returned `NaN`s).",
  ],
  howToTest:
    "Computes the transform for the default square and quadrilateral, maps the four source points through it with `transformPoint`, and checks that each lands on its target within 1e-6 pixels, with the last matrix entry normalised to 1.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "from",
      label: "From (x, y)",
      description: "Four source points, in order around the shape.",
      default: [
        [30, 50],
        [130, 50],
        [130, 150],
        [30, 150],
      ],
    },
    {
      type: "matrix",
      key: "to",
      label: "To (x, y)",
      description: "Where each source point should land.",
      default: [
        [170, 40],
        [300, 70],
        [290, 210],
        [160, 180],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "maxError", label: "Points land on their targets", max: 1e-6 },
    { key: "h22", label: "Normalised so the last entry is 1", equals: 1 },
  ],
});
