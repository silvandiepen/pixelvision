import { defineExample } from "../define";
import { demo } from "./demo";
import type { IdentityDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const identityExample = defineExample<IdentityDemoOptions>({
  slug: "identity",
  title: "identity",
  functions: ["identity"],
  category: "math",
  description:
    "Creates a square identity matrix: ones on the diagonal, zeros elsewhere, optionally scaled. Multiplying by it changes nothing; as a 3 x 3 transform it leaves an image as it is.",
  howItWorks: [
    "A zero-filled `f64` matrix of `size x size` with `value` (default 1) written at every `(i, i)`.",
  ],
  howToTest:
    "Creates the default 3 x 3 identity and checks the diagonal sums to 3 and everything else is 0.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "size",
      label: "Size",
      description: "Rows and columns.",
      min: 1,
      max: 8,
      step: 1,
      default: 3,
    },
    {
      type: "range",
      key: "value",
      label: "Diagonal value",
      description: "Value on the diagonal.",
      min: -5,
      max: 5,
      step: 0.5,
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "type", label: "Double precision", equals: "f64" },
    { key: "trace", label: "Diagonal sums to 3", equals: 3 },
    { key: "offDiagonalZero", label: "Zeros elsewhere", equals: true },
  ],
});
