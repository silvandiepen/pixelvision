import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const shapeAnalysisExample = defineExample<Record<string, never>>({
  slug: "shape-analysis",
  title: "Shape analysis",
  functions: ["boundingRect", "minAreaRect", "convexHull", "moments", "findContours", "threshold"],
  category: "pipeline",
  description:
    "Finds every object in an image and measures it: where it is, how big, which way it's turned, and how solid. The usual first step for sorting parts, reading gauges or checking a print.",
  howItWorks: [
    "`threshold` with `invert` turns the dark shapes white, and `findContours` traces each one's outline.",
    "For each outline, `boundingRect` gives the upright box to crop, `minAreaRect` the tight rotated box (its angle is how far the shape is turned), `convexHull` the rubber-band outline, and `moments` the area and centre of mass.",
    "Solidity, the area divided by the hull's area, is 1 for convex shapes and lower for shapes with dents, which makes it a quick check for broken or touching parts.",
  ],
  howToTest:
    "Measures the shapes sample. All four shapes must be found; the dark square, drawn turned 20°, must come out at 20° (modulo 90°); every shape is convex, so every solidity must be close to 1; and the red rectangle's centre must be (71.5, 59.5), the middle of its traced outline.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "count", label: "Four shapes", equals: 4 },
    { key: "squareAngle", label: "Square turned 20°", min: 19, max: 21 },
    { key: "leastSolid", label: "All convex", min: 0.97 },
    { key: "rectangleCentre", label: "Rectangle centred at (71.5, 59.5)", equals: "71.5,59.5" },
  ],
});
