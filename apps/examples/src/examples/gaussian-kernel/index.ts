import { defineExample } from "../define";
import { demo } from "./demo";
import type { GaussianKernelDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const gaussianKernelExample = defineExample<GaussianKernelDemoOptions>({
  slug: "gaussian-kernel",
  title: "gaussianKernel",
  functions: ["gaussianKernel"],
  category: "math",
  description:
    "Computes the weights of a 1D Gaussian (bell curve) kernel. `gaussianBlur` applies one along rows and then columns.",
  howItWorks: [
    "Weight `i` is `exp(-(i - centre)² / (2σ²))`, and the weights are scaled to sum to 1. With sigma 0 it is derived from the size as OpenCV does, `0.3 · ((size - 1) / 2 - 1) + 0.8`, and odd sizes up to 7 use the exact binomial weights (5 → 1-4-6-4-1 / 16).",
    "With `integer: true` the weights are fixed-point integers summing to about 256, which 8-bit blurs use to stay in integer maths.",
  ],
  howToTest:
    "Computes the default 5-weight kernel and checks it is the binomial 1/16 · [1, 4, 6, 4, 1]: five symmetric weights summing to 1 with 0.375 in the middle.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "size",
      label: "Size",
      description: "Number of weights.",
      min: 1,
      max: 21,
      step: 1,
      default: 5,
    },
    {
      type: "range",
      key: "sigma",
      label: "Sigma",
      description: "Standard deviation; 0 derives it from the size.",
      min: 0,
      max: 5,
      step: 0.1,
      default: 0,
    },
    {
      type: "toggle",
      key: "integer",
      label: "Integer weights",
      description: "Return fixed-point weights summing to about 256.",
      default: false,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "length", label: "Five weights", equals: 5 },
    { key: "sum", label: "Sums to 1", equals: 1 },
    { key: "centre", label: "6 / 16 in the middle", equals: 0.375 },
    { key: "symmetric", label: "Symmetric", equals: true },
  ],
});
