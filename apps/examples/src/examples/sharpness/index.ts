import { defineExample } from "../define";
import { demo } from "./demo";
import type { SharpnessDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const sharpnessExample = defineExample<SharpnessDemoOptions>({
  slug: "sharpness",
  title: "Sharpness meter",
  functions: ["laplacian", "gaussianBlur", "grayscale"],
  category: "pipeline",
  description:
    "Scores how sharp a photo is, so an app can wait for a steady, focused frame before it captures an ID, a document or a barcode.",
  howItWorks: [
    "`laplacian` responds to fine detail: crisp edges give large values, flat or blurred areas give values near 0. Its variance over the whole frame is the score; it falls quickly as the photo blurs.",
    'The score depends on the scene: a white wall is never "sharp". Compare frames of the same scene (capture when the score peaks, or is well above the last few frames), or calibrate a minimum for your documents.',
  ],
  howToTest:
    "Scores the desk sample, then copies of it blurred with Gaussian kernels of 3, 5, 7, 9 and 13. Every step of blur must lower the score, and even the 3 x 3 blur must take it below half the original.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "blur",
      label: "Blur",
      description: "Gaussian kernel for the copy shown; 1 is no blur.",
      min: 1,
      max: 15,
      step: 2,
      default: 5,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "falling", label: "More blur, lower score", equals: true },
    { key: "lightBlurShare", label: "A 3 x 3 blur halves it", max: 0.5 },
  ],
});
