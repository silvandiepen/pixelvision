import type { QrBlockLayout, QrErrorCorrectionLevel } from "./qrCode.model";

/** Highest version pixelvision reads. */
export const MAX_QR_VERSION = 10;

/** Centres of the alignment patterns per version (ISO/IEC 18004 Annex E), versions 1–10. */
const ALIGNMENT_CENTRES: readonly (readonly number[])[] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

// Error correction per version (ISO/IEC 18004 Table 9), levels in the order
// L, M, Q, H: [EC codewords per block, blocks, data codewords, blocks, data codewords].
const EC_BLOCKS: readonly (readonly (readonly number[])[])[] = [
  [
    [7, 1, 19],
    [10, 1, 16],
    [13, 1, 13],
    [17, 1, 9],
  ],
  [
    [10, 1, 34],
    [16, 1, 28],
    [22, 1, 22],
    [28, 1, 16],
  ],
  [
    [15, 1, 55],
    [26, 1, 44],
    [18, 2, 17],
    [22, 2, 13],
  ],
  [
    [20, 1, 80],
    [18, 2, 32],
    [26, 2, 24],
    [16, 4, 9],
  ],
  [
    [26, 1, 108],
    [24, 2, 43],
    [18, 2, 15, 2, 16],
    [22, 2, 11, 2, 12],
  ],
  [
    [18, 2, 68],
    [16, 4, 27],
    [24, 4, 19],
    [28, 4, 15],
  ],
  [
    [20, 2, 78],
    [18, 4, 31],
    [18, 2, 14, 4, 15],
    [26, 4, 13, 1, 14],
  ],
  [
    [24, 2, 97],
    [22, 2, 38, 2, 39],
    [22, 4, 18, 2, 19],
    [26, 4, 14, 2, 15],
  ],
  [
    [30, 2, 116],
    [22, 3, 36, 2, 37],
    [20, 4, 16, 4, 17],
    [24, 4, 12, 4, 13],
  ],
  [
    [18, 2, 68, 2, 69],
    [26, 4, 43, 1, 44],
    [24, 6, 19, 2, 20],
    [28, 6, 15, 2, 16],
  ],
];

const LEVELS: readonly QrErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

/**
 * Alignment pattern centres of a version.
 *
 * @param version - 1–10.
 * @returns Row/column coordinates of the centres; every pair is a pattern
 *   except the three that overlap finder patterns.
 */
export const alignmentCentres = (version: number): readonly number[] =>
  ALIGNMENT_CENTRES[version - 1];

/**
 * The block layout of a version and level.
 *
 * @param version - 1–10.
 * @param level - Error correction level.
 * @returns EC codewords per block and the data codewords of each block.
 */
export const blockLayout = (version: number, level: QrErrorCorrectionLevel): QrBlockLayout => {
  const [ecPerBlock, ...groups] = EC_BLOCKS[version - 1][LEVELS.indexOf(level)];
  const dataPerBlock: number[] = [];
  for (let g = 0; g < groups.length; g += 2) {
    for (let b = 0; b < groups[g]; b++) dataPerBlock.push(groups[g + 1]);
  }
  return { ecPerBlock, dataPerBlock };
};

/**
 * Remainder of a BCH code: `value` divided by `generator` over GF(2).
 *
 * @param value - The data shifted left by the generator's degree.
 * @param generator - Generator polynomial as bits.
 * @returns The remainder.
 */
const bchRemainder = (value: number, generator: number): number => {
  const degree = 31 - Math.clz32(generator);
  for (let bit = 31 - Math.clz32(value); bit >= degree; bit--) {
    if (value & (1 << bit)) value ^= generator << (bit - degree);
  }
  return value;
};

/** The 32 valid format words (after masking with 0x5412), indexed by their 5 data bits. */
export const FORMAT_WORDS: readonly number[] = Array.from(
  { length: 32 },
  (_, data) => ((data << 10) | bchRemainder(data << 10, 0x537)) ^ 0x5412,
);

/** Error correction level by the 2 level bits of a format word. */
export const FORMAT_LEVELS: readonly QrErrorCorrectionLevel[] = ["M", "L", "H", "Q"];

/**
 * The 18-bit version word of versions 7 and up.
 *
 * @param version - 7–40.
 * @returns The version in its top 6 bits and its BCH check below.
 */
export const versionWord = (version: number): number =>
  (version << 12) | bchRemainder(version << 12, 0x1f25);

/**
 * Number of set bits.
 *
 * @param value - A 32-bit integer.
 * @returns How many bits are 1.
 */
export const bitCount = (value: number): number => {
  let count = 0;
  for (let v = value >>> 0; v; v &= v - 1) count++;
  return count;
};
