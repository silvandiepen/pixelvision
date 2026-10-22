import { createMatrix, grayscale, measureMotion, regionPatch, resample } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { PORTRAIT_FACE } from "../../samples/samples";
import type { RegionPatchDemoOptions } from "./demo.model";

/**
 * A copy of a gray image moved right by `shift` pixels, as if the head moved.
 *
 * @param gray - The image.
 * @param shift - Pixels to move it.
 * @returns The moved copy.
 */
function moved(gray: Matrix<"u8">, shift: number): Matrix<"u8"> {
  const out = createMatrix(gray.width, gray.height);
  for (let y = 0; y < gray.height; y++) {
    for (let x = 0; x < gray.width; x++) {
      out.data[y * gray.width + x] = gray.data[y * gray.width + Math.max(0, x - shift)];
    }
  }
  return out;
}

/**
 * Shrinks the face region of a frame to 16 x 16 mean gray levels, and
 * compares it with the same region in a later frame: the same frame again
 * (a frozen picture), and one where the head moved by `shift` pixels.
 *
 * @param input - The photo and how far the head moves.
 * @returns The patches and how much they changed.
 */
export function demo({ image, options }: DemoInput<RegionPatchDemoOptions>): DemoOutput {
  const gray = grayscale(image);
  const face = {
    x: PORTRAIT_FACE.x - PORTRAIT_FACE.width / 2,
    y: PORTRAIT_FACE.y - PORTRAIT_FACE.height / 2,
    width: PORTRAIT_FACE.width,
    height: PORTRAIT_FACE.height,
  };
  const before = regionPatch(gray, face)!;
  const frozen = measureMotion(before, regionPatch(gray, face))!;
  const after = regionPatch(moved(gray, options.shift), face)!;
  const live = measureMotion(before, after)!;

  // The patch as a picture, scaled up so its cells show.
  const toImage = (cells: Float32Array): Matrix<"u8"> =>
    resample(createMatrix(16, 16, { data: Uint8Array.from(cells) }), { width: 160, height: 160 });

  return {
    images: [
      { label: "Face region", image, overlay: { polygons: [corners(face)] } },
      { label: "Patch, this frame", image: toImage(before.cells) },
      { label: "Patch, head moved", image: toImage(after.cells) },
    ],
    values: { frozen: round(frozen), moved: round(live) },
  };
}

/**
 * Rounds to 4 decimals.
 *
 * @param n - The number.
 * @returns It, rounded.
 */
const round = (n: number) => Math.round(n * 10_000) / 10_000;

/**
 * The corners of a box.
 *
 * @param box - The box.
 * @returns Its corners, clockwise from the top left.
 */
const corners = (box: { x: number; y: number; width: number; height: number }) => [
  { x: box.x, y: box.y },
  { x: box.x + box.width, y: box.y },
  { x: box.x + box.width, y: box.y + box.height },
  { x: box.x, y: box.y + box.height },
];
