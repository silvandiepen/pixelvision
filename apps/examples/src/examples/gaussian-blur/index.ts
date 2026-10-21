import { defineExample } from "../define";
import { demo } from "./demo";
import type { GaussianBlurDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const gaussianBlurExample = defineExample<GaussianBlurDemoOptions>({
  slug: "gaussian-blur",
  title: "gaussianBlur",
  functions: ["gaussianBlur"],
  category: "image",
  description:
    "Smooths an image with a Gaussian kernel. Run it before edge or feature detection so noise doesn't show up as detail.",
  howItWorks: [
    "A 2D Gaussian is separable, so the image is filtered along rows with a 1D kernel (see `gaussianKernel`) and then along columns: `2k` multiplications per pixel instead of `k²`. Borders repeat the edge pixel.",
    "8-bit images use integer weights that sum to 256 and shift the result back by 8 bits, as OpenCV does. Larger kernels or sigmas blur more; the kernel size must be odd so it's centred on the pixel.",
  ],
  howToTest:
    "Counts sharp steps (neighbouring pixels more than 60 apart) before and after blurring the shapes sample with a 5-pixel kernel, and checks that most disappear while the average brightness barely moves.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "kernelSize",
      label: "Kernel size",
      description: "Width of the kernel in pixels; must be odd.",
      options: [3, 5, 7, 9, 11, 15, 21].map((value) => ({ label: `${value}`, value })),
      default: 5,
    },
    {
      type: "range",
      key: "sigma",
      label: "Sigma",
      description:
        "Standard deviation of the Gaussian. 0 derives it from the kernel size, like OpenCV.",
      min: 0,
      max: 6,
      step: 0.1,
      default: 0,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "sharpRatio", label: "Most sharp steps smoothed away", max: 0.5 },
    { key: "meanShift", label: "Brightness preserved", max: 1 },
  ],
});
