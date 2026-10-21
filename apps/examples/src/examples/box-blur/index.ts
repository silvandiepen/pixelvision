import { defineExample } from "../define";
import { demo } from "./demo";
import type { BoxBlurDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const boxBlurExample = defineExample<BoxBlurDemoOptions>({
  slug: "box-blur",
  title: "boxBlur",
  functions: ["boxBlur"],
  category: "image",
  description:
    "Blurs by averaging every pixel with its neighbours in a square window. It's fast at any size, at the cost of a blockier look than a Gaussian.",
  howItWorks: [
    "A running sum slides along each row: add the pixel entering the window, subtract the one leaving it. The same is done down the columns, so the cost per pixel stays constant whatever the radius. The sum is divided by the window area and rounded down.",
    "Borders repeat the edge pixel, for any radius, even when the window is wider than the image.",
  ],
  howToTest:
    "Blurs the shapes sample with radius 4 and checks that most sharp steps (neighbouring pixels more than 60 apart) disappear, the average brightness barely moves, and a pixel in the middle of the flat red rectangle keeps its value of 76.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "radius",
      label: "Radius",
      description: "Pixels on each side of the centre; the window is 2 x radius + 1 wide.",
      min: 0,
      max: 20,
      step: 1,
      default: 4,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "sharpRatio", label: "Most sharp steps smoothed away", max: 0.5 },
    { key: "meanShift", label: "Brightness about the same (averages round down)", max: 1 },
    { key: "flatAreaValue", label: "Flat area unchanged", equals: 76 },
  ],
});
