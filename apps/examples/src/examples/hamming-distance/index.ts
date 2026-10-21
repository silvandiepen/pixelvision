import { defineExample } from "../define";
import { demo } from "./demo";
import type { HammingDistanceDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const hammingDistanceExample = defineExample<HammingDistanceDemoOptions>({
  slug: "hamming-distance",
  title: "hammingDistance",
  functions: ["hammingDistance"],
  category: "features",
  description:
    "Counts how many bits differ between two binary descriptors, such as two rows from `describeOrb`. A small distance means the two points look alike.",
  howItWorks: [
    "Each pair of bytes is combined with XOR, which leaves a 1 wherever the bits differ, and the 1s are counted with a 256-entry lookup table. The rows are given as a matrix and a row index, so you can compare any row of one descriptor set with any row of another. Both matrices must have the same width.",
  ],
  howToTest:
    "Compares the bytes `255, 0, 15, 1` with `0, 0, 15, 3`: 8 bits differ in the first byte and 1 in the last, so the distance must be exactly 9.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "a (bytes)",
      description: "First descriptor, one byte (0–255) per cell.",
      default: [[255, 0, 15, 1]],
    },
    {
      type: "matrix",
      key: "b",
      label: "b (bytes)",
      description: "Second descriptor, same length.",
      default: [[0, 0, 15, 3]],
    },
  ],
  code,
  demo,
  expectations: [{ key: "distance", label: "8 + 0 + 0 + 1 bits differ", equals: 9 }],
});
