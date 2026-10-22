import { readFileSync } from "node:fs";
import jpeg from "jpeg-js";
import type { Fixture } from "./fixtures.model";
import type { PhotoManifest, PhotoPoint } from "./photos.model";

const directory = new URL("../fixtures/photos/", import.meta.url);

/**
 * Reads `fixtures/photos/manifest.json`: the photos and their labels.
 *
 * @returns The manifest.
 */
export const photoManifest = (): PhotoManifest =>
  JSON.parse(readFileSync(new URL("manifest.json", directory), "utf8")) as PhotoManifest;

/**
 * Decodes a photo from `fixtures/photos/` into RGBA pixels.
 *
 * @param file - File name in the folder.
 * @returns The photo, named after the file.
 */
export const loadPhoto = (file: string): Fixture => {
  const decoded = jpeg.decode(readFileSync(new URL(file, directory)), {
    useTArray: true,
    formatAsRGBA: true,
  });
  return {
    name: file,
    width: decoded.width,
    height: decoded.height,
    data: new Uint8ClampedArray(
      decoded.data.buffer,
      decoded.data.byteOffset,
      decoded.data.byteLength,
    ),
  };
};

/**
 * The largest distance between matching corners of two quadrilaterals.
 *
 * @param found - Found corners, in the same order as `labelled`.
 * @param labelled - Labelled corners.
 * @returns Pixels.
 */
export const largestCornerError = (
  found: readonly { x: number; y: number }[],
  labelled: readonly PhotoPoint[],
): number => Math.max(...labelled.map(([x, y], i) => Math.hypot(found[i].x - x, found[i].y - y)));
