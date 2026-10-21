import { defineExample } from "../define";
import { demo } from "./demo";
import type { TransposeDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const transposeExample = defineExample<TransposeDemoOptions>({
  slug: "transpose",
  title: "transpose",
  functions: ["transpose"],
  category: "math",
  description: "Flips a matrix over its diagonal: rows become columns.",
  howItWorks: [
    "Entry `(i, j)` of the result is entry `(j, i)` of the input, so a `rows x columns` matrix becomes `columns x rows`. The result is a new `f64` matrix. If you only need `Aᵀ` inside a product, `multiply` with `transposeA`/`transposeB` avoids the copy.",
  ],
  howToTest:
    "Transposes the default 2 x 3 matrix `[[1, 2, 3], [4, 5, 6]]` and checks the result is 3 rows by 2 columns with first row `1, 4`.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "A",
      description: "The matrix to transpose.",
      default: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "width", label: "2 columns", equals: 2 },
    { key: "height", label: "3 rows", equals: 3 },
    { key: "firstRow", label: "First column became the first row", equals: "1,4" },
  ],
});
