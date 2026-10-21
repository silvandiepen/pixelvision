import { defineExample } from "../define";
import { demo } from "./demo";
import type { MorphologyDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const morphologyExample = defineExample<MorphologyDemoOptions>({
  slug: "morphology",
  title: "morphology",
  functions: ["morphology", "erode", "dilate"],
  category: "image",
  description:
    "Cleans up a black-and-white mask: an opening removes specks, a closing fills pinholes and gaps, and the gradient leaves only the outlines.",
  howItWorks: [
    "Each is `erode` and `dilate` in a fixed order, as OpenCV's `morphologyEx`. An opening erodes first: anything smaller than the neighbourhood disappears, and the dilation then grows the shapes that survived back to their size. A closing dilates first, so holes and cracks narrower than the neighbourhood fill, then erodes the shapes back. The gradient subtracts the eroded mask from the dilated one, which leaves a band along every edge.",
    "Radius 1 is a 3 x 3 square; `iterations` repeats each step.",
  ],
  howToTest:
    "Adds 150 single-pixel specks well outside the shapes and 150 pinholes well inside them. An opening with radius 1 must remove every speck and keep the shapes, and the pinholes, which only a closing fills, must still be there.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "operation",
      label: "Operation",
      description: "Open removes specks, close fills pinholes, gradient outlines.",
      options: [
        { label: "Open", value: "open" },
        { label: "Close", value: "close" },
        { label: "Gradient", value: "gradient" },
      ],
      default: "open",
    },
    {
      type: "range",
      key: "radius",
      label: "Radius",
      description: "Neighbourhood radius: 1 is 3 x 3.",
      min: 1,
      max: 4,
      step: 1,
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "specksLeft", label: "Every speck removed", equals: 0 },
    { key: "holesLeft", label: "Pinholes left for a closing", equals: 150 },
    { key: "rectangleMiddle", label: "Shapes kept", equals: 255 },
  ],
});
