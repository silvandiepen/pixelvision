import { defineExample } from "../define";
import { demo } from "./demo";
import type { Determinant3x3DemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const determinant3x3Example = defineExample<Determinant3x3DemoOptions>({
  slug: "determinant3x3",
  title: "determinant3x3",
  functions: ["determinant3x3"],
  category: "math",
  description:
    "Computes the determinant of a 3 x 3 matrix: how much it scales areas (as a 2D transform) and whether it can be inverted (non-zero).",
  howItWorks: [
    "Expansion along the first row: `a(ei − fh) − b(di − fg) + c(dh − eg)`. A determinant of 0 means the rows are linearly dependent; a negative one means the transform mirrors.",
  ],
  howToTest:
    "Computes the determinant of the default matrix by hand: 4(18 − 5) − 7(9 − 2) + 2(15 − 12) = 9, and checks the function returns exactly that.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "m",
      label: "M",
      description: "The 3 x 3 matrix.",
      default: [
        [4, 7, 2],
        [3, 6, 1],
        [2, 5, 3],
      ],
    },
  ],
  code,
  demo,
  expectations: [{ key: "determinant", label: "Worked out by hand", equals: 9 }],
});
