import { toImageData } from "pixelvision";
import type { Matrix, RGBAImage } from "pixelvision";
import { fnv1a } from "./checksum";
import type { DisplayPixels } from "./display.model";

/**
 * Tells a matrix from plain RGBA pixels.
 *
 * @param image - A `u8` matrix or RGBA pixels.
 * @returns `true` for a matrix.
 */
function isMatrix(image: Matrix<"u8"> | RGBAImage): image is Matrix<"u8"> {
  return "channels" in image && "type" in image;
}

/**
 * Prepares an output for a canvas: converts matrices to RGBA and makes
 * every pixel opaque, so warp fill (alpha 0) shows as black and the canvas
 * holds exactly these bytes (browsers premultiply alpha, which would lose
 * the colour of transparent pixels).
 *
 * @param image - A `u8` matrix with 1, 3 or 4 channels, or RGBA pixels.
 * @returns Opaque RGBA pixels and their hash.
 */
export function toDisplayPixels(image: Matrix<"u8"> | RGBAImage): DisplayPixels {
  const rgba = isMatrix(image) ? toImageData(image) : image;
  const data = new Uint8ClampedArray(rgba.width * rgba.height * 4);
  data.set(rgba.data.subarray(0, data.length));
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  return { width: rgba.width, height: rgba.height, data, checksum: fnv1a(data) };
}
