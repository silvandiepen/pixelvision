import { defineExample } from "../define";
import { demo } from "./demo";
import type { Invert3x3DemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const invert3x3Example = defineExample<Invert3x3DemoOptions>({
  slug: "invert3x3",
  title: "invert3x3",
  functions: ["invert3x3"],
  category: "math",
  description:
    "Inverts a 3 x 3 matrix, e.g. to turn a transform that maps A to B into one that maps B to A.",
  howItWorks: [
    "Closed form: each entry of the inverse is a 2 x 2 cofactor divided by the determinant. When the determinant is 0 (or tiny relative to the entries) the matrix has no inverse and it throws a `RangeError`; jsfeat returned infinities. Try making one row a multiple of another.",
  ],
  howToTest:
    "Inverts the default matrix (determinant 9) and checks that `M · M⁻¹` equals the identity to within 1e-12.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "m",
      label: "M",
      description: "The matrix to invert.",
      default: [
        [4, 7, 2],
        [3, 6, 1],
        [2, 5, 3],
      ],
    },
  ],
  code,
  demo,
  expectations: [{ key: "identityError", label: "M · M⁻¹ = I", max: 1e-12 }],
});
