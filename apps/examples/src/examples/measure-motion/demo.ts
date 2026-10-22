import { measureMotion } from "pixelvision";
import type { RegionPatch } from "pixelvision";
import type { DemoOutput } from "../example.model";

/**
 * A 16 x 16 patch whose cells follow a pattern, shifted by `offset` gray levels.
 *
 * @param offset - Gray levels added to every cell.
 * @returns The patch.
 */
function patch(offset: number): RegionPatch {
  const cells = new Float32Array(256);
  for (let i = 0; i < 256; i++) cells[i] = Math.min(255, ((i * 37) % 200) + offset);
  return { size: 16, cells };
}

/**
 * Compares a face patch with later ones: the same (a frozen picture), a
 * little brighter (breathing, a blink, sensor noise) and much changed (the
 * head turned).
 *
 * @returns The motion of each.
 */
export function demo(): DemoOutput {
  const before = patch(0);
  const rows: [string, number][] = [
    ["The same frame again", measureMotion(before, patch(0))!],
    ["One gray level brighter", measureMotion(before, patch(1))!],
    ["Ten gray levels brighter", measureMotion(before, patch(10))!],
    [
      "A different size of patch",
      measureMotion(before, { size: 8, cells: new Float32Array(64) }) ?? -1,
    ],
  ];
  return {
    tables: [
      {
        label: "Motion between two patches",
        columns: ["Second frame", "Motion (0–1)"],
        rows: rows.map(([label, value]) => [label, value < 0 ? "undefined" : value.toFixed(4)]),
      },
    ],
    values: { frozen: rows[0][1], slight: Math.round(rows[1][1] * 10_000) / 10_000 },
  };
}
