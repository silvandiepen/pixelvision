// CommonJS usage: this file compiles to `require("pixelvision")`, which
// resolves pixelvision to its CommonJS build.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { extractDocument, findDocument } from "pixelvision";
import { decodePgm, encodePgm } from "./pgm.cjs";
import type { ScanResult } from "./scan.model.js";

/**
 * Finds the document in an image file and writes it straightened.
 *
 * @param input - Path of a gray PGM image.
 * @param output - Where to write the straightened document (PGM).
 * @returns The corners and the output size, or null when there's no document (nothing is written).
 */
export async function scanFile(input: string, output: string): Promise<ScanResult | null> {
  const image = decodePgm(await readFile(input));
  const found = findDocument(image);
  if (!found) return null;
  const document = extractDocument(image, found.corners);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, encodePgm(document));
  return { corners: found.corners, width: document.width, height: document.height };
}
