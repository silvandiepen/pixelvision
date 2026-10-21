import { createMatrix, detectArucoMarkers, generateArucoMarker } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { GenerateArucoMarkerDemoOptions } from "./demo.model";

/**
 * Draws a marker, reads its cells back and checks the detector recognises it.
 *
 * @param input - Id, dictionary, image size and border width.
 * @returns The marker, its cells and what the detector reads.
 */
export function demo({ options }: OptionsInput<GenerateArucoMarkerDemoOptions>): DemoOutput {
  const { id, dictionary, size, borderBits } = options;
  const marker = generateArucoMarker(id, { dictionary, size, borderBits });

  // The cells, sampled at their centres: 1 for white.
  const bits = dictionary === "4x4_50" ? 4 : 6;
  const cells = bits + 2 * borderBits;
  const rows = Array.from({ length: cells }, (_, row) =>
    Array.from({ length: cells }, (_, column) => {
      const x = Math.floor(((column + 0.5) * size) / cells);
      const y = Math.floor(((row + 0.5) * size) / cells);
      return marker.data[y * size + x] ? 1 : 0;
    }),
  );

  // On a white page with a margin, the detector must find this id.
  const margin = Math.round(size / 4);
  const page = createMatrix(size + 2 * margin, size + 2 * margin);
  page.data.fill(255);
  for (let y = 0; y < size; y++) {
    page.data.set(
      marker.data.subarray(y * size, (y + 1) * size),
      (y + margin) * page.width + margin,
    );
  }
  const found = detectArucoMarkers(page, { dictionary });

  return {
    images: [{ label: `${dictionary} marker ${id}`, image: marker }],
    tables: [{ label: "Cells (1 = white)", rows }],
    values: {
      size: marker.width,
      topInnerRow: rows[borderBits].slice(borderBits, borderBits + bits).join(""),
      whiteCells: rows.flat().filter((bit) => bit === 1).length,
      readBack: found.length === 1 ? found[0].id : -1,
    },
  };
}
