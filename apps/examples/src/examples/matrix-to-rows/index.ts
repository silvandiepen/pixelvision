import { defineExample } from "../define";
import { demo } from "./demo";
import type { MatrixToRowsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const matrixToRowsExample = defineExample<MatrixToRowsDemoOptions>({
  slug: "matrix-to-rows",
  title: "matrixToRows",
  functions: ["matrixToRows"],
  category: "math",
  description:
    "Reads a single-channel matrix back as nested arrays, for printing, JSON or comparing in tests.",
  howItWorks: [
    "Row `y` is `data[y * width]` up to `data[(y + 1) * width]`, converted to plain numbers. It is the inverse of `matrixFromRows`.",
  ],
  howToTest:
    "Fills a 4 x 3 `f32` matrix with 0, 1, 2, … and checks it reads back as three rows ending in `8, 9, 10, 11`, and that `matrixFromRows` of the rows gives the same values.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "width",
      label: "Width",
      description: "Columns of the matrix.",
      min: 1,
      max: 8,
      step: 1,
      default: 4,
    },
    {
      type: "range",
      key: "height",
      label: "Height",
      description: "Rows of the matrix.",
      min: 1,
      max: 8,
      step: 1,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "rowCount", label: "Three rows", equals: 3 },
    { key: "lastRow", label: "Last row in order", equals: "8,9,10,11" },
    { key: "roundTrip", label: "matrixFromRows gives it back", equals: true },
  ],
});
