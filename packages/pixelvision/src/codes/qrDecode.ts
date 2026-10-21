import type { QrContent } from "./qrCode.model";
import { correctReedSolomon } from "./reedSolomon";
import {
  FORMAT_LEVELS,
  FORMAT_WORDS,
  MAX_QR_VERSION,
  alignmentCentres,
  bitCount,
  blockLayout,
  versionWord,
} from "./qrTables";

const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/** Whether the data mask flips the module at a row and column, per mask pattern. */
const MASKS: readonly ((row: number, column: number) => boolean)[] = [
  (i, j) => (i + j) % 2 === 0,
  (i) => i % 2 === 0,
  (_, j) => j % 3 === 0,
  (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
  (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
];

/**
 * Finds the valid word nearest to a read one, by bit differences.
 *
 * @param read - The word as read.
 * @param words - Valid words.
 * @param maxErrors - Most differing bits accepted.
 * @returns Index of the nearest valid word, or -1 when none is close enough.
 */
const nearestWord = (read: number, words: readonly number[], maxErrors: number): number => {
  let best = -1;
  let bestErrors = maxErrors + 1;
  words.forEach((word, i) => {
    const errors = bitCount(read ^ word);
    if (errors < bestErrors) {
      bestErrors = errors;
      best = i;
    }
  });
  return best;
};

/**
 * Reads the format information (error correction level and mask) from
 * either of its two copies.
 *
 * @param bit - Module at a column and row, 1 for dark.
 * @param dim - Symbol size in modules.
 * @returns The 5 format data bits, or -1 when neither copy is readable.
 */
export const readFormat = (bit: (x: number, y: number) => number, dim: number): number => {
  let first = 0;
  for (let x = 0; x < 6; x++) first = (first << 1) | bit(x, 8);
  first = (first << 1) | bit(7, 8);
  first = (first << 1) | bit(8, 8);
  first = (first << 1) | bit(8, 7);
  for (let y = 5; y >= 0; y--) first = (first << 1) | bit(8, y);
  let second = 0;
  for (let y = dim - 1; y >= dim - 7; y--) second = (second << 1) | bit(8, y);
  for (let x = dim - 8; x < dim; x++) second = (second << 1) | bit(x, 8);
  const a = nearestWord(first, FORMAT_WORDS, 3);
  return a >= 0 ? a : nearestWord(second, FORMAT_WORDS, 3);
};

/** Valid version words, for versions 7 to 40. */
const VERSION_WORDS = Array.from({ length: 34 }, (_, i) => versionWord(i + 7));

/**
 * Reads the version information of versions 7 and up from either copy.
 *
 * @param bit - Module at a column and row, 1 for dark.
 * @param dim - Symbol size in modules.
 * @returns The version, or -1 when neither copy is readable.
 */
export const readVersion = (bit: (x: number, y: number) => number, dim: number): number => {
  let topRight = 0;
  let bottomLeft = 0;
  for (let a = 5; a >= 0; a--) {
    for (let b = dim - 9; b >= dim - 11; b--) {
      topRight = (topRight << 1) | bit(b, a);
      bottomLeft = (bottomLeft << 1) | bit(a, b);
    }
  }
  const found = nearestWord(topRight, VERSION_WORDS, 3);
  const version = found >= 0 ? found : nearestWord(bottomLeft, VERSION_WORDS, 3);
  return version >= 0 ? version + 7 : -1;
};

/**
 * Marks the modules that aren't data: finder patterns with separators and
 * format areas, timing patterns, alignment patterns and version areas.
 *
 * @param version - 1–10.
 * @returns One byte per module, row by row: 1 for function modules.
 */
export const functionModules = (version: number): Uint8Array => {
  const dim = 17 + 4 * version;
  const marks = new Uint8Array(dim * dim);
  const region = (x0: number, y0: number, width: number, height: number) => {
    for (let y = y0; y < y0 + height; y++) marks.fill(1, y * dim + x0, y * dim + x0 + width);
  };
  region(0, 0, 9, 9);
  region(dim - 8, 0, 8, 9);
  region(0, dim - 8, 9, 8);
  region(6, 9, 1, dim - 17);
  region(9, 6, dim - 17, 1);
  const centres = alignmentCentres(version);
  const last = centres.length - 1;
  centres.forEach((y, i) =>
    centres.forEach((x, j) => {
      if ((i === 0 && (j === 0 || j === last)) || (i === last && j === 0)) return;
      region(x - 2, y - 2, 5, 5);
    }),
  );
  if (version >= 7) {
    region(dim - 11, 0, 3, 6);
    region(0, dim - 11, 6, 3);
  }
  return marks;
};

/**
 * Reads bits from the front of a byte array.
 */
class BitReader {
  private position = 0;

  /**
   * @param bytes - The data codewords.
   */
  constructor(private readonly bytes: Uint8Array) {}

  /**
   * Bits not read yet.
   *
   * @returns The count.
   */
  available(): number {
    return this.bytes.length * 8 - this.position;
  }

  /**
   * Reads bits, most significant first.
   *
   * @param count - How many, at most 24.
   * @returns Their value.
   */
  read(count: number): number {
    let value = 0;
    for (let i = 0; i < count; i++, this.position++) {
      value = (value << 1) | ((this.bytes[this.position >> 3] >> (7 - (this.position & 7))) & 1);
    }
    return value;
  }
}

/**
 * Decodes UTF-8, or returns `undefined` when the bytes aren't valid UTF-8.
 *
 * @param bytes - The bytes.
 * @returns The text, or `undefined`.
 */
const decodeUtf8 = (bytes: Uint8Array): string | undefined => {
  let text = "";
  for (let i = 0; i < bytes.length;) {
    const b = bytes[i];
    const extra = b < 0x80 ? 0 : b >> 5 === 6 ? 1 : b >> 4 === 14 ? 2 : b >> 3 === 30 ? 3 : -1;
    if (extra < 0 || i + extra >= bytes.length) return undefined;
    let code = extra ? b & (0x3f >> extra) : b;
    for (let k = 1; k <= extra; k++) {
      if (bytes[i + k] >> 6 !== 2) return undefined;
      code = (code << 6) | (bytes[i + k] & 0x3f);
    }
    // Overlong forms, surrogates and values past U+10FFFF are invalid.
    if (
      code < [0, 0x80, 0x800, 0x10000][extra] ||
      (code >= 0xd800 && code < 0xe000) ||
      code > 0x10ffff
    ) {
      return undefined;
    }
    text += String.fromCodePoint(code);
    i += extra + 1;
  }
  return text;
};

/**
 * Parses the data bit stream: numeric, alphanumeric and byte segments, ECI
 * and structured-append headers and FNC1 markers.
 *
 * @param data - Corrected data codewords.
 * @param version - Version (sets the length of the character counts).
 * @returns The content's bytes and whether an ECI asked for ISO-8859-1, or
 *   `undefined` for a Kanji segment, an unknown mode or a stream cut short.
 */
const parseSegments = (
  data: Uint8Array,
  version: number,
): { bytes: number[]; latin1: boolean } | undefined => {
  const reader = new BitReader(data);
  const bytes: number[] = [];
  let latin1 = false;
  const countBits = (small: number, large: number) => (version < 10 ? small : large);
  while (reader.available() >= 4) {
    const mode = reader.read(4);
    if (mode === 0) break;
    if (mode === 1) {
      // Numeric: three digits in 10 bits, two in 7, one in 4.
      let count = reader.read(countBits(10, 12));
      while (count > 0) {
        const digits = Math.min(count, 3);
        const bits = [0, 4, 7, 10][digits];
        if (reader.available() < bits) return undefined;
        const value = reader.read(bits);
        if (value >= 10 ** digits) return undefined;
        for (const c of String(value).padStart(digits, "0")) bytes.push(c.charCodeAt(0));
        count -= digits;
      }
    } else if (mode === 2) {
      // Alphanumeric: two characters in 11 bits, one in 6.
      let count = reader.read(countBits(9, 11));
      while (count > 0) {
        const pair = count >= 2;
        if (reader.available() < (pair ? 11 : 6)) return undefined;
        const value = reader.read(pair ? 11 : 6);
        const chars = pair ? [Math.floor(value / 45), value % 45] : [value];
        if (chars[0] >= 45) return undefined;
        for (const c of chars) bytes.push(ALPHANUMERIC.charCodeAt(c));
        count -= chars.length;
      }
    } else if (mode === 4) {
      const count = reader.read(countBits(8, 16));
      if (reader.available() < count * 8) return undefined;
      for (let i = 0; i < count; i++) bytes.push(reader.read(8));
    } else if (mode === 7) {
      // ECI: 1, 2 or 3 bytes, by the leading bits of the first.
      const first = reader.read(8);
      const designator =
        first < 0x80
          ? first
          : first < 0xc0
            ? ((first & 0x3f) << 8) | reader.read(8)
            : ((first & 0x1f) << 16) | reader.read(16);
      latin1 = designator === 1 || designator === 3;
    } else if (mode === 3) {
      // Structured append: symbol position and parity; the content follows.
      reader.read(16);
    } else if (mode === 5) {
      // FNC1 in first position: marks GS1 data, no payload.
    } else if (mode === 9) {
      // FNC1 in second position: an application indicator.
      reader.read(8);
    } else {
      return undefined;
    }
  }
  return { bytes, latin1 };
};

/**
 * Decodes a symbol from its modules: reads the format (and version)
 * information, removes the mask, reads the codewords in their zigzag
 * order, de-interleaves and corrects the blocks with Reed–Solomon, and
 * parses the segments.
 *
 * @param module - Module at a column and row, 1 for dark.
 * @param version - Version the grid was sampled for, 1–10.
 * @returns The content, or `undefined` when it can't be decoded.
 */
export function decodeModules(
  module: (x: number, y: number) => number,
  version: number,
): QrContent | undefined {
  const dim = 17 + 4 * version;
  if (version >= 7 && readVersion(module, dim) !== version) return undefined;
  const format = readFormat(module, dim);
  if (format < 0) return undefined;
  const level = FORMAT_LEVELS[format >> 3];
  const mask = MASKS[format & 7];

  // Codewords, two columns at a time from the right, alternately up and down.
  const fixed = functionModules(version);
  const layout = blockLayout(version, level);
  const total = layout.dataPerBlock.reduce((sum, d) => sum + d + layout.ecPerBlock, 0);
  const raw = new Uint8Array(total);
  let bits = 0;
  let upward = true;
  for (let right = dim - 1; right > 0; right -= 2) {
    if (right === 6) right--;
    for (let step = 0; step < dim; step++) {
      const y = upward ? dim - 1 - step : step;
      for (let c = 0; c < 2; c++) {
        const x = right - c;
        if (fixed[y * dim + x]) continue;
        const value = module(x, y) ^ (mask(y, x) ? 1 : 0);
        if (bits >> 3 < total) raw[bits >> 3] |= value << (7 - (bits & 7));
        bits++;
      }
    }
    upward = !upward;
  }

  // De-interleave: data codewords round-robin over the blocks, then EC codewords.
  const blocks = layout.dataPerBlock.map((d) => new Uint8Array(d + layout.ecPerBlock));
  let offset = 0;
  const longest = Math.max(...layout.dataPerBlock);
  for (let i = 0; i < longest; i++) {
    blocks.forEach((block, b) => {
      if (i < layout.dataPerBlock[b]) block[i] = raw[offset++];
    });
  }
  for (let i = 0; i < layout.ecPerBlock; i++) {
    blocks.forEach((block, b) => {
      block[layout.dataPerBlock[b] + i] = raw[offset++];
    });
  }
  const data: number[] = [];
  for (const [b, block] of blocks.entries()) {
    if (correctReedSolomon(block, layout.ecPerBlock) < 0) return undefined;
    data.push(...block.subarray(0, layout.dataPerBlock[b]));
  }

  const parsed = parseSegments(Uint8Array.from(data), version);
  if (!parsed) return undefined;
  const bytes = Uint8Array.from(parsed.bytes);
  const utf8 = parsed.latin1 ? undefined : decodeUtf8(bytes);
  return {
    bytes,
    text: utf8 ?? String.fromCharCode(...bytes),
    version,
    errorCorrectionLevel: level,
  };
}

/** Versions {@link decodeModules} reads. */
export const QR_VERSIONS = Array.from({ length: MAX_QR_VERSION }, (_, i) => i + 1);
