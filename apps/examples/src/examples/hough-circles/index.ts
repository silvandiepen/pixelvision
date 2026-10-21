import { defineExample } from "../define";
import { demo } from "./demo";
import type { HoughCirclesDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const houghCirclesExample = defineExample<HoughCirclesDemoOptions>({
  slug: "hough-circles",
  title: "houghCircles",
  functions: ["houghCircles", "gaussianBlur"],
  category: "image",
  description:
    "Finds circles in a gray image with the Hough gradient method: coins, wheels, round markers, pupils. Blur the image first.",
  howItWorks: [
    "Canny finds the edges. Every edge pixel then votes for the points along its gradient, between `minRadius` and `maxRadius` away: the centre of a circle through it lies on that line. Cells with more than `accumulatorThreshold` votes that beat their neighbours are candidate centres, strongest first.",
    "For each candidate, the edge pixels around it are binned by distance and the radius with the most support per unit of radius wins. Circles with too little support are dropped, and so is any circle whose centre is within `minDist` of a stronger one. `dp` is the size of an accumulator cell: 2 votes on a grid of 2 x 2 pixels, which is faster and more forgiving but places centres less precisely.",
    "Candidate centres are exactly OpenCV's. Radii can differ from OpenCV's by up to a pixel or two, because pixelvision fixes two off-by-ones in how OpenCV scores radii.",
  ],
  howToTest:
    "The shapes sample has one circle, drawn around (220, 70) with radius 44, measured from pixel corners; in pixel coordinates (pixel x at x) its centre is (219.5, 69.5). The strongest circle found must be that one, centre within 1 pixel and radius 44 ± 1, and with the default settings it is the only one: the rectangle, triangle and square have no round edges.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "dp",
      label: "Cell size (dp)",
      description: "Accumulator cell size in pixels.",
      options: [
        { label: "1", value: 1 },
        { label: "1.5", value: 1.5 },
        { label: "2", value: 2 },
      ],
      default: 1,
    },
    {
      type: "range",
      key: "accumulatorThreshold",
      label: "Votes",
      description: "Votes a centre needs, and edge pixels a circle needs at its radius.",
      min: 5,
      max: 100,
      step: 1,
      default: 30,
    },
    {
      type: "range",
      key: "minRadius",
      label: "Smallest radius",
      description: "Smallest radius searched, in pixels.",
      min: 0,
      max: 60,
      step: 1,
      default: 20,
    },
    {
      type: "range",
      key: "maxRadius",
      label: "Largest radius",
      description: "Largest radius searched, in pixels.",
      min: 10,
      max: 120,
      step: 1,
      default: 80,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "circleCount", label: "Just the green circle", equals: 1 },
    { key: "centreError", label: "Centre within 1 px of (219.5, 69.5)", min: 0, max: 1 },
    { key: "radius", label: "Radius 44 ± 1", min: 43, max: 45 },
  ],
});
