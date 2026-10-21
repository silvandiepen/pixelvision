import { defineExample } from "../define";
import { demo } from "./demo";
import type { BilateralFilterDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const bilateralFilterExample = defineExample<BilateralFilterDemoOptions>({
  slug: "bilateral-filter",
  title: "bilateralFilter",
  functions: ["bilateralFilter"],
  category: "image",
  description:
    "Smooths noise and skin while keeping edges sharp: each pixel averages only neighbours that are both near and similar in colour.",
  howItWorks: [
    "Every neighbour within the diameter gets a weight exp(−d² / 2σ²space) for its distance d, times exp(−c² / 2σ²color) for its colour difference c (for colour images the sum of the R, G and B differences). Across an edge c is large, so the far side hardly counts and the edge stays.",
    "Weights and sums are single precision in OpenCV's order, so results are identical to OpenCV's `bilateralFilter` with `BORDER_REPLICATE`. It is slow for large diameters: the cost grows with the diameter squared.",
  ],
  howToTest:
    "The shapes sample's background has noise of up to ±3 levels per pixel (variance 3.17), so neighbouring pixels differ by √(2 · 3.17) = 2.5 on average. A 9-pixel neighbourhood with σcolor 30 averages about 50 of them nearly equally, which divides that by about 7: after filtering, rounding to whole levels dominates and the difference must be under 1. At the red rectangle's left edge the background (231) and red (76) differ by 155: weight exp(−155² / 1800) ≈ 0, so the step stays 155 ± 3.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "diameter",
      label: "Diameter",
      description: "Neighbourhood width in pixels.",
      min: 3,
      max: 15,
      step: 2,
      default: 9,
    },
    {
      type: "range",
      key: "sigmaColor",
      label: "σ colour",
      description: "Colour difference that still counts; raise it to blur across edges.",
      min: 1,
      max: 150,
      step: 1,
      default: 30,
    },
    {
      type: "range",
      key: "sigmaSpace",
      label: "σ space",
      description: "Distance that still counts, in pixels.",
      min: 1,
      max: 20,
      step: 1,
      default: 5,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "noiseBefore", label: "Neighbours differ by about 2.5", min: 2.3, max: 2.75 },
    { key: "noiseAfter", label: "Under 1 after", max: 1 },
    { key: "edgeStep", label: "Edge stays 155 ± 3", min: 152, max: 158 },
  ],
});
