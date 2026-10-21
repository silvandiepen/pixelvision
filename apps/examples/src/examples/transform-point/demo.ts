import { transformPoint } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round } from "../../utils/format";
import type { TransformPointDemoOptions } from "./demo.model";

/**
 * Applies a 3x3 transform to a point.
 *
 * @param input - The transform (rows) and the point.
 * @returns The transformed point.
 */
export function demo({ options }: OptionsInput<TransformPointDemoOptions>): DemoOutput {
  const transform = options.transform.flat(); // 9 numbers, row by row
  const point = { x: options.x, y: options.y };
  const result = transformPoint(transform, point);

  return {
    tables: [
      {
        label: "Point",
        columns: ["", "x", "y"],
        rows: [
          ["before", point.x, point.y],
          ["after", round(result.x, 6), round(result.y, 6)],
        ],
      },
    ],
    values: { x: round(result.x, 6), y: round(result.y, 6) },
  };
}
