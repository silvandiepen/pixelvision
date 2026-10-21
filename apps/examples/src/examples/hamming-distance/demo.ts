import { createMatrix, hammingDistance } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { HammingDistanceDemoOptions } from "./demo.model";

/**
 * Counts the differing bits between two rows of bytes.
 *
 * @param input - Two descriptors of equal length, as bytes.
 * @returns The distance, and both rows written out in bits.
 */
export function demo({ options }: OptionsInput<HammingDistanceDemoOptions>): DemoOutput {
  const bytesA = options.a[0];
  const bytesB = options.b[0];
  const a = createMatrix(bytesA.length, 1, { data: Uint8Array.from(bytesA) });
  const b = createMatrix(bytesB.length, 1, { data: Uint8Array.from(bytesB) });
  const distance = hammingDistance(a, 0, b, 0);

  const bitsOf = (bytes: number[]) =>
    bytes.map((v) => (v & 255).toString(2).padStart(8, "0")).join(" ");
  return {
    tables: [
      {
        label: "Bits",
        columns: ["", "bits"],
        rows: [
          ["a", bitsOf(bytesA)],
          ["b", bitsOf(bytesB)],
        ],
      },
    ],
    values: { distance },
  };
}
