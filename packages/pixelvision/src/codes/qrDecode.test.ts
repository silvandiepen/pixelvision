import { describe, expect, it } from "vitest";
import { encodeQr, reedSolomonEc } from "../test-qr";
import type { QrSegment } from "../test-qr";
import { decodeModules, functionModules, readFormat, readVersion } from "./qrDecode";
import { correctReedSolomon } from "./reedSolomon";
import {
  FORMAT_LEVELS,
  FORMAT_WORDS,
  alignmentCentres,
  bitCount,
  blockLayout,
  versionWord,
} from "./qrTables";

/**
 * Encodes and decodes straight from the modules, no image in between.
 *
 * @param content - Text or segments.
 * @param version - Version.
 * @param level - Error correction level.
 * @param mask - Mask pattern.
 * @returns What the decoder reads.
 */
const roundTrip = (
  content: string | QrSegment[],
  version = 2,
  level: "L" | "M" | "Q" | "H" = "L",
  mask = 3,
) => {
  const { modules, size } = encodeQr(content, { version, level, mask });
  return decodeModules((x, y) => modules[y * size + x], version);
};

describe("QR tables", () => {
  it("has the standard's format and version words", () => {
    // ISO/IEC 18004 Annex C: level M with mask 0 is the bare mask; L with mask 0.
    expect(FORMAT_WORDS[0]).toBe(0x5412);
    expect(FORMAT_WORDS[0b01000]).toBe(0b111011111000100);
    expect(FORMAT_LEVELS).toEqual(["M", "L", "H", "Q"]);
    // Annex D: versions 7 and 10.
    expect(versionWord(7)).toBe(0x07c94);
    expect(versionWord(10)).toBe(0x0a4d3);
  });

  it("lays out blocks and alignment patterns per version", () => {
    expect(blockLayout(1, "H")).toEqual({ ecPerBlock: 17, dataPerBlock: [9] });
    expect(blockLayout(5, "Q")).toEqual({ ecPerBlock: 18, dataPerBlock: [15, 15, 16, 16] });
    expect(alignmentCentres(1)).toEqual([]);
    expect(alignmentCentres(7)).toEqual([6, 22, 38]);
    expect(bitCount(0b1011)).toBe(3);
    expect(bitCount(-1)).toBe(32);
  });

  it("leaves exactly the codeword modules free", () => {
    // Data modules = codewords * 8 + remainder bits (0 for v1, 7 for v2-6, 0 for v7-10).
    for (const [version, codewords, remainder] of [
      [1, 26, 0],
      [2, 44, 7],
      [6, 172, 7],
      [7, 196, 0],
      [10, 346, 0],
    ]) {
      const free = functionModules(version).filter((m) => m === 0).length;
      expect(free, `version ${version}`).toBe(codewords * 8 + remainder);
    }
  });
});

describe("correctReedSolomon", () => {
  const data = Array.from({ length: 30 }, (_, i) => (i * 37 + 11) & 0xff);
  const block = () => Uint8Array.from([...data, ...reedSolomonEc(data, 16)]);

  it("passes a clean block", () => {
    expect(correctReedSolomon(block(), 16)).toBe(0);
  });

  it("corrects up to half the EC codewords anywhere", () => {
    for (const positions of [[0], [45], [3, 9, 22, 30, 31, 40, 44, 45], [1, 2, 3, 4, 5, 6, 7, 8]]) {
      const damaged = block();
      for (const p of positions) damaged[p] ^= 0x5a + p;
      expect(correctReedSolomon(damaged, 16)).toBe(positions.length);
      expect(Array.from(damaged)).toEqual(Array.from(block()));
    }
  });

  it("reports blocks with too many errors", () => {
    const damaged = block();
    for (let p = 0; p < 20; p++) damaged[p * 2] ^= 0xff;
    expect(correctReedSolomon(damaged, 16)).toBe(-1);
    // A short block: the locator's roots fall outside it.
    const short = Uint8Array.from([...data.slice(0, 4), ...reedSolomonEc(data.slice(0, 4), 6)]);
    short.set([1, 2, 3, 4, 5], 0);
    expect(correctReedSolomon(short, 6)).toBe(-1);
    // An odd number of EC codewords: the locator needs more roots than can be fixed.
    const odd = Uint8Array.from([...data.slice(0, 19), ...reedSolomonEc(data.slice(0, 19), 7)]);
    for (let p = 0; p < 6; p++) odd[p * 3] ^= 0x33 + p;
    expect(correctReedSolomon(odd, 7)).toBe(-1);
  });
});

/**
 * Zero-valued bit groups.
 *
 * @param count - Number of groups.
 * @param length - Bits per group.
 * @returns The groups.
 */
const zeros = (count: number, length: number): [number, number][] =>
  Array.from({ length: count }, () => [0, length]);

/**
 * A bit pattern at least 4 bits from every valid word: unreadable.
 *
 * @param words - Valid words.
 * @param bits - Word length.
 * @returns The pattern.
 */
const farFrom = (words: readonly number[], bits: number): number => {
  for (let p = 0; p < 1 << bits; p++) if (words.every((w) => bitCount(p ^ w) >= 4)) return p;
  throw new Error("no such pattern");
};

describe("decodeModules", () => {
  it("reads every version, level and mask", () => {
    for (let version = 1; version <= 10; version++) {
      for (const level of ["L", "M", "Q", "H"] as const) {
        for (let mask = 0; mask < 8; mask++) {
          const text = `v${version}${level}${mask}`;
          expect(roundTrip(text, version, level, mask), text).toMatchObject({
            text,
            version,
            errorCorrectionLevel: level,
          });
        }
      }
    }
  });

  it("reads numeric, alphanumeric and byte segments", () => {
    for (const version of [2, 10]) {
      expect(
        roundTrip(
          [
            { mode: "numeric", text: "0123456789" },
            { mode: "numeric", text: "12" },
            { mode: "numeric", text: "7" },
            { mode: "alphanumeric", text: "AB-C:" },
            { mode: "byte", bytes: [0x2f, 0x7e] },
          ],
          version,
        )?.text,
      ).toBe("0123456789127AB-C:/~");
    }
  });

  it("decodes UTF-8, falling back to ISO-8859-1", () => {
    expect(roundTrip("é 世界 😀")?.text).toBe("é 世界 😀");
    const latin = [{ mode: "byte", bytes: [0x47, 0x72, 0xfc, 0xdf] }] as QrSegment[];
    expect(roundTrip(latin)?.text).toBe("Grüß");
    // Each is invalid UTF-8: truncated, a bad continuation, overlong, a surrogate, past U+10FFFF, 5 bytes.
    for (const bytes of [
      [0xe4, 0xb8],
      [0xc3, 0x41],
      [0xc0, 0x80],
      [0xed, 0xa0, 0x80],
      [0xf4, 0x90, 0x80, 0x80],
      [0xf8, 0x88, 0x80, 0x80, 0x80],
    ]) {
      const result = roundTrip([{ mode: "byte", bytes }]);
      expect(result?.text).toBe(String.fromCharCode(...bytes));
      expect(Array.from(result!.bytes)).toEqual(bytes);
    }
  });

  it("follows ECI designators", () => {
    const utf8 = Array.from(new TextEncoder().encode("ü"));
    expect(
      roundTrip([
        { mode: "eci", designator: 26 },
        { mode: "byte", bytes: utf8 },
      ])?.text,
    ).toBe("ü");
    // ISO-8859-1 (3) and its alias (1): the bytes are not read as UTF-8.
    for (const designator of [1, 3]) {
      expect(
        roundTrip([
          { mode: "eci", designator },
          { mode: "byte", bytes: utf8 },
        ])?.text,
      ).toBe("Ã¼");
    }
    // Two- and three-byte designators are skipped correctly.
    for (const designator of [200, 20000]) {
      expect(
        roundTrip([
          { mode: "eci", designator },
          { mode: "byte", bytes: [0x41] },
        ])?.text,
      ).toBe("A");
    }
  });

  it("skips structured append headers and FNC1 markers", () => {
    expect(
      roundTrip([
        {
          mode: "raw",
          bits: [
            [3, 4],
            [0x1234, 16],
          ],
        },
        { mode: "raw", bits: [[5, 4]] },
        {
          mode: "raw",
          bits: [
            [9, 4],
            [0x41, 8],
          ],
        },
        { mode: "alphanumeric", text: "GS1" },
      ])?.text,
    ).toBe("GS1");
  });

  it("gives up on Kanji, unknown modes and broken segments", () => {
    for (const bits of [
      // Kanji, mode 6, mode 15.
      [
        [8, 4],
        [1, 8],
        [0, 13],
      ],
      [[6, 4]],
      [[15, 4]],
      // Numeric: a group over 999; a single digit over 9; more digits than bits left.
      [
        [1, 4],
        [3, 10],
        [1000, 10],
      ],
      [
        [1, 4],
        [1, 10],
        [12, 4],
      ],
      [[1, 4], [100, 10], ...zeros(5, 10)],
      // Alphanumeric: a pair past the table; more pairs than bits left; a last single that doesn't fit.
      [
        [2, 4],
        [2, 9],
        [45 * 45, 11],
      ],
      [[2, 4], [100, 9], ...zeros(5, 11)],
      [[2, 4], [11, 9], ...zeros(5, 11)],
    ] as [number, number][][]) {
      // Version 1-H holds 72 bits; the zero groups fill it to the last 4.
      const { modules, size } = encodeQr([{ mode: "raw", bits }], {
        version: 1,
        level: "H",
        mask: 1,
      });
      expect(
        decodeModules((x, y) => modules[y * size + x], 1),
        JSON.stringify(bits),
      ).toBeUndefined();
    }
    // A byte segment longer than the symbol.
    const long = encodeQr(
      [
        {
          mode: "raw",
          bits: [
            [4, 4],
            [200, 8],
            [0x41, 8],
          ],
        },
      ],
      { version: 1, mask: 0 },
    );
    expect(decodeModules((x, y) => long.modules[y * long.size + x], 1)).toBeUndefined();
  });

  it("reads the second copy of the format and version information", () => {
    const { modules, size } = encodeQr("copy test", { version: 7, level: "Q", mask: 5 });
    const grid = modules.slice();
    // Overwrite the first copies with unreadable patterns.
    const format = farFrom(FORMAT_WORDS, 15);
    const firstCopy = [
      ...[0, 1, 2, 3, 4, 5].map((x) => [x, 8]),
      [7, 8],
      [8, 8],
      [8, 7],
      ...[5, 4, 3, 2, 1, 0].map((y) => [8, y]),
    ];
    firstCopy.forEach(([x, y], k) => (grid[y * size + x] = (format >> (14 - k)) & 1));
    const versionWords = Array.from({ length: 34 }, (_, i) => versionWord(i + 7));
    const version = farFrom(versionWords, 18);
    let k = 17;
    for (let a = 5; a >= 0; a--) {
      for (let b = size - 9; b >= size - 11; b--) grid[a * size + b] = (version >> k--) & 1;
    }
    const at = (x: number, y: number) => grid[y * size + x];
    expect(readFormat(at, size)).toBe((3 << 3) | 5);
    expect(readVersion(at, size)).toBe(7);
    expect(decodeModules(at, 7)?.text).toBe("copy test");

    // Both copies gone.
    const secondCopy = [
      ...[1, 2, 3, 4, 5, 6, 7].map((d) => [8, size - d]),
      ...[8, 7, 6, 5, 4, 3, 2, 1].map((d) => [size - d, 8]),
    ];
    secondCopy.forEach(([x, y], i) => (grid[y * size + x] = (format >> (14 - i)) & 1));
    k = 17;
    for (let a = 5; a >= 0; a--) {
      for (let b = size - 9; b >= size - 11; b--) grid[b * size + a] = (version >> k--) & 1;
    }
    expect(readFormat(at, size)).toBe(-1);
    expect(readVersion(at, size)).toBe(-1);
    expect(decodeModules(at, 7)).toBeUndefined();
  });

  it("rejects a symbol whose format information is unreadable", () => {
    const { modules, size } = encodeQr("no format", { version: 2 });
    const grid = modules.slice();
    const format = farFrom(FORMAT_WORDS, 15);
    const positions = [
      ...[0, 1, 2, 3, 4, 5].map((x) => [x, 8]),
      [7, 8],
      [8, 8],
      [8, 7],
      ...[5, 4, 3, 2, 1, 0].map((y) => [8, y]),
    ];
    const second = [
      ...[1, 2, 3, 4, 5, 6, 7].map((d) => [8, size - d]),
      ...[8, 7, 6, 5, 4, 3, 2, 1].map((d) => [size - d, 8]),
    ];
    for (const copy of [positions, second]) {
      copy.forEach(([x, y], k) => (grid[y * size + x] = (format >> (14 - k)) & 1));
    }
    const at = (x: number, y: number) => grid[y * size + x];
    expect(readFormat(at, size)).toBe(-1);
    expect(decodeModules(at, 2)).toBeUndefined();
  });

  it("rejects a grid sampled for the wrong version and too many errors", () => {
    const seven = encodeQr("version seven", { version: 7 });
    // The version information says 7: as version 8 it can't be right (and the grid is too small).
    const at = (x: number, y: number) =>
      x < seven.size && y < seven.size ? seven.modules[y * seven.size + x] : 0;
    expect(decodeModules(at, 8)).toBeUndefined();

    const { modules, size } = encodeQr("too damaged", { version: 2, level: "L", mask: 4 });
    const grid = modules.slice();
    for (let y = 10; y < 20; y++) for (let x = 10; x < 20; x++) grid[y * size + x] ^= 1;
    expect(decodeModules((x, y) => grid[y * size + x], 2)).toBeUndefined();
  });
});
