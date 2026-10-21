import { defineExample } from "../define";
import { demo } from "./demo";
import type { CholeskySolveDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const choleskySolveExample = defineExample<CholeskySolveDemoOptions>({
  slug: "cholesky-solve",
  title: "choleskySolve",
  functions: ["choleskySolve"],
  category: "math",
  description:
    "Solves `A · x = b` when `A` is symmetric and positive-definite, such as the `Aᵀ·A` of a least-squares fit. About twice as fast as LU.",
  howItWorks: [
    "It factors `A = L · Lᵀ` with `L` lower-triangular (each diagonal entry is a square root, which only exists when `A` is positive-definite), then solves `L · y = b` forwards and `Lᵀ · x = y` backwards.",
    "A matrix that isn't positive-definite throws a `RangeError`, so a bad input never produces a silently wrong answer.",
  ],
  howToTest:
    "Solves the classic positive-definite system `[[4, 12, -16], [12, 37, -43], [-16, -43, 98]]` with `b` chosen so that x = (1, 2, 3), and checks the answer and the residual.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "A",
      description: "Symmetric positive-definite matrix.",
      default: [
        [4, 12, -16],
        [12, 37, -43],
        [-16, -43, 98],
      ],
    },
    {
      type: "matrix",
      key: "b",
      label: "b",
      description: "Right-hand side, one value per row of A.",
      default: [[-20], [-43], [192]],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "x", label: "x = (1, 2, 3)", equals: "1,2,3" },
    { key: "residual", label: "A · x = b", max: 1e-12 },
  ],
});
