import { defineExample } from "../define";
import { demo } from "./demo";
import type { EstimateHomographyDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const estimateHomographyExample = defineExample<EstimateHomographyDemoOptions>({
  slug: "estimate-homography",
  title: "estimateHomography",
  functions: ["estimateHomography"],
  category: "motion",
  description:
    "Finds the perspective transform (homography) that maps one set of points onto another, even when some of the pairs are wrong. Use it on matched features to find a known flat object, such as a card, page or poster, in a photo.",
  howItWorks: [
    "RANSAC: it repeatedly picks 4 random pairs, computes the exact homography through them (`perspectiveTransform`), and counts how many of all pairs it maps to within `threshold` pixels. The homography with the most inliers wins; with `refine` (the default) it is then refitted to all its inliers. The number of tries adapts to the inlier share and `confidence`.",
    "LMEDS instead keeps the model with the smallest median error. It needs no threshold, but fails when more than about half the pairs are wrong. Pass a seeded `random` for repeatable results, as this demo does; the default is `Math.random`.",
  ],
  howToTest:
    "Builds 50 point pairs from a transform that is a known perspective transform, replaces 30% with random pairs, and checks that the estimate counts exactly the 35 true pairs as inliers and matches the true transform to within 1e-6.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "outlierShare",
      label: "Wrong pairs",
      description: "Share of the pairs replaced by random ones.",
      min: 0,
      max: 0.8,
      step: 0.05,
      default: 0.3,
    },
    {
      type: "select",
      key: "method",
      label: "Method",
      description: "RANSAC counts inliers; LMEDS minimises the median error.",
      options: [
        { label: "RANSAC", value: "ransac" },
        { label: "LMEDS", value: "lmeds" },
      ],
      default: "ransac",
    },
    {
      type: "range",
      key: "threshold",
      label: "Threshold (px)",
      description: "RANSAC: largest distance for a pair to count as an inlier.",
      min: 0.5,
      max: 20,
      step: 0.5,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "inlierCount", label: "Exactly the true pairs", equals: 35 },
    { key: "modelError", label: "The true transform", max: 1e-6 },
  ],
});
