import { defineExample } from "../define";
import { demo } from "./demo";
import type { DistanceTransformDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const distanceTransformExample = defineExample<DistanceTransformDemoOptions>({
  slug: "distance-transform",
  title: "distanceTransform",
  functions: ["distanceTransform", "minMaxLoc"],
  category: "shape",
  description:
    "Gives every shape pixel its distance to the nearest background pixel. The peaks are the centres of the thickest parts: use them to find a shape's middle, measure stroke width, or split touching objects.",
  howItWorks: [
    "Two passes over the image, one forward and one backward, each take the smallest of 'neighbour's distance + step cost' over the neighbours already visited. The step costs set the metric: 1 and 1 (chessboard, `c`), 1 and 2 (city block, `l1`), or OpenCV's approximations of straight-line distance: 0.955 and 1.3693 (3 x 3) or 1, 1.4 and 2.1969 for a knight's move (5 x 5, the default and the closer one).",
    "The sums are fixed point exactly as in OpenCV's `distanceTransform`, so results are identical. The image edge doesn't count as background.",
  ],
  howToTest:
    "Thresholds the shapes sample so the shapes are white. The red rectangle covers rows 24–95; from its centre pixel (72, 60) the nearest background is row 96, 36 straight steps of cost 1 below: exactly 36 (diagonal and knight steps cost more per row). The green circle has radius 44, but part of its anti-aliased rim lands on the background side of the threshold: measured on the mask, the nearest background pixel to its centre (220, 70) is 43.1 away. The 5 x 5 steps (1.4 for √2 = 1.414, 2.1969 for √5 = 2.236) underestimate by up to 1.8 %, so the centre measures 42.3–43.2. That is the deepest point of the image, found by `minMaxLoc` within 2 pixels of the centre.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "metric",
      label: "Metric",
      description: "How distance is measured.",
      options: [
        { label: "Euclidean, 5 x 5", value: "l2-5" },
        { label: "Euclidean, 3 x 3", value: "l2-3" },
        { label: "City block", value: "l1" },
        { label: "Chessboard", value: "c" },
      ],
      default: "l2-5",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "rectangleCentre", label: "36 steps to the rectangle's edge", equals: 36 },
    { key: "circleCentre", label: "Circle centre 43.1 in, less up to 1.8 %", min: 42.3, max: 43.2 },
    { key: "deepest", label: "The circle is the thickest shape", min: 42.3, max: 43.2 },
    { key: "deepestFromCircleCentre", label: "Deepest point at its centre", max: 2 },
  ],
});
