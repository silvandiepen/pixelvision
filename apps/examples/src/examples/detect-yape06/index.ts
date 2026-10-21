import { defineExample } from "../define";
import { demo } from "./demo";
import type { DetectYape06DemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const detectYape06Example = defineExample<DetectYape06DemoOptions>({
  slug: "detect-yape06",
  title: "detectYape06",
  functions: ["detectYape06"],
  category: "features",
  description:
    "Finds blob-like keypoints with YAPE06: small spots and corners that stand out from their surroundings, found again reliably when the image is scaled a little.",
  howItWorks: [
    "At every pixel it computes a coarse Laplacian: the pixel compared with the pixels 5 steps left, right, up and down. Spots that are much brighter or darker than that ring give a large response; local extrema above `laplacianThreshold` are candidates.",
    "Edges also give a Laplacian response, so each candidate's Hessian (second derivatives) is checked: along an edge one eigenvalue is near zero. A candidate is kept only when the smaller eigenvalue exceeds `minEigenvalueThreshold`, which leaves points that are distinctive in every direction. Blur first; the input here is blurred with a 5-pixel Gaussian.",
  ],
  howToTest:
    "Runs on the desk sample and checks that a sensible number of keypoints is found and that none lies within the 5-pixel border the Laplacian needs.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "laplacianThreshold",
      label: "Laplacian threshold",
      description: "Minimum absolute Laplacian response.",
      min: 1,
      max: 120,
      step: 1,
      default: 30,
    },
    {
      type: "range",
      key: "minEigenvalueThreshold",
      label: "Eigenvalue threshold",
      description: "Minimum smaller Hessian eigenvalue; rejects points on edges.",
      min: 1,
      max: 120,
      step: 1,
      default: 25,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "pointCount", label: "Distinct points, not texture", min: 20, max: 120 },
    { key: "insideBorder", label: "None in the border", equals: true },
  ],
});
