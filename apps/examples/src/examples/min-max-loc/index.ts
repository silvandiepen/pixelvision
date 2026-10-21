import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const minMaxLocExample = defineExample<Record<string, never>>({
  slug: "min-max-loc",
  title: "minMaxLoc",
  functions: ["minMaxLoc", "inRange"],
  category: "math",
  description:
    "Finds the smallest and largest value of a single-channel matrix and where they are, optionally only under a mask. The last step of template matching and of finding peaks in a distance map.",
  howItWorks: [
    "It scans the matrix row by row and keeps the first position of the smallest and of the largest value, as OpenCV's `minMaxLoc` does, so ties go to the topmost, then leftmost, position. Any element type works; a `u8` mask restricts the search to its non-zero pixels.",
  ],
  howToTest:
    "In the gray shapes sample the darkest colour is the rotated square (40, 40, 48), gray (40 · 4899 + 40 · 9617 + 48 · 1868 + 8192) >> 14 = 41; the first fully covered pixel in row order is at its top corner, (231.7, 128.4) for a 68-pixel square turned 20° about (252, 172), so within 4 pixels of it. The background is lightest at the top, 236, plus up to 3 of noise: the maximum is 239, in row 0. Inside the circle every pixel is the same green, gray 137, so minimum and maximum are both 137.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "min", label: "Darkest: the square, 41", equals: 41 },
    { key: "minFromCorner", label: "At its top corner", max: 4 },
    { key: "max", label: "Brightest: 236 + 3 of noise", equals: 239 },
    { key: "maxRow", label: "In the top row", equals: 0 },
    { key: "circleMin", label: "Circle: flat 137", equals: 137 },
    { key: "circleMax", label: "Circle: flat 137", equals: 137 },
  ],
});
