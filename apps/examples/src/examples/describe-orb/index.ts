import { defineExample } from "../define";
import { demo } from "./demo";
import type { DescribeOrbDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const describeOrbExample = defineExample<DescribeOrbDemoOptions>({
  slug: "describe-orb",
  title: "describeOrb",
  functions: ["describeOrb"],
  category: "features",
  description:
    "Turns each keypoint's surroundings into a 256-bit fingerprint (an ORB descriptor), so the same point can be recognised in another image even when it's rotated.",
  howItWorks: [
    "For each keypoint it takes a 32 x 32 patch, turned to the keypoint's orientation (from `keypointOrientation` when the keypoint has no `angle`). It then makes 256 comparisons between fixed pairs of pixels in the patch, chosen by the ORB authors for being informative: each comparison gives one bit, 1 when the first pixel is brighter.",
    "The result is a `u8` matrix with 32 columns (bytes) and one row per keypoint. Two descriptors are compared by counting differing bits (`hammingDistance`): around 128 for unrelated points, much less for the same point. Blur the image first; single-pixel noise flips bits.",
  ],
  howToTest:
    "Describes the 25 strongest corners of the blurred desk sample, then the same points in a copy rotated 30°. The median distance between each point and itself must stay under 30 of 256 bits, while different points differ by 90 bits or more, close to the 128 of unrelated ones.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "count",
      label: "Corners",
      description: "How many of the strongest FAST corners to describe.",
      min: 2,
      max: 200,
      step: 1,
      default: 25,
    },
    {
      type: "range",
      key: "rotation",
      label: "Rotation (°)",
      description: "Rotation of the copy the descriptors are compared with.",
      min: -180,
      max: 180,
      step: 1,
      default: 30,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "width", label: "32 bytes per descriptor", equals: 32 },
    { key: "rows", label: "One row per corner", equals: 25 },
    { key: "sameMedian", label: "Same point: few bits differ", max: 30 },
    { key: "otherMedian", label: "Different points: about half differ", min: 90 },
  ],
});
