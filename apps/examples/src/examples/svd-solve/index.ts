import { defineExample } from "../define";
import { demo } from "./demo";
import type { SvdSolveDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const svdSolveExample = defineExample<SvdSolveDemoOptions>({
  slug: "svd-solve",
  title: "svdSolve",
  functions: ["svdSolve"],
  category: "math",
  description:
    "Solves `A · x = b` in the least-squares sense: exactly for square systems, as the best fit when there are more equations than unknowns (like fitting a line through noisy points), and with the smallest `x` when there are fewer.",
  howItWorks: [
    "With `A = U · Σ · Vᵀ`, the solution is `x = V · Σ⁺ · Uᵀ · b`, where `Σ⁺` inverts the singular values that aren't negligibly small. That minimises `|A · x − b|` and copes with rank-deficient systems.",
    "Here each point gives one equation `c0 + c1 · x = y`; five points, two unknowns. jsfeat's `svd_solve` used the wrong stride for non-square matrices and gave wrong answers for exactly this case.",
  ],
  howToTest:
    "Fits the five default points and checks the coefficients against the closed-form least-squares answer worked out by hand: slope = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = 19.7 / 10 = 1.97, intercept = ȳ − slope · x̄ = 5 − 1.97 · 2 = 1.06.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "points",
      label: "Points (x, y)",
      description: "Points to fit, one per row.",
      default: [
        [0, 1.2],
        [1, 2.8],
        [2, 5.1],
        [3, 6.9],
        [4, 9],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "intercept", label: "Intercept 1.06", min: 1.06 - 1e-9, max: 1.06 + 1e-9 },
    { key: "slope", label: "Slope 1.97", min: 1.97 - 1e-9, max: 1.97 + 1e-9 },
  ],
});
