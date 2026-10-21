import { defineExample } from "../define";
import { demo } from "./demo";
import type { DilateDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const dilateExample = defineExample<DilateDemoOptions>({
  slug: "dilate",
  title: "dilate",
  functions: ["dilate"],
  category: "image",
  description:
    "Grows the bright parts of an image: thin lines get thicker and small gaps close. Use it to join broken edges before looking for outlines.",
  howItWorks: [
    "Every pixel becomes the maximum of its square neighbourhood: radius 1 is a 3 x 3 square, radius 2 is 5 x 5. A bright pixel therefore spreads to all its neighbours. `iterations` repeats it, which grows by `radius` each time. The opposite is `erode`; dilating and then eroding (a closing) fills gaps without growing shapes overall.",
  ],
  howToTest:
    "Dilates the Canny edges of the shapes sample with a 3 x 3 square and checks that every original edge pixel is still set and that the edges become about three times as thick.",
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
    { key: "keepsEveryPixel", label: "Only adds pixels", equals: true },
    { key: "growth", label: "About three times as many edge pixels", min: 2.2, max: 4 },
  ],
});
