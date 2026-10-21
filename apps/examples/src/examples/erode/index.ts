import { defineExample } from "../define";
import { demo } from "./demo";
import type { ErodeDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const erodeExample = defineExample<ErodeDemoOptions>({
  slug: "erode",
  title: "erode",
  functions: ["erode"],
  category: "image",
  description:
    "Shrinks the bright parts of an image: specks disappear and thin bridges between shapes break. Use it to clean up a mask.",
  howItWorks: [
    "Every pixel becomes the minimum of its square neighbourhood: radius 1 is 3 x 3. A bright pixel survives only when its whole neighbourhood is bright, so every shape loses `radius` pixels all round, and anything thinner than the square vanishes. `iterations` repeats it. The opposite is `dilate`; eroding and then dilating (an opening) removes specks without shrinking shapes overall.",
  ],
  howToTest:
    "Erodes the thresholded shapes mask with a 3 x 3 square and checks that nothing new is set, and that the 96 x 72 red rectangle loses exactly one pixel all round: 94 x 70 = 6,580 pixels remain.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "radius",
      label: "Radius",
      description: "Neighbourhood radius: 1 is 3 x 3.",
      min: 1,
      max: 5,
      step: 1,
      default: 1,
    },
    {
      type: "range",
      key: "iterations",
      label: "Iterations",
      description: "How many times to apply it.",
      min: 1,
      max: 5,
      step: 1,
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "onlyRemoves", label: "Only removes pixels", equals: true },
    { key: "rectanglePixels", label: "94 x 70 left of the rectangle", equals: 6580 },
    { key: "shrunk", label: "The mask shrank", equals: true },
  ],
});
