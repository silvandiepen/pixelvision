import { defineExample } from "../define";
import { demo } from "./demo";
import type { ResampleDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const resampleExample = defineExample<ResampleDemoOptions>({
  slug: "resample",
  title: "resample",
  functions: ["resample"],
  category: "image",
  description:
    "Resizes an image to any width and height, any type and number of channels: shrink a camera frame before processing it, or enlarge a result to look at.",
  howItWorks: [
    "Shrinking uses area averaging: each output pixel is the mean of the input area it covers, weighted by how much of each input pixel falls inside, so fine detail is averaged instead of skipped and no aliasing appears.",
    "Enlarging (in either direction) uses bilinear interpolation with centre alignment. Every channel is resized on its own, so colour images keep their colours whichever way they're scaled.",
  ],
  howToTest:
    "Shrinks the RGBA sample to half size and checks the output is 160 x 120 with 4 channels, with nearly the same average brightness.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "scale",
      label: "Scale",
      description: "Output size relative to the input.",
      min: 0.1,
      max: 2,
      step: 0.05,
      default: 0.5,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "width", label: "Half of 320", equals: 160 },
    { key: "height", label: "Half of 240", equals: 120 },
    { key: "channels", label: "Still RGBA", equals: 4 },
    { key: "meanShift", label: "Brightness about the same", max: 1.5 },
  ],
});
