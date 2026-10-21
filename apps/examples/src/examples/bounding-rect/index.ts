import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const boundingRectExample = defineExample<Record<string, never>>({
  slug: "bounding-rect",
  title: "boundingRect",
  functions: ["boundingRect"],
  category: "shape",
  description:
    "Finds the smallest upright rectangle round a set of points, such as a traced outline: where a shape is and how big it is, ready to crop.",
  howItWorks: [
    "It takes the smallest and largest x and y of the points. Like OpenCV's `boundingRect`, it counts whole pixels: a shape whose outline runs from column 24 to column 119 is 96 pixels wide, so a single point is a 1 x 1 box.",
    "The box doesn't turn with the shape. A tilted square gets a box larger than itself; `minAreaRect` finds the tight, rotated one.",
  ],
  howToTest:
    "Boxes the four shapes of the shapes sample and checks the red rectangle, drawn as 96 x 72 pixels at (24, 24), gets exactly that box. The dark square, 68 pixels wide and turned 20°, must get a box about 68 x (cos 20° + sin 20°) = 87 pixels wide (a pixel less, because the outline runs through the edge pixels' centres).",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "count", label: "Four shapes", equals: 4 },
    { key: "rectangle", label: "Red rectangle: 24, 24, 96 x 72", equals: "24,24,96,72" },
    { key: "squareWidth", label: "Tilted square's box about 87 wide", min: 85, max: 88 },
  ],
});
