import { matrixFromRows, svdSolve } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import { round } from "../../utils/format";
import { blankImage } from "../../utils/visualize";
import type { SvdSolveDemoOptions } from "./demo.model";

/**
 * Fits a straight line y = c0 + c1 · x through points by least squares.
 *
 * @param input - The points, one `[x, y]` per row.
 * @returns The fitted line, drawn through the points.
 */
export function demo({ options }: OptionsInput<SvdSolveDemoOptions>): DemoOutput {
  // One equation per point: c0 · 1 + c1 · x = y. More equations than unknowns.
  const a = matrixFromRows(options.points.map(([x]) => [1, x]));
  const b = options.points.map(([, y]) => y);
  const [c0, c1] = svdSolve(a, b);

  // Plot: x 0–5 and y 0–12 onto a 320 x 240 canvas.
  const toCanvas = (x: number, y: number) => ({ x: 20 + x * 56, y: 225 - y * 17 });
  return {
    images: [
      {
        label: `y = ${round(c0, 3)} + ${round(c1, 3)} · x`,
        image: blankImage(320, 240),
        overlay: {
          points: options.points.map(([x, y]) => toCanvas(x, y)),
          lines: [{ from: toCanvas(0, c0), to: toCanvas(5, c0 + 5 * c1) }],
        },
      },
    ],
    tables: [
      {
        label: "Coefficients",
        columns: ["c0 (intercept)", "c1 (slope)"],
        rows: [[round(c0, 9), round(c1, 9)]],
      },
    ],
    values: { intercept: round(c0, 9), slope: round(c1, 9) },
  };
}
