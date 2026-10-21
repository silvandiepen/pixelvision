import { defineExample } from "../define";
import { demo } from "./demo";
import type { LuSolveDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const luSolveExample = defineExample<LuSolveDemoOptions>({
  slug: "lu-solve",
  title: "luSolve",
  functions: ["luSolve"],
  category: "math",
  description: "Solves a square linear system `A · x = b` for `x`.",
  howItWorks: [
    "Gaussian elimination with partial pivoting: for each column it swaps up the row with the largest entry (for numerical stability), eliminates the entries below it, then solves the triangular system that remains from the bottom up.",
    "The inputs are left untouched and `x` is returned. A matrix that is singular relative to its own scale throws a `RangeError`.",
  ],
  howToTest:
    "Solves the textbook system with solution (2, 3, -1) and checks the answer to 9 decimals and that `A · x` reproduces `b` within 1e-12.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "A",
      description: "Square coefficient matrix.",
      default: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
    },
    {
      type: "matrix",
      key: "b",
      label: "b",
      description: "Right-hand side, one value per row of A.",
      default: [[8], [-11], [-3]],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "x", label: "x = (2, 3, -1)", equals: "2,3,-1" },
    { key: "residual", label: "A · x = b", max: 1e-12 },
  ],
});
