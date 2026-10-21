import { defineExample } from "../define";
import { demo } from "./demo";
import type { EigenSymmetricDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const eigenSymmetricExample = defineExample<EigenSymmetricDemoOptions>({
  slug: "eigen-symmetric",
  title: "eigenSymmetric",
  functions: ["eigenSymmetric"],
  category: "math",
  description:
    "Finds the eigenvalues and eigenvectors of a symmetric matrix: the directions it only stretches. Used for corner detection (the structure tensor) and principal component analysis.",
  howItWorks: [
    "Jacobi rotations: it repeatedly picks an off-diagonal entry and applies the plane rotation that zeroes it, until the matrix is diagonal to double precision. The diagonal then holds the eigenvalues (sorted, largest first) and the accumulated rotations the eigenvectors. Only the upper triangle is read.",
  ],
  howToTest:
    "Decomposes `[[4, 1, 0], [1, 4, 0], [0, 0, 2]]`, whose eigenvalues are exactly 5, 3 and 2, and checks `A · v = λ · v` for each eigenvector within 1e-12.",
  input: "none",
  controls: [
    {
      type: "matrix",
      key: "a",
      label: "A",
      description: "Square symmetric matrix (the upper triangle is used).",
      default: [
        [4, 1, 0],
        [1, 4, 0],
        [0, 0, 2],
      ],
    },
  ],
  code,
  demo,
  expectations: [
    { key: "eigenvalues", label: "5, 3 and 2", equals: "5,3,2" },
    { key: "residual", label: "A · v = λ · v", max: 1e-12 },
  ],
});
