import { defineExample } from "../define";
import { demo } from "./demo";
import type { LaplacianDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const laplacianExample = defineExample<LaplacianDemoOptions>({
  slug: "laplacian",
  title: "laplacian",
  functions: ["laplacian"],
  category: "image",
  description:
    "Measures how sharply brightness bends at every pixel. It's zero on flat areas and large on edges and fine detail, and its spread is the usual sharpness score for a photo.",
  howItWorks: [
    "With `size: 1` (the default) each pixel becomes its four neighbours' sum minus four times itself: the kernel [0 1 0; 1 −4 1; 0 1 0]. `size: 3` uses the diagonals, [2 0 2; 0 −8 0; 2 0 2]. The kernels add up to 0, so flat areas give exactly 0. The result is an `i32` matrix, because it can be negative: a light pixel next to dark ones gives a large negative value. Borders mirror, as in OpenCV's `Laplacian`.",
    "The variance of the result is a common focus measure: a blurred photo has little fine detail, so its Laplacian stays close to 0 everywhere. See the sharpness example.",
  ],
  howToTest:
    "Inside the shapes sample's flat red rectangle the result must be exactly 0. Just left of its edge, where light background (about 230) meets the rectangle (76) on one side, the 4-neighbour kernel gives about 230 + 76 + 230 + 230 − 4 x 230 = −154.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "size",
      label: "Kernel",
      description: "1: the 4-neighbour kernel. 3: the diagonal one.",
      options: [
        { label: "1 (4 neighbours)", value: 1 },
        { label: "3 (diagonals)", value: 3 },
      ],
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "flatInside", label: "Zero on a flat area", equals: 0 },
    { key: "edge", label: "About −154 beside the edge", min: -170, max: -135 },
  ],
});
