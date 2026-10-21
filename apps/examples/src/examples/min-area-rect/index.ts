import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const minAreaRectExample = defineExample<Record<string, never>>({
  slug: "min-area-rect",
  title: "minAreaRect",
  functions: ["minAreaRect"],
  category: "shape",
  description:
    "Finds the smallest rectangle round a set of points at any angle: how far a card, a label or a domino is turned, and its true size.",
  howItWorks: [
    "The tightest rectangle always has one side along an edge of the convex hull (rotating calipers). So it computes the hull, then for each hull edge measures the hull's extent along that edge and across it, and keeps the edge that gives the smallest area.",
    "It returns the centre, the two side lengths, the angle of the first side in degrees, and the four corners. A rectangle turned 20° is also one turned 110° with its sides swapped, so compare angles modulo 90°.",
  ],
  howToTest:
    "Fits the four shapes of the shapes sample. The dark square was drawn 68 pixels wide and turned 20° about (252, 172): its rectangle must be turned 20° (modulo 90°) with sides of about 68 pixels. The upright red rectangle must come out at 0°.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "squareAngle", label: "Square turned 20°", min: 19, max: 21 },
    { key: "squareSide", label: "Square about 68 wide", min: 67, max: 69 },
    { key: "rectangleAngle", label: "Red rectangle upright", equals: 0 },
  ],
});
