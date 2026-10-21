import { defineExample } from "../define";
import { demo } from "./demo";
import type { WarpAffineDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const warpAffineExample = defineExample<WarpAffineDemoOptions>({
  slug: "warp-affine",
  title: "warpAffine",
  functions: ["warpAffine"],
  category: "image",
  description:
    "Warps an image through an affine transform: any mix of rotation, scale, shear and translation. Straight lines stay straight and parallel lines stay parallel.",
  howItWorks: [
    "The transform is a 2 x 3 matrix `[a, b, c, d, e, f]` (a 3 x 3 one works too; its last row is ignored). Output pixel `(x, y)` samples the input at `(a·x + b·y + c, d·x + e·y + f)` with bilinear interpolation, so it maps output to input: to rotate the image by +30°, the matrix rotates by -30°.",
    "Pixels that sample outside the input get `fill`. `affineTransform` builds the matrix from three point pairs.",
  ],
  howToTest:
    "Rotates the desk sample 30° around its centre and checks that the centre pixel is exactly unchanged (it maps onto itself) and that the top-left corner, rotated outside the input, is filled.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "angle",
      label: "Angle (°)",
      description: "Rotation around the centre, clockwise on screen.",
      min: -180,
      max: 180,
      step: 1,
      default: 30,
    },
    {
      type: "range",
      key: "scale",
      label: "Scale",
      description: "Zoom around the centre.",
      min: 0.25,
      max: 3,
      step: 0.05,
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "centreDifference", label: "Centre maps onto itself", equals: 0 },
    { key: "topLeftFilled", label: "Corner rotated outside is filled", equals: true },
    { key: "width", label: "Same size by default", equals: 320 },
  ],
});
