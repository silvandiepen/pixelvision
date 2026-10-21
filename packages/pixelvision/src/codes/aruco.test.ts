import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Point } from "../math/transforms.model";
import { addGaussianNoise, drawQuad, squareCorners } from "../test-images";
import { toRows } from "../test-utils";
import {
  candidateTries,
  detectArucoMarkers,
  generateArucoMarker,
  getArucoDictionary,
} from "./aruco";
import type { ArucoDictionaryName } from "./aruco.model";

/**
 * A light image with markers drawn into it.
 *
 * @param markers - Id, corners (marker top-left first, clockwise) and dictionary.
 * @param options - Image size, background and noise.
 * @param options.width - Width (default 240).
 * @param options.height - Height (default 180).
 * @param options.background - Background level (default 210).
 * @param options.noise - Noise deviation (default 4).
 * @returns The image.
 */
const scene = (
  markers: { id: number; corners: Point[]; dictionary?: ArucoDictionaryName }[],
  { width = 240, height = 180, background = 210, noise = 4 } = {},
) => {
  const image = createMatrix(width, height);
  image.data.fill(background);
  for (const { id, corners, dictionary } of markers) {
    const marker = generateArucoMarker(id, { dictionary, size: 60 });
    drawQuad(image, corners, (u, v) =>
      marker.data[Math.floor(v * 60) * 60 + Math.floor(u * 60)] ? 230 : 25,
    );
  }
  if (noise) addGaussianNoise(image, noise, 3);
  return image;
};

/**
 * Asserts that a found marker's corners are the drawn ones, within 2.5 pixels.
 *
 * @param found - Detected corners.
 * @param drawn - Drawn corners.
 */
const expectCorners = (found: readonly Point[], drawn: readonly Point[]) => {
  found.forEach((corner, k) => {
    expect(Math.hypot(corner.x - drawn[k].x, corner.y - drawn[k].y)).toBeLessThanOrEqual(2.5);
  });
};

describe("generateArucoMarker", () => {
  it("draws DICT_4X4_50 marker 0 cell by cell", () => {
    expect(toRows(generateArucoMarker(0, { size: 6 }))).toEqual(
      ["000000", "010110", "001010", "000110", "000100", "000000"].map((row) =>
        [...row].map((bit) => (bit === "1" ? 255 : 0)),
      ),
    );
  });

  it("draws DICT_6X6_250 marker 0 with a wider border", () => {
    const rows = ["000111", "100011", "110111", "011000", "001010", "100110"];
    const marker = generateArucoMarker(0, { dictionary: "6x6_250", size: 10, borderBits: 2 });

    expect(toRows(marker)).toEqual(
      Array.from({ length: 10 }, (_, y) =>
        Array.from({ length: 10 }, (_, x) =>
          y >= 2 && y < 8 && x >= 2 && x < 8 && rows[y - 2][x - 2] === "1" ? 255 : 0,
        ),
      ),
    );
  });

  it("scales cells to the requested size with nearest pixels", () => {
    const marker = generateArucoMarker(0);
    expect(marker).toMatchObject({ width: 120, height: 120, channels: 1, type: "u8" });
    // 20 pixels per cell; cell (1, 1) is white.
    expect(marker.data[30 * 120 + 30]).toBe(255);
    expect(marker.data[10 * 120 + 10]).toBe(0);
    // 61 pixels for 6 cells: the last pixel belongs to the last cell.
    expect(generateArucoMarker(0, { size: 61 }).data[60 * 61 + 60]).toBe(0);
  });

  it("rejects bad input", () => {
    expect(() => generateArucoMarker(50)).toThrow("id must be below 50");
    expect(() => generateArucoMarker(-1)).toThrow(RangeError);
    expect(() => generateArucoMarker(1.5)).toThrow(RangeError);
    expect(() => generateArucoMarker(0, { borderBits: 0 })).toThrow("borderBits");
    expect(() => generateArucoMarker(0, { size: 5 })).toThrow("size must be an integer >= 6");
    expect(() => generateArucoMarker(0, { dictionary: "5x5_100" as never })).toThrow(
      'unknown dictionary "5x5_100"',
    );
  });
});

describe("getArucoDictionary", () => {
  it("unpacks every marker at four rotations, once", () => {
    const dictionary = getArucoDictionary("4x4_50", "test");
    expect(dictionary).toMatchObject({
      markerSize: 4,
      maxCorrectionBits: 1,
      byteCount: 2,
      count: 50,
    });
    // Marker 0 unrotated: 1011 0101 0011 0010.
    expect(Array.from(dictionary.rotations.subarray(0, 2))).toEqual([0b10110101, 0b00110010]);
    expect(getArucoDictionary("4x4_50", "test")).toBe(dictionary);
    expect(getArucoDictionary("6x6_250", "test")).toMatchObject({ byteCount: 5, count: 250 });
  });
});

describe("detectArucoMarkers", () => {
  it("finds markers at any rotation, with their own top-left corner first", () => {
    for (const angle of [0, 90, 180, 270, 33]) {
      const corners = squareCorners(120, 90, 70, angle);
      const found = detectArucoMarkers(scene([{ id: 7, corners }]));

      expect(
        found.map((m) => m.id),
        `${angle}°`,
      ).toEqual([7]);
      expectCorners(found[0].corners, corners);
    }
  });

  it("finds several markers in perspective, by id", () => {
    const a = squareCorners(60, 60, 60, 20, 0.25);
    const b = squareCorners(170, 110, 64, -40, 0.15);
    const found = detectArucoMarkers(
      scene([
        { id: 23, corners: a },
        { id: 4, corners: b },
      ]),
    );

    expect(found.map((m) => m.id)).toEqual([4, 23]);
    expectCorners(found[0].corners, b);
    expectCorners(found[1].corners, a);
  });

  it("orders markers with the same id by position", () => {
    const top = squareCorners(60, 50, 50, 0);
    const left = squareCorners(60, 130, 50, 0);
    const right = squareCorners(170, 50, 50, 0);
    const found = detectArucoMarkers(
      scene([
        { id: 9, corners: right },
        { id: 9, corners: left },
        { id: 9, corners: top },
      ]),
    );

    expect(found.map((m) => m.corners[0])).toEqual(
      [top[0], right[0], left[0]].map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) })),
    );
  });

  it("reads the 6x6 dictionary, correcting a flipped bit", () => {
    const corners = squareCorners(120, 90, 90, 15);
    const image = scene([{ id: 199, corners, dictionary: "6x6_250" }]);
    expect(detectArucoMarkers(image, { dictionary: "6x6_250" }).map((m) => m.id)).toEqual([199]);
    // Not a 4x4 marker.
    expect(detectArucoMarkers(image)).toEqual([]);

    // Paint one inner cell over: still within the dictionary's correction budget.
    const marker = generateArucoMarker(199, { dictionary: "6x6_250", size: 8 });
    const flipped = createMatrix(240, 180);
    flipped.data.fill(210);
    drawQuad(flipped, corners, (u, v) => {
      const cx = Math.floor(u * 8);
      const cy = Math.floor(v * 8);
      const white = marker.data[cy * 8 + cx] > 0;
      return (cx === 3 && cy === 4 ? !white : white) ? 230 : 25;
    });
    expect(detectArucoMarkers(flipped, { dictionary: "6x6_250" }).map((m) => m.id)).toEqual([199]);
  });

  it("finds a marker on a card whose edge runs close to it", () => {
    const image = createMatrix(240, 180);
    image.data.fill(150);
    drawQuad(image, squareCorners(120, 90, 87, 20), () => 235);
    const corners = squareCorners(120, 90, 60, 20);
    const marker = generateArucoMarker(3, { size: 6 });
    drawQuad(image, corners, (u, v) =>
      marker.data[Math.floor(v * 6) * 6 + Math.floor(u * 6)] ? 230 : 30,
    );
    addGaussianNoise(image, 3);

    const found = detectArucoMarkers(image);
    expect(found.map((m) => m.id)).toEqual([3]);
    expectCorners(found[0].corners, corners);
  });

  it("ignores squares that aren't markers and shapes that can't be", () => {
    const image = createMatrix(240, 180);
    image.data.fill(210);
    // A solid black square: uniform inside, all bits 0, no such marker.
    drawQuad(image, squareCorners(50, 50, 50, 10), () => 20);
    // A thin black frame: uniform white inside, so its border is all wrong.
    drawQuad(image, squareCorners(140, 50, 60, 0), (u, v) =>
      u < 0.04 || v < 0.04 || u > 0.96 || v > 0.96 ? 20 : 210,
    );
    // A triangle, a long thin bar, a dot, a square cut by the image edge.
    for (let y = 110; y < 170; y++) {
      for (let x = 20; x < 20 + (y - 110); x++) image.data[y * 240 + x] = 20;
    }
    for (let y = 120; y < 130; y++) image.data.fill(20, y * 240 + 100, y * 240 + 200);
    image.data[150 * 240 + 150] = 0;
    drawQuad(image, squareCorners(232, 150, 40, 0), () => 20);
    // A square 2 pixels from the top edge.
    for (let y = 2; y < 30; y++) image.data.fill(20, y * 240 + 200, y * 240 + 228);
    // A comb whose outline is far longer than any marker's.
    const comb = createMatrix(40, 40);
    comb.data.fill(220);
    for (let y = 5; y < 35; y++) for (let x = 5; x < 35; x += 2) comb.data[y * 40 + x] = 10;
    comb.data.fill(10, 5 * 40 + 5, 5 * 40 + 35);

    expect(detectArucoMarkers(image)).toEqual([]);
    expect(detectArucoMarkers(comb)).toEqual([]);
    const flat = createMatrix(50, 50);
    flat.data.fill(128);
    expect(detectArucoMarkers(flat)).toEqual([]);
  });

  it("rejects bad input", () => {
    expect(() => detectArucoMarkers(createMatrix(10, 10, { channels: 3 }))).toThrow(RangeError);
    expect(() => detectArucoMarkers(createMatrix(10, 10, { type: "f32" }) as never)).toThrow(
      TypeError,
    );
    expect(() => detectArucoMarkers(createMatrix(10, 10), { dictionary: "nope" as never })).toThrow(
      'detectArucoMarkers: unknown dictionary "nope"; use 4x4_50 or 6x6_250',
    );
  });
});

describe("candidateTries", () => {
  /** A 40-pixel square with its top-left corner at (x, 50). */
  const at = (x: number, size = 40): Point[] => [
    { x, y: 50 },
    { x: x + size, y: 50 },
    { x: x + size, y: 50 + size },
    { x, y: 50 + size },
  ];

  it("keeps far-apart quads on their own, largest first", () => {
    expect(candidateTries([at(0), at(100, 50)], 6)).toEqual([[at(100, 50)], [at(0)]]);
  });

  it("reads a group as its largest quad, then quads well away from it", () => {
    // 0.1 pixels apart: the same outline. 3 pixels: more than 0.21 cells (1.4 px).
    expect(candidateTries([at(0.1, 39.8), at(0), at(3, 39.5)], 6)).toEqual([[at(0), at(3, 39.5)]]);
  });

  it("adds a quad to the group of either quad it is close to, and never merges groups", () => {
    // B is only close to C, which is already grouped with A.
    expect(candidateTries([at(0), at(30), at(15)], 6)).toEqual([[at(0), at(30), at(15)]]);
    // K1-J and K2-I form two groups; I-J are close too, but the groups stay apart.
    expect(candidateTries([at(0), at(45), at(30), at(15)], 6)).toEqual([
      [at(0), at(15)],
      [at(45), at(30)],
    ]);
  });
});
