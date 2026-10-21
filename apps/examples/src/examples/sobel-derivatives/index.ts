import { defineExample } from "../define";
import { demo } from "./demo";
import type { SobelDerivativesDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const sobelDerivativesExample = defineExample<SobelDerivativesDemoOptions>({
  slug: "sobel-derivatives",
  title: "sobelDerivatives",
  functions: ["sobelDerivatives"],
  category: "image",
  description:
    "Measures how fast brightness changes at every pixel, horizontally (`gx`) and vertically (`gy`). Large values mark edges; the direction of `[gx, gy]` points across the edge.",
  howItWorks: [
    "Each gradient is a 3 x 3 weighted difference: `gx` is the column to the right minus the column to the left, weighted 1-2-1 down the rows (`gy` likewise for rows). The 1-2-1 weighting smooths along the edge while differentiating across it.",
    "The result is a 2-channel `i32` matrix (`f32` for float input); the edges of the image repeat the border pixel.",
  ],
  howToTest:
    "On the shapes sample, the left edge of the red rectangle (gray 76) borders the background (gray about 232): `gx` there must be about (76 - 232) x 4 ≈ -624 and `gy` close to 0. Inside the flat rectangle both are exactly 0.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "view",
      label: "Show",
      description: "Colour shows both gradients with their sign; strength shows |gx| + |gy|.",
      options: [
        { label: "Both gradients as colour", value: "color" },
        { label: "Edge strength", value: "magnitude" },
      ],
      default: "color",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "type", label: "Integer gradients", equals: "i32" },
    { key: "channels", label: "[gx, gy]", equals: 2 },
    { key: "gxAtLeftEdge", label: "Strong dark-to-light step: about -624", min: -680, max: -570 },
    { key: "gyAtLeftEdge", label: "No vertical change on a vertical edge", min: -30, max: 30 },
    { key: "gxInside", label: "Flat area: no gradient", equals: 0 },
    { key: "gyInside", label: "Flat area: no gradient", equals: 0 },
  ],
});
