import { cloneMatrix, grayscale, morphology, threshold } from "pixelvision";
import type { Matrix } from "pixelvision";
import type { DemoInput, DemoOutput } from "../example.model";
import { seededRandom } from "../../samples/random";
import type { MorphologyDemoOptions } from "./demo.model";

/**
 * Makes a mask of the dark shapes, adds specks outside them and pinholes
 * inside them, then cleans it with an opening, a closing or the gradient.
 *
 * @param input - The image, the operation and the radius.
 * @returns The damaged mask and the result.
 */
export function demo({ image, options }: DemoInput<MorphologyDemoOptions>): DemoOutput {
  const clean = threshold(grayscale(image), { invert: true }); // shapes white
  const { width, height } = clean;
  const at = (m: Matrix<"u8">, x: number, y: number) => m.data[y * width + x];

  // Single-pixel specks well away from the shapes, and pinholes well inside them.
  const damaged = cloneMatrix(clean);
  const specks: number[] = [];
  const holes: number[] = [];
  const random = seededRandom(9);
  while (specks.length < 150 || holes.length < 150) {
    const x = 3 + Math.floor(random() * (width - 6));
    const y = 3 + Math.floor(random() * (height - 6));
    let sum = 0;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) sum += at(clean, x + dx, y + dy);
    if (sum === 0 && specks.length < 150) specks.push(y * width + x);
    if (sum === 25 * 255 && holes.length < 150) holes.push(y * width + x);
  }
  for (const i of specks) damaged.data[i] = 255;
  for (const i of holes) damaged.data[i] = 0;

  const result = morphology(damaged, options.operation, { radius: options.radius });
  const set = (indices: number[]) => indices.filter((i) => result.data[i] !== 0).length;

  return {
    images: [
      { label: "Mask with specks and pinholes", image: damaged },
      { label: options.operation[0].toUpperCase() + options.operation.slice(1), image: result },
    ],
    values: {
      specksLeft: set(specks),
      holesLeft: holes.length - set(holes),
      // The red rectangle's middle: white for open and close, black for the gradient (no edge there).
      rectangleMiddle: at(result, 72, 60),
    },
  };
}
