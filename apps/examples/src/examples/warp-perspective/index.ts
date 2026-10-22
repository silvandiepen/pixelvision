import { defineExample } from "../define";
import { demo } from "./demo";
import type { WarpPerspectiveDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const warpPerspectiveExample = defineExample<WarpPerspectiveDemoOptions>({
  slug: "warp-perspective",
  title: "warpPerspective",
  functions: ["warpPerspective"],
  category: "image",
  description:
    "Warps an image through a perspective transform (a homography): tilt it in 3D, or straighten a photographed page or screen.",
  howItWorks: [
    "For every output pixel `(x, y)` it computes `(u, v, w) = H · (x, y, 1)` and samples the input at `(u / w, v / w)` with bilinear interpolation. So `H` maps output to input, the reverse of the change you want; build it with `perspectiveTransform(outputCorners, inputCorners)`.",
    "Output pixels that land outside the input get `fill` (here 0, which also makes them transparent). Every channel is warped, so RGBA works directly.",
  ],
  howToTest:
    "Leans the card photo back by 15% of its width and checks that the top-left corner and a band of wedge-shaped pixels are filled, while the middle of the bottom edge, which maps onto itself, matches the input to within 1.",
  input: "image",
  sample: "card-photo",
  controls: [
    {
      type: "range",
      key: "tilt",
      label: "Tilt",
      description:
        "How far the top corners move outwards in the input, as a share of the width. Negative zooms in on the top.",
      min: -0.3,
      max: 0.5,
      step: 0.01,
      default: 0.15,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "topLeftFilled", label: "Top-left corner maps outside the input", equals: true },
    { key: "filledPixels", label: "Two wedges filled", min: 29000, max: 35000 },
    { key: "bottomMiddleDifference", label: "Middle of the bottom edge unchanged", max: 1 },
  ],
});
