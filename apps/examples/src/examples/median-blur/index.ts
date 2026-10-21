import { defineExample } from "../define";
import { demo } from "./demo";
import type { MedianBlurDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const medianBlurExample = defineExample<MedianBlurDemoOptions>({
  slug: "median-blur",
  title: "medianBlur",
  functions: ["medianBlur"],
  category: "image",
  description:
    "Replaces every pixel by the middle value of its neighbourhood. Isolated black and white specks vanish, and unlike a blur, edges stay sharp.",
  howItWorks: [
    "For each pixel it sorts the values in the square window round it and takes the middle one. A speck is one odd value among many normal ones, so it never ends up in the middle. On an edge, the middle value comes from whichever side holds most of the window, so the step stays a step.",
    "The window size must be odd: 3 removes single-pixel specks, 5 removes clusters of two or three but starts to round off corners. Colour images are filtered channel by channel. Borders repeat the edge pixel. Results match OpenCV's `medianBlur`.",
  ],
  howToTest:
    "Turns 5 % of the shapes sample's pixels black or white, then filters with a 3 x 3 window. A white speck on the light background or a black one on the dark square hardly changes it, so about 3.5 % of pixels start more than 40 levels off the clean image. Afterwards almost none may be, and the red rectangle's left edge must still be a step of over 100 levels between neighbouring pixels.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "size",
      label: "Window",
      description: "Odd window size: 3 is 3 x 3.",
      min: 3,
      max: 9,
      step: 2,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "wrongBefore", label: "About 3.5 % visibly wrong before", min: 0.03, max: 0.045 },
    { key: "wrongAfter", label: "Almost none after", max: 0.002 },
    { key: "edgeStep", label: "Edge still sharp", min: 100 },
  ],
});
