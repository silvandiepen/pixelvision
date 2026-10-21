import { defineExample } from "../define";
import { demo } from "./demo";
import type { MatrixFromRowsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const matrixFromRowsExample = defineExample<MatrixFromRowsDemoOptions>({
  slug: "matrix-from-rows",
  title: "matrixFromRows",
  functions: ["matrixFromRows"],
  category: "math",
  description:
    "Builds a numeric matrix from nested arrays, the easy way to write a matrix by hand for the linear algebra functions.",
  howItWorks: [
    "The rows become `height`, their length `width`, and the values are copied row by row into an `f64` matrix with one channel. Rows of different lengths throw a `RangeError`.",
  ],
  howToTest:
    "Builds the default 2 x 3 matrix and checks it's `f64`, 3 wide, 2 high, with data `1, 2, 3, 4, 5, 6` in row order.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "rows",
      label: "Rows",
      description: "Values row by row.",
      default: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "type", label: "Double precision", equals: "f64" },
    { key: "width", label: "3 columns", equals: 3 },
    { key: "height", label: "2 rows", equals: 2 },
    { key: "data", label: "Row by row", equals: "1,2,3,4,5,6" },
  ],
});
