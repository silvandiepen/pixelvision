import { assertChannels, assertInteger, assertType } from "../core/assert";
import { prepareOutput } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { saturateU8 } from "../core/round";
import type { ClaheOptions } from "./clahe.model";

const f32 = Math.fround;

/**
 * Maps a position outside `0..size-1` back inside by mirroring without
 * repeating the edge (OpenCV's `BORDER_REFLECT_101`).
 *
 * @param p - Position, possibly outside.
 * @param size - Number of pixels along the axis.
 * @returns A position inside.
 */
function reflect101(p: number, size: number): number {
  if (size === 1) return 0;
  while (p < 0 || p >= size) p = p < 0 ? -p : 2 * size - 2 - p;
  return p;
}

/**
 * Contrast Limited Adaptive Histogram Equalization, as OpenCV's
 * `createCLAHE(clipLimit, tileGridSize).apply`: the image is cut into tiles,
 * each tile's histogram is equalised with its peaks clipped at `clipLimit`,
 * and every pixel blends the mappings of the four nearest tiles. Brings out
 * detail in shadows and highlights without the blown-out look and noise of
 * a global equalisation.
 *
 * When the size doesn't divide into the grid, the tiles are measured on the
 * image mirrored past its right and bottom edges, as OpenCV does. Results
 * match OpenCV exactly.
 *
 * @param image - Single-channel `u8` matrix.
 * @param options - `clipLimit`, `tileGridSize` and `out`.
 * @returns The equalised `u8` matrix.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it has more than one channel, the clip limit isn't finite or the grid isn't whole numbers of 1 or more.
 *
 * @example
 * const detail = clahe(gray, { clipLimit: 2, tileGridSize: { width: 8, height: 8 } });
 */
export function clahe(image: Matrix<"u8">, options: ClaheOptions = {}): Matrix<"u8"> {
  assertType("clahe", image, "u8");
  assertChannels("clahe", image, 1);
  const { clipLimit = 40, tileGridSize = { width: 8, height: 8 } } = options;
  const tilesX = tileGridSize.width;
  const tilesY = tileGridSize.height;
  assertInteger("clahe", "tileGridSize.width", tilesX, 1);
  assertInteger("clahe", "tileGridSize.height", tilesY, 1);
  if (!Number.isFinite(clipLimit)) {
    throw new RangeError(`clahe: clipLimit must be finite, got ${clipLimit}`);
  }
  const { width: w, height: h, data } = image;
  const out = prepareOutput(options.out, "u8", w, h, 1);
  if (w === 0 || h === 0) return out;

  // Tiles are measured on the image extended to a whole number of tiles.
  const exact = w % tilesX === 0 && h % tilesY === 0;
  const tileW = exact ? w / tilesX : (w + tilesX - (w % tilesX)) / tilesX;
  const tileH = exact ? h / tilesY : (h + tilesY - (h % tilesY)) / tilesY;
  const area = tileW * tileH;
  const lutScale = f32(255 / area);
  const limit = clipLimit > 0 ? Math.max(Math.trunc((clipLimit * area) / 256), 1) : 0;

  const luts = new Uint8Array(tilesX * tilesY * 256);
  const histogram = new Int32Array(256);
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      histogram.fill(0);
      for (let y = ty * tileH; y < (ty + 1) * tileH; y++) {
        const row = reflect101(y, h) * w;
        for (let x = tx * tileW; x < (tx + 1) * tileW; x++)
          histogram[data[row + reflect101(x, w)]]++;
      }
      if (limit > 0) {
        let clipped = 0;
        for (let i = 0; i < 256; i++) {
          if (histogram[i] > limit) {
            clipped += histogram[i] - limit;
            histogram[i] = limit;
          }
        }
        const batch = Math.trunc(clipped / 256);
        let residual = clipped - batch * 256;
        for (let i = 0; i < 256; i++) histogram[i] += batch;
        const step = Math.max(Math.trunc(256 / residual), 1);
        for (let i = 0; i < 256 && residual > 0; i += step, residual--) histogram[i]++;
      }
      const lut = (ty * tilesX + tx) * 256;
      for (let i = 0, sum = 0; i < 256; i++) {
        sum += histogram[i];
        luts[lut + i] = saturateU8(f32(sum * lutScale));
      }
    }
  }

  // Each pixel blends the four tiles whose centres surround it.
  const invTileW = f32(1 / tileW);
  const invTileH = f32(1 / tileH);
  const left = new Int32Array(w);
  const right = new Int32Array(w);
  const xWeight = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    const txf = f32(f32(x * invTileW) - 0.5);
    const tx = Math.floor(txf);
    xWeight[x] = f32(txf - tx);
    left[x] = Math.max(tx, 0) * 256;
    right[x] = Math.min(tx + 1, tilesX - 1) * 256;
  }
  for (let y = 0; y < h; y++) {
    const tyf = f32(f32(y * invTileH) - 0.5);
    const ty = Math.floor(tyf);
    const ya = f32(tyf - ty);
    const ya1 = f32(1 - ya);
    const top = Math.max(ty, 0) * tilesX * 256;
    const bottom = Math.min(ty + 1, tilesY - 1) * tilesX * 256;
    for (let x = 0; x < w; x++) {
      const v = data[y * w + x];
      const xa = xWeight[x];
      const xa1 = f32(1 - xa);
      const upper = f32(f32(luts[top + left[x] + v] * xa1) + f32(luts[top + right[x] + v] * xa));
      const lower = f32(
        f32(luts[bottom + left[x] + v] * xa1) + f32(luts[bottom + right[x] + v] * xa),
      );
      out.data[y * w + x] = saturateU8(f32(f32(upper * ya1) + f32(lower * ya)));
    }
  }
  return out;
}
