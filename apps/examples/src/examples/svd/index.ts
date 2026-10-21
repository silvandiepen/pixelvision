import { defineExample } from "../define";
import { demo } from "./demo";
import type { SvdDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const svdExample = defineExample<SvdDemoOptions>({
  slug: "svd",
  title: "svd",
  functions: ["svd"],
  category: "math",
  description:
    "Decomposes any matrix as `A = U · Σ · Vᵀ`: rotations `U` and `V` and the singular values in `Σ`. It's the robust tool behind least squares, pseudo-inverses and rank estimation.",
  howItWorks: [
    "One-sided Jacobi: pairs of columns are rotated until every pair is orthogonal. The column lengths are then the singular values (sorted, largest first), the normalised columns form `U`, and the accumulated rotations form `V`. It iterates to double precision (jsfeat stopped at single-precision tolerances).",
    "When there are fewer singular values than rows, `U` is completed to a full orthonormal basis; jsfeat's version could overflow there and repeat vectors.",
  ],
  howToTest:
    "Decomposes `[[3, 2, 2], [2, 3, -2]]`, whose singular values are exactly 5 and 3, then checks `U · Σ · Vᵀ` rebuilds A within 1e-12 and `Uᵀ · U` is the identity.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "A",
      description: "Any matrix.",
      default: [
        [3, 2, 2],
        [2, 3, -2],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "singularValues", label: "5 and 3", equals: "5,3" },
    { key: "rebuildError", label: "U · Σ · Vᵀ = A", max: 1e-12 },
    { key: "uOrthonormalError", label: "U is orthonormal", max: 1e-12 },
  ],
});
