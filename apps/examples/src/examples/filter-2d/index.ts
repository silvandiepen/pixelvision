import { defineExample } from "../define";
import { demo } from "./demo";
import type { Filter2DDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const filter2DExample = defineExample<Filter2DDemoOptions>({
  slug: "filter-2d",
  title: "filter2D",
  functions: ["filter2D"],
  category: "image",
  description:
    "Runs any kernel over an image: sharpen, emboss, blur with a custom shape, or pick out edges in one direction. Bytes are rounded and clipped; float output keeps negative values.",
  howItWorks: [
    "Every output pixel is the sum of its neighbours times the kernel weights, with the kernel's centre on the pixel (for an even size, just right of and below the middle). The kernel is not flipped, as in OpenCV. Pixels outside the image repeat the edge pixel.",
    "Sums are kept in single precision in OpenCV's order, so results are identical to OpenCV's `filter2D` with `BORDER_REPLICATE` for kernels up to 7 x 7 (OpenCV switches to a Fourier transform from 50 weights). Edit the kernel to try others: a row of thirds blurs sideways, `[-1, 0, 1]` finds vertical edges.",
  ],
  howToTest:
    "Sharpens the gray palette sample with [0 −1 0; −1 5 −1; 0 −1 0]. The weights add up to 1, so inside the flat gray swatch the value stays 128. On the last gray row, above the near-black swatch (20): 5 · 128 − 3 · 128 − 20 = 236. On the first dark row: 5 · 20 − 128 − 3 · 20 = −88, which clips to 0 as a byte and stays −88 as a float.",
  input: "image",
  sample: "palette",
  controls: [
    {
      type: "matrix",
      key: "kernel",
      label: "Kernel",
      description: "Weights, row by row; the centre lands on the pixel.",
      default: [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "flat", label: "Flat gray unchanged", equals: 128 },
    { key: "aboveEdge", label: "5 · 128 − 3 · 128 − 20 = 236", equals: 236 },
    { key: "belowEdge", label: "−88 clips to 0", equals: 0 },
    { key: "belowEdgeFloat", label: "Float keeps −88", equals: -88 },
  ],
});
