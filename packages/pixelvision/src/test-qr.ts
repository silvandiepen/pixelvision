// A small QR encoder for tests (versions 1-10, every level and mask), written
// separately from the decoder so the two check each other; OpenCV's decoder
// checks both in the parity tests.
import { createMatrix } from "./core/matrix";
import type { Matrix } from "./core/matrix.model";
import { perspectiveTransform, transformPoint } from "./math/transforms";
import type { Point } from "./math/transforms.model";
import { drawQuad } from "./test-images";

/** A segment of QR data, or raw bits for malformed streams. */
export type QrSegment =
  | { mode: "numeric"; text: string }
  | { mode: "alphanumeric"; text: string }
  | { mode: "byte"; bytes: ArrayLike<number> }
  | { mode: "eci"; designator: number }
  | { mode: "raw"; bits: [value: number, length: number][] };

/** Encoder settings. */
export interface QrEncodeOptions {
  version: number;
  level?: "L" | "M" | "Q" | "H";
  mask?: number;
}

// ISO/IEC 18004 Table 9: per version, per level L, M, Q, H:
// total codewords per block group as [blocks, total, data], and so on.
const BLOCKS: Record<number, Record<string, number[][]>> = {
  1: { L: [[1, 26, 19]], M: [[1, 26, 16]], Q: [[1, 26, 13]], H: [[1, 26, 9]] },
  2: { L: [[1, 44, 34]], M: [[1, 44, 28]], Q: [[1, 44, 22]], H: [[1, 44, 16]] },
  3: { L: [[1, 70, 55]], M: [[1, 70, 44]], Q: [[2, 35, 17]], H: [[2, 35, 13]] },
  4: { L: [[1, 100, 80]], M: [[2, 50, 32]], Q: [[2, 50, 24]], H: [[4, 25, 9]] },
  5: {
    L: [[1, 134, 108]],
    M: [[2, 67, 43]],
    Q: [
      [2, 33, 15],
      [2, 34, 16],
    ],
    H: [
      [2, 33, 11],
      [2, 34, 12],
    ],
  },
  6: { L: [[2, 86, 68]], M: [[4, 43, 27]], Q: [[4, 43, 19]], H: [[4, 43, 15]] },
  7: {
    L: [[2, 98, 78]],
    M: [[4, 49, 31]],
    Q: [
      [2, 32, 14],
      [4, 33, 15],
    ],
    H: [
      [4, 39, 13],
      [1, 40, 14],
    ],
  },
  8: {
    L: [[2, 121, 97]],
    M: [
      [2, 60, 38],
      [2, 61, 39],
    ],
    Q: [
      [4, 40, 18],
      [2, 41, 19],
    ],
    H: [
      [4, 40, 14],
      [2, 41, 15],
    ],
  },
  9: {
    L: [[2, 146, 116]],
    M: [
      [3, 58, 36],
      [2, 59, 37],
    ],
    Q: [
      [4, 36, 16],
      [4, 37, 17],
    ],
    H: [
      [4, 36, 12],
      [4, 37, 13],
    ],
  },
  10: {
    L: [
      [2, 86, 68],
      [2, 87, 69],
    ],
    M: [
      [4, 69, 43],
      [1, 70, 44],
    ],
    Q: [
      [6, 43, 19],
      [2, 44, 20],
    ],
    H: [
      [6, 43, 15],
      [2, 44, 16],
    ],
  },
};

// Annex E: alignment pattern rows/columns.
const ALIGN: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

const ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

// GF(256) for the Reed-Solomon generator, primitive 0x11d.
const gfExp: number[] = [];
const gfLog: number[] = [];
for (let i = 0, x = 1; i < 255; i++) {
  gfExp[i] = x;
  gfLog[x] = i;
  x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
}
const gfMul = (a: number, b: number) =>
  a === 0 || b === 0 ? 0 : gfExp[(gfLog[a] + gfLog[b]) % 255];

/**
 * Reed-Solomon error correction codewords: the remainder of
 * data(x) * x^ec divided by (x - a^0)(x - a^1)...(x - a^(ec-1)).
 *
 * @param data - Data codewords.
 * @param ec - Number of EC codewords.
 * @returns The EC codewords.
 */
export const reedSolomonEc = (data: readonly number[], ec: number): number[] => {
  let generator = [1];
  for (let i = 0; i < ec; i++) {
    const next = new Array<number>(generator.length + 1).fill(0);
    generator.forEach((g, k) => {
      next[k] ^= g;
      next[k + 1] ^= gfMul(g, gfExp[i]);
    });
    generator = next;
  }
  const remainder = [...data, ...new Array<number>(ec).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const factor = remainder[i];
    if (factor === 0) continue;
    generator.forEach((g, k) => (remainder[i + k] ^= gfMul(g, factor)));
  }
  return remainder.slice(data.length);
};

/**
 * Remainder of a BCH code over GF(2).
 *
 * @param value - Data shifted by the generator's degree.
 * @param poly - Generator.
 * @returns Remainder.
 */
const bch = (value: number, poly: number): number => {
  const degree = Math.floor(Math.log2(poly));
  while (value >= 1 << degree) {
    value ^= poly << (Math.floor(Math.log2(value)) - degree);
  }
  return value;
};

/** Data mask conditions by row i and column j. */
const MASK = [
  (i: number, j: number) => (i + j) % 2 === 0,
  (i: number) => i % 2 === 0,
  (_: number, j: number) => j % 3 === 0,
  (i: number, j: number) => (i + j) % 3 === 0,
  (i: number, j: number) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i: number, j: number) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i: number, j: number) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
  (i: number, j: number) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
];

/**
 * Encodes text or segments as a QR symbol.
 *
 * @param content - Text (one byte segment, UTF-8) or a list of segments.
 * @param options - Version, error correction level (default M) and mask (default 2).
 * @returns The modules row by row, 1 for dark, and the symbol size.
 * @throws {RangeError} When the data doesn't fit.
 */
export const encodeQr = (
  content: string | QrSegment[],
  { version, level = "M", mask = 2 }: QrEncodeOptions,
): { modules: Uint8Array; size: number } => {
  const segments: QrSegment[] =
    typeof content === "string"
      ? [{ mode: "byte", bytes: Array.from(new TextEncoder().encode(content)) }]
      : content;
  const groups = BLOCKS[version][level];
  const dataCount = groups.reduce((s, [n, , d]) => s + n * d, 0);

  // Bit stream.
  const bits: number[] = [];
  const put = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  const small = version <= 9;
  for (const segment of segments) {
    if (segment.mode === "numeric") {
      put(1, 4);
      put(segment.text.length, small ? 10 : 12);
      for (let i = 0; i < segment.text.length; i += 3) {
        const group = segment.text.slice(i, i + 3);
        put(Number(group), [0, 4, 7, 10][group.length]);
      }
    } else if (segment.mode === "alphanumeric") {
      put(2, 4);
      put(segment.text.length, small ? 9 : 11);
      for (let i = 0; i < segment.text.length; i += 2) {
        const a = ALNUM.indexOf(segment.text[i]);
        if (i + 1 < segment.text.length) put(a * 45 + ALNUM.indexOf(segment.text[i + 1]), 11);
        else put(a, 6);
      }
    } else if (segment.mode === "byte") {
      put(4, 4);
      put(segment.bytes.length, small ? 8 : 16);
      for (let i = 0; i < segment.bytes.length; i++) put(segment.bytes[i], 8);
    } else if (segment.mode === "eci") {
      put(7, 4);
      const d = segment.designator;
      if (d < 128) put(d, 8);
      else if (d < 16384) put(0x8000 | d, 16);
      else put(0xc00000 | d, 24);
    } else {
      for (const [value, length] of segment.bits) put(value, length);
    }
  }
  const capacity = dataCount * 8;
  if (bits.length > capacity)
    throw new RangeError(`encodeQr: ${bits.length} bits don't fit in ${capacity}`);
  put(0, Math.min(4, capacity - bits.length));
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let pad = 0; data.length < dataCount; pad++) data.push(pad % 2 ? 0x11 : 0xec);

  // Blocks, EC and interleaving.
  const blocks: { data: number[]; ec: number[] }[] = [];
  let at = 0;
  for (const [count, total, d] of groups) {
    for (let b = 0; b < count; b++) {
      const chunk = data.slice(at, at + d);
      at += d;
      blocks.push({ data: chunk, ec: reedSolomonEc(chunk, total - d) });
    }
  }
  const codewords: number[] = [];
  const maxData = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < maxData; i++)
    for (const b of blocks) if (i < b.data.length) codewords.push(b.data[i]);
  for (let i = 0; i < blocks[0].ec.length; i++) for (const b of blocks) codewords.push(b.ec[i]);

  // Function patterns.
  const size = 17 + 4 * version;
  const modules = new Uint8Array(size * size);
  const reserved = new Uint8Array(size * size);
  const set = (x: number, y: number, dark: boolean) => {
    modules[y * size + x] = dark ? 1 : 0;
    reserved[y * size + x] = 1;
  };
  for (const [fx, fy] of [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]) {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const x = fx + dx;
        const y = fy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        set(x, y, ring !== 2 && ring <= 3);
      }
    }
  }
  for (let i = 8; i < size - 8; i++) {
    set(i, 6, i % 2 === 0);
    set(6, i, i % 2 === 0);
  }
  const centres = ALIGN[version];
  for (const cy of centres) {
    for (const cx of centres) {
      if ((cx < 9 && cy < 9) || (cx < 9 && cy > size - 10) || (cx > size - 10 && cy < 9)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++)
          set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }
  set(8, size - 8, true);
  // Format and version areas, written last.
  for (let i = 0; i < 9; i++) {
    reserved[8 * size + i] = 1;
    reserved[i * size + 8] = 1;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8 * size + size - 1 - i] = 1;
    reserved[(size - 1 - i) * size + 8] = 1;
  }
  if (version >= 7) {
    for (let a = 0; a < 6; a++) {
      for (let b = size - 11; b < size - 8; b++) {
        reserved[a * size + b] = 1;
        reserved[b * size + a] = 1;
      }
    }
  }

  // Data, two columns at a time from the right, zigzag, masked.
  const stream: number[] = [];
  for (const cw of codewords) for (let i = 7; i >= 0; i--) stream.push((cw >> i) & 1);
  let index = 0;
  let up = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let k = 0; k < size; k++) {
      const y = up ? size - 1 - k : k;
      for (const x of [right, right - 1]) {
        if (reserved[y * size + x]) continue;
        const bit = index < stream.length ? stream[index] : 0;
        index++;
        modules[y * size + x] = bit ^ (MASK[mask](y, x) ? 1 : 0);
      }
    }
    up = !up;
  }

  // Format: level bits (L 01, M 00, Q 11, H 10) and mask, BCH, masked.
  const formatData = ({ L: 1, M: 0, Q: 3, H: 2 }[level] << 3) | mask;
  const format = ((formatData << 10) | bch(formatData << 10, 0x537)) ^ 0x5412;
  const formatBit = (k: number) => (format >> (14 - k)) & 1;
  const first: [number, number][] = [
    ...[0, 1, 2, 3, 4, 5].map((x): [number, number] => [x, 8]),
    [7, 8],
    [8, 8],
    [8, 7],
    ...[5, 4, 3, 2, 1, 0].map((y): [number, number] => [8, y]),
  ];
  const second: [number, number][] = [
    ...[1, 2, 3, 4, 5, 6, 7].map((k): [number, number] => [8, size - k]),
    ...[8, 7, 6, 5, 4, 3, 2, 1].map((k): [number, number] => [size - k, 8]),
  ];
  first.forEach(([x, y], k) => (modules[y * size + x] = formatBit(k)));
  second.forEach(([x, y], k) => (modules[y * size + x] = formatBit(k)));
  if (version >= 7) {
    const word = (version << 12) | bch(version << 12, 0x1f25);
    let k = 17;
    for (let a = 5; a >= 0; a--) {
      for (let b = size - 9; b >= size - 11; b--) {
        const bit = (word >> k--) & 1;
        modules[a * size + b] = bit;
        modules[b * size + a] = bit;
      }
    }
  }
  return { modules, size };
};

/** How to draw a symbol into a test image. */
export interface QrRenderOptions {
  width?: number;
  height?: number;
  /** Corners of the symbol with its quiet zone: top-left, top-right, bottom-right, bottom-left. */
  corners: Point[];
  /** Quiet zone in modules (default 4). */
  quiet?: number;
  background?: number;
  dark?: number;
  light?: number;
}

/**
 * Draws a symbol into a gray image, anti-aliased.
 *
 * @param symbol - From {@link encodeQr}.
 * @param symbol.modules - Modules, 1 for dark.
 * @param symbol.size - Modules per side.
 * @param options - Image size, where the symbol goes and its colours.
 * @returns The image and the symbol's own corners (without the quiet zone).
 */
export const renderQr = (
  { modules, size }: { modules: Uint8Array; size: number },
  {
    width = 320,
    height = 240,
    corners,
    quiet = 4,
    background = 120,
    dark = 25,
    light = 235,
  }: QrRenderOptions,
): { image: Matrix<"u8">; symbol: Point[] } => {
  const image = createMatrix(width, height);
  image.data.fill(background);
  const span = size + 2 * quiet;
  drawQuad(image, corners, (u, v) => {
    const x = Math.floor(u * span) - quiet;
    const y = Math.floor(v * span) - quiet;
    return x >= 0 && y >= 0 && x < size && y < size && modules[y * size + x] ? dark : light;
  });
  const toImage = perspectiveTransform(
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
    corners,
  );
  const symbol = [
    [quiet, quiet],
    [quiet + size, quiet],
    [quiet + size, quiet + size],
    [quiet, quiet + size],
  ].map(([x, y]) => transformPoint(toImage, { x: x / span, y: y / span }));
  return { image, symbol };
};
