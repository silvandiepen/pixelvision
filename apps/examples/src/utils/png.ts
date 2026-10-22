import type { RGBAImage } from "pixelvision";

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** Bytes per pixel of each supported colour type: gray, RGB, gray + alpha, RGBA. */
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 4: 2, 6: 4 };

/**
 * Inflates zlib data with the platform's `DecompressionStream`, which
 * browsers and Node both have.
 *
 * @param data - zlib-compressed bytes.
 * @returns The inflated bytes.
 */
async function inflate(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * The Paeth predictor of the PNG specification.
 *
 * @param a - Left.
 * @param b - Above.
 * @param c - Above left.
 * @returns The predicted value.
 */
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/**
 * Decodes an 8-bit, non-interlaced PNG (gray, RGB, gray + alpha or RGBA)
 * into RGBA pixels.
 *
 * The sample photos are decoded here rather than through a canvas so their
 * pixels are exactly the same in every browser and in Node: browsers may
 * colour-manage what they draw, and then the demos' checks would see
 * slightly different pixels in each.
 *
 * @param bytes - The PNG file.
 * @returns Its pixels.
 * @throws {Error} When the file isn't a PNG this supports.
 */
export async function decodePng(bytes: Uint8Array): Promise<RGBAImage> {
  if (SIGNATURE.some((value, i) => bytes[i] !== value)) throw new Error("Not a PNG file");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0;
  let height = 0;
  let channels = 0;
  const parts: Uint8Array[] = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    const body = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
      const [depth, colour, , , interlace] = body.subarray(8, 13);
      channels = CHANNELS[colour] ?? 0;
      if (depth !== 8 || channels === 0 || interlace !== 0) {
        throw new Error("Only 8-bit, non-interlaced gray, RGB or RGBA PNGs are supported");
      }
    } else if (type === "IDAT") {
      parts.push(body);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }
  const compressed = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    compressed.set(part, at);
    at += part.length;
  }
  const raw = await inflate(compressed);

  // Undo each row's filter, in place.
  const stride = width * channels;
  const rows = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const source = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = rows.subarray(y * stride, (y + 1) * stride);
    const above = y > 0 ? rows.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = above ? above[x] : 0;
      const upLeft = above && x >= channels ? above[x - channels] : 0;
      const predicted =
        filter === 1
          ? left
          : filter === 2
            ? up
            : filter === 3
              ? (left + up) >> 1
              : filter === 4
                ? paeth(left, up, upLeft)
                : 0;
      row[x] = (source[x] + predicted) & 255;
    }
  }

  const data = new Uint8ClampedArray(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    const s = p * channels;
    const gray = channels <= 2;
    data[p * 4] = rows[s];
    data[p * 4 + 1] = gray ? rows[s] : rows[s + 1];
    data[p * 4 + 2] = gray ? rows[s] : rows[s + 2];
    data[p * 4 + 3] = channels === 4 ? rows[s + 3] : channels === 2 ? rows[s + 1] : 255;
  }
  return { width, height, data };
}
