import { defineExample } from "../define";
import { demo } from "./demo";
import type { PseudoInverseDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const pseudoInverseExample = defineExample<PseudoInverseDemoOptions>({
  slug: "pseudo-inverse",
  title: "pseudoInverse",
  functions: ["pseudoInverse"],
  category: "math",
  description:
    "Computes the Moore–Penrose pseudo-inverse `A⁺`: the closest thing to an inverse for matrices that aren't square or aren't invertible. `A⁺ · b` is the least-squares solution of `A · x = b`.",
  howItWorks: [
    "From the SVD `A = U · Σ · Vᵀ`, `A⁺ = V · Σ⁺ · Uᵀ`, where `Σ⁺` takes the reciprocal of each singular value above `ε · largest · max(rows, columns)` and zeroes the rest (the same cut-off NumPy uses). A `rows x columns` matrix gives a `columns x rows` result.",
  ],
  howToTest:
    "Computes A⁺ of `[[1, 2], [3, 4], [5, 6]]`, checks it against the known answer `[[-1.3333, -0.3333, 0.6667], [1.0833, 0.3333, -0.4167]]`, and checks the defining property `A · A⁺ · A = A` within 1e-12.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "A",
      description: "Any matrix.",
      default: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    {
      key: "pinv",
      label: "Known pseudo-inverse",
      equals: "-1.3333,-0.3333,0.6667;1.0833,0.3333,-0.4167",
    },
    { key: "penroseError", label: "A · A⁺ · A = A", max: 1e-12 },
  ],
});
