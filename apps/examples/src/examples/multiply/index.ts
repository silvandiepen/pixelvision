import { defineExample } from "../define";
import { demo } from "./demo";
import type { MultiplyDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const multiplyExample = defineExample<MultiplyDemoOptions>({
  slug: "multiply",
  title: "multiply",
  functions: ["multiply"],
  category: "math",
  description:
    "Multiplies two matrices, optionally using the transpose of either one without building the transposed copy (handy for `Aᵀ·A` in least squares).",
  howItWorks: [
    "Entry `(i, j)` of `A·B` is the dot product of row `i` of A and column `j` of B, so the number of columns of A must equal the number of rows of B; otherwise it throws a `RangeError`. Try ticking one transpose box to see it.",
  ],
  howToTest:
    "Multiplies the default 2 x 3 and 3 x 2 matrices and checks the product is exactly `[[58, 64], [139, 154]]`.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "A",
      description: "Left matrix.",
      default: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    },
    {
      type: "matrix",
      key: "b",
      label: "B",
      description: "Right matrix.",
      default: [
        [7, 8],
        [9, 10],
        [11, 12],
      ],
    },
    {
      type: "toggle",
      key: "transposeA",
      label: "Use Aᵀ",
      description: "Multiply by the transpose of A.",
      default: false,
    },
    {
      type: "toggle",
      key: "transposeB",
      label: "Use Bᵀ",
      description: "Multiply by the transpose of B.",
      default: false,
    },
  ],
  code,
  demo,
  expectations: [{ key: "rows", label: "[[58, 64], [139, 154]]", equals: "58,64;139,154" }],
});
