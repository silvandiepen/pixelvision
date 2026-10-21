import { rodrigues } from "pixelvision";
import type { Vec3 } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round, roundRows, toRows } from "../../utils/format";
import type { RodriguesDemoOptions } from "./demo.model";

/**
 * Turns a rotation vector into a matrix and back, and rotates the x axis.
 *
 * @param input - The axis (`"x"`, `"y"`, `"z"` or `"xyz"`) and the angle in degrees.
 * @returns The matrix, the vector it converts back to, and checks.
 */
export function demo({ options }: OptionsInput<RodriguesDemoOptions>): DemoOutput {
  const axis: Vec3 = [
    options.axis.includes("x") ? 1 : 0,
    options.axis.includes("y") ? 1 : 0,
    options.axis.includes("z") ? 1 : 0,
  ];
  const length = Math.hypot(...axis);
  const radians = (options.angle * Math.PI) / 180;
  const vector = axis.map((a) => (a / length) * radians) as Vec3;

  const matrix = rodrigues(vector);
  const back = rodrigues(matrix);
  // The first column: where the x axis ends up.
  const x = [matrix[0], matrix[3], matrix[6]].map((v) => round(v, 9));

  return {
    tables: [
      { label: "Rotation vector (radians)", rows: [vector.map((v) => round(v, 9))] },
      { label: "Rotation matrix", rows: roundRows(toRows(matrix, 3), 9) },
      { label: "Back to a vector", rows: [back.map((v) => round(v, 9))] },
    ],
    values: {
      matrix: roundRows(toRows(matrix, 3), 9)
        .map((row) => row.join(","))
        .join(" | "),
      xAxisTo: x.join(","),
      roundTripDegrees: round((Math.hypot(...back) * 180) / Math.PI, 9),
    },
  };
}
