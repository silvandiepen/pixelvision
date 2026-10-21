import { defineExample } from "../define";
import { demo } from "./demo";
import type { RodriguesDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const rodriguesExample = defineExample<RodriguesDemoOptions>({
  slug: "rodrigues",
  title: "rodrigues",
  functions: ["rodrigues"],
  category: "motion",
  description:
    "Converts between a rotation vector, three numbers, and a 3x3 rotation matrix. `solvePnP` returns rotations as vectors; convert one to a matrix to rotate points yourself.",
  howItWorks: [
    "A rotation vector points along the rotation axis, and its length is the angle in radians; a positive angle turns right-handed, so a quarter turn about z takes x to y. Rodrigues' formula `R = cos θ · I + (1 − cos θ) · k kᵀ + sin θ · [k]×` gives the matrix for axis `k` and angle `θ`.",
    "Back from a matrix, the angle comes from `atan2(sin θ, cos θ)` and the axis from the matrix's skew part; near a half turn, from its diagonal. A matrix that isn't exactly a rotation is first replaced by the nearest one. Rotations of any size round-trip, including ones under 1e-5 radians that OpenCV's `Rodrigues` turns into zero.",
  ],
  howToTest:
    "A quarter turn (90°) about z: Rodrigues' formula with cos θ = 0 and sin θ = 1 gives rows (0, −1, 0), (1, 0, 0), (0, 0, 1), which takes the x axis to (0, 1, 0). Converting the matrix back must give 90° again.",
  input: "none",
  controls: [
    {
      type: "select",
      key: "axis",
      label: "Axis",
      description: "The rotation axis.",
      options: [
        { label: "x", value: "x" },
        { label: "y", value: "y" },
        { label: "z", value: "z" },
        { label: "(1, 1, 1)", value: "xyz" },
      ],
      default: "z",
    },
    {
      type: "range",
      key: "angle",
      label: "Angle",
      description: "Rotation angle in degrees.",
      min: -180,
      max: 180,
      step: 1,
      default: 90,
    },
  ],
  code,
  demo,
  expectations: [
    {
      key: "matrix",
      label: "Rows (0, −1, 0), (1, 0, 0), (0, 0, 1)",
      equals: "0,-1,0 | 1,0,0 | 0,0,1",
    },
    { key: "xAxisTo", label: "x goes to y", equals: "0,1,0" },
    { key: "roundTripDegrees", label: "Back to 90°", equals: 90 },
  ],
});
