import { defineExample } from "../define";
import { demo } from "./demo";
import type { ScharrDerivativesDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const scharrDerivativesExample = defineExample<ScharrDerivativesDemoOptions>({
  slug: "scharr-derivatives",
  title: "scharrDerivatives",
  functions: ["scharrDerivatives"],
  category: "image",
  description:
    "Like `sobelDerivatives`, measures the horizontal and vertical brightness change at every pixel, with a kernel that is more accurate for edges at an angle.",
  howItWorks: [
    "The same 3 x 3 differences as Sobel, but the rows are weighted 3-10-3 instead of 1-2-1. That gives nearly the same response for an edge at any angle, which matters when you use the gradient direction (e.g. optical flow). Values are larger: the weights add up to 16 instead of 4.",
  ],
  howToTest:
    "On the shapes sample, the left edge of the red rectangle (gray 76 against about 232) must give `gx` ≈ (76 - 232) x 16 ≈ -2,496 and `gy` close to 0; inside the flat rectangle both are exactly 0.",
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
    {
      key: "gxAtLeftEdge",
      label: "Strong dark-to-light step: about -2,496",
      min: -2700,
      max: -2300,
    },
    { key: "gyAtLeftEdge", label: "No vertical change on a vertical edge", min: -120, max: 120 },
    { key: "gxInside", label: "Flat area: no gradient", equals: 0 },
    { key: "gyInside", label: "Flat area: no gradient", equals: 0 },
  ],
});
