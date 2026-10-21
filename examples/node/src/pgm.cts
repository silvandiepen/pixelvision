import type { Matrix } from "pixelvision";

/**
 * Reads the next whitespace-separated header field of a PGM file, skipping
 * `#` comments.
 *
 * @param bytes - The file.
 * @param start - Where to start reading.
 * @returns The field and the offset just after it.
 */
function headerField(bytes: Uint8Array, start: number): { value: string; end: number } {
  let i = start;
  for (;;) {
    while (i < bytes.length && /\s/.test(String.fromCharCode(bytes[i]))) i++;
    if (bytes[i] !== 0x23) break;
    while (i < bytes.length && bytes[i] !== 0x0a) i++;
  }
  let value = "";
  while (i < bytes.length && !/\s/.test(String.fromCharCode(bytes[i]))) {
    value += String.fromCharCode(bytes[i++]);
  }
  return { value, end: i };
}

/**
 * Decodes a binary PGM (`P5`, 8-bit) image: the simplest gray image format,
 * a short text header followed by one byte per pixel.
 *
 * @param bytes - The file's contents.
 * @returns A gray `u8` matrix.
 * @throws {Error} When the file isn't an 8-bit binary PGM.
 */
export function decodePgm(bytes: Uint8Array): Matrix<"u8"> {
  const magic = headerField(bytes, 0);
  const width = headerField(bytes, magic.end);
  const height = headerField(bytes, width.end);
  const maxValue = headerField(bytes, height.end);
  if (magic.value !== "P5" || maxValue.value !== "255") {
    throw new Error("Expected an 8-bit binary PGM (P5, maximum value 255)");
  }
  const size = Number(width.value) * Number(height.value);
  // A single whitespace byte separates the header from the pixels.
  const start = maxValue.end + 1;
  if (bytes.length < start + size) throw new Error("The PGM file is truncated");
  return {
    type: "u8",
    width: Number(width.value),
    height: Number(height.value),
    channels: 1,
    data: bytes.slice(start, start + size),
  };
}

/**
 * Encodes a gray matrix as a binary PGM (`P5`) file.
 *
 * @param image - A 1-channel `u8` matrix.
 * @returns The file's contents.
 * @throws {Error} When the matrix has more than one channel.
 */
export function encodePgm(image: Matrix<"u8">): Uint8Array {
  if (image.channels !== 1) throw new Error("PGM holds gray images only");
  const header = new TextEncoder().encode(`P5\n${image.width} ${image.height}\n255\n`);
  const size = image.width * image.height;
  const bytes = new Uint8Array(header.length + size);
  bytes.set(header);
  bytes.set(image.data.subarray(0, size), header.length);
  return bytes;
}
