import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const huMomentsExample = defineExample<Record<string, never>>({
  slug: "hu-moments",
  title: "huMoments",
  functions: ["huMoments", "moments"],
  category: "shape",
  description:
    "Turns a shape's moments into seven numbers that stay the same when the shape moves, grows or turns: a fingerprint for recognising a shape whatever its size and angle.",
  howItWorks: [
    "Hu's seven invariants are fixed combinations of the normalised central moments (`nu20`, `nu11`, `nu02` and the third-order ones). Moving the shape doesn't change central moments, scaling doesn't change normalised ones, and these particular combinations also cancel out rotation. The seventh changes sign when the shape is mirrored.",
    "The first, h1 = nu20 + nu02, already tells shapes apart: 1/6 for any square, 1/(2π) for any circle, more for long or pointed shapes. The values span many orders of magnitude, so compare them on a log scale.",
  ],
  howToTest:
    "A square's h1 is exactly 1/6, and turning it 30° and doubling its size must leave all seven invariants unchanged. In the shapes sample, the traced 20° square must come out at about 1/6 too, and the circle at about 1/(2π) = 0.1592.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "squareH1", label: "A square's h1 is 1/6", equals: 0.166667 },
    { key: "turnedAndScaled", label: "Unchanged when turned and scaled", equals: true },
    { key: "tiltedSquareH1", label: "Traced tilted square about 1/6", min: 0.165, max: 0.168 },
    { key: "circleH1", label: "Traced circle about 1/(2π)", min: 0.158, max: 0.16 },
  ],
});
