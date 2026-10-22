import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { decodePng } from "./png";

/**
 * Builds a PNG chunk (the CRC isn't checked by the decoder, so it's zero).
 *
 * @param type - Four-letter chunk type.
 * @param body - Its data.
 * @returns The chunk's bytes.
 */
const chunk = (type: string, body: Uint8Array): Uint8Array => {
  const out = new Uint8Array(12 + body.length);
  new DataView(out.buffer).setUint32(0, body.length);
  out.set(
    [...type].map((c) => c.charCodeAt(0)),
    4,
  );
  out.set(body, 8);
  return out;
};

/**
 * Builds a PNG from filtered rows.
 *
 * @param width - Pixels across.
 * @param colour - Colour type: 0 gray, 2 RGB, 4 gray + alpha, 6 RGBA.
 * @param rows - Each row: its filter byte, then the filtered bytes.
 * @param options - Bit depth and interlacing, for the error cases.
 * @returns The file.
 */
const png = (
  width: number,
  colour: number,
  rows: number[][],
  { depth = 8, interlace = 0 } = {},
): Uint8Array => {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, rows.length);
  header.set([depth, colour, 0, 0, interlace], 8);
  const data = deflateSync(Uint8Array.from(rows.flat()));
  const parts = [
    Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("tEXt", new Uint8Array([65, 0, 66])),
    chunk("IDAT", data.subarray(0, 4)),
    chunk("IDAT", data.subarray(4)),
    chunk("IEND", new Uint8Array(0)),
  ];
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

describe("decodePng", () => {
  it("undoes every filter type", async () => {
    // Gray, 3 pixels wide. Each row decodes to [10, 20, 30] + 10 per row.
    const image = await decodePng(
      png(3, 0, [
        [0, 10, 20, 30], // none
        [1, 20, 10, 10], // sub: 20, 30, 40
        [2, 10, 10, 10], // up: 30, 40, 50
        [3, 25, 10, 10], // average: 40, 50, 60
        [4, 10, 10, 10], // Paeth: 50, 60, 70
      ]),
    );
    const grays = Array.from({ length: 15 }, (_, i) => image.data[i * 4]);
    expect(grays).toEqual([10, 20, 30, 20, 30, 40, 30, 40, 50, 40, 50, 60, 50, 60, 70]);
  });

  it("reads RGB, gray with alpha and RGBA", async () => {
    const rgb = await decodePng(png(1, 2, [[0, 1, 2, 3]]));
    expect(Array.from(rgb.data)).toEqual([1, 2, 3, 255]);
    const grayAlpha = await decodePng(png(1, 4, [[0, 7, 8]]));
    expect(Array.from(grayAlpha.data)).toEqual([7, 7, 7, 8]);
    const rgba = await decodePng(png(1, 6, [[0, 1, 2, 3, 4]]));
    expect(Array.from(rgba.data)).toEqual([1, 2, 3, 4]);
  });

  it("rejects what it doesn't support", async () => {
    await expect(decodePng(new Uint8Array(16))).rejects.toThrow("Not a PNG");
    await expect(decodePng(png(1, 3, [[0, 1]]))).rejects.toThrow("Only 8-bit");
    await expect(decodePng(png(1, 0, [[0, 1]], { depth: 16 }))).rejects.toThrow("Only 8-bit");
    await expect(decodePng(png(1, 0, [[0, 1]], { interlace: 1 }))).rejects.toThrow("Only 8-bit");
  });
});
