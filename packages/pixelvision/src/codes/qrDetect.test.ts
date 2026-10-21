import { describe, expect, it } from "vitest";
import { perspectiveTransform } from "../math/transforms";
import type { FinderPattern } from "./qrCode.model";
import { decodeFinders, refineTransform } from "./qrCode";
import type { Binary } from "./qrDetect";
import {
  crossRuns,
  findAlignmentPattern,
  finderCorners,
  finderTriples,
  patternWidth,
  ringModules,
} from "./qrDetect";

/**
 * A thresholded image from a function.
 *
 * @param width - Width.
 * @param height - Height.
 * @param dark - Whether a pixel is dark.
 * @returns The image.
 */
const binary = (width: number, height: number, dark: (x: number, y: number) => boolean): Binary => {
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) data[y * width + x] = dark(x, y) ? 1 : 0;
  return { width, height, data };
};

/**
 * A finder pattern of 4-pixel modules centred at (cx, cy): rings by distance.
 *
 * @param cx - Centre column.
 * @param cy - Centre row.
 * @returns Whether a pixel of it is dark.
 */
const finder = (cx: number, cy: number) => (x: number, y: number) => {
  const ring = Math.max(Math.abs(x + 0.5 - cx), Math.abs(y + 0.5 - cy)) / 4;
  return ring < 1.5 || (ring >= 2.5 && ring < 3.5);
};

const pattern = (x: number, y: number, moduleSize = 4): FinderPattern => ({
  x,
  y,
  moduleSize,
  count: 3,
});

describe("crossRuns", () => {
  it("measures the five runs through the centre square", () => {
    const image = binary(60, 60, finder(30, 30));
    expect(crossRuns(image, 30, 30, 1, 0, 20)).toEqual({ runs: [4, 4, 12, 4, 4], centre: -0.5 });
  });

  it("needs a dark start, bounded runs and the image around them", () => {
    const image = binary(60, 60, finder(30, 30));
    expect(crossRuns(image, 30, 21, 1, 0, 20)).toBeUndefined(); // in the light ring
    expect(crossRuns(image, 30, 30, 1, 0, 3)).toBeUndefined(); // outer runs too long
    // Centre square cut by the image edge: no light run before it.
    expect(crossRuns(binary(30, 30, finder(4, 15)), 4, 15, 1, 0, 20)).toBeUndefined();
  });
});

describe("finderTriples", () => {
  it("orders the corner at the right angle first, then clockwise", () => {
    // Given anticlockwise: still top-left, top-right, bottom-left.
    const [best] = finderTriples([pattern(20, 20), pattern(20, 120), pattern(120, 20)]);
    expect(best.map((p) => [p.x, p.y])).toEqual([
      [20, 20],
      [120, 20],
      [20, 120],
    ]);
  });

  it("ranks triples and skips ones that can't be a code", () => {
    const triples = finderTriples([
      pattern(20, 20),
      pattern(120, 20),
      pattern(20, 120),
      pattern(125, 128), // makes a worse right angle with two of them
      pattern(300, 300, 9), // a different module size
      pattern(30, 22), // too close to (20, 20)
      { ...pattern(500, 500), count: 1 }, // seen once only
    ]);
    expect(triples[0].map((p) => [p.x, p.y])).toEqual([
      [20, 20],
      [120, 20],
      [20, 120],
    ]);
    expect(triples.length).toBeGreaterThan(1);
    expect(triples.flat().some((p) => p.moduleSize === 9 || p.count === 1)).toBe(false);
    // A flat triangle is no code.
    expect(finderTriples([pattern(0, 0), pattern(100, 0), pattern(200, 5)])).toEqual([]);
  });
});

describe("finder geometry", () => {
  it("measures a pattern's width and traces its corners", () => {
    const image = binary(60, 60, finder(30, 30));
    // 7 modules of 4 pixels, measured in half-pixel steps.
    expect(patternWidth(image, { x: 30, y: 30 }, { x: 59, y: 30 })).toBe(28.5);
    const corners = finderCorners(image, { x: 30, y: 30 }, { x: 59, y: 30 }, 4);
    expect(corners!.map((c) => [Math.round(c.x), Math.round(c.y)]).sort()).toEqual([
      [16, 16],
      [16, 44],
      [44, 16],
      [44, 44],
    ]);
  });

  it("gives up when there is no pattern to measure", () => {
    const light = binary(60, 60, () => false);
    const dark = binary(60, 60, () => true);
    expect(patternWidth(light, { x: 30, y: 30 }, { x: 59, y: 30 })).toBeUndefined();
    expect(finderCorners(light, { x: 30, y: 30 }, { x: 59, y: 30 }, 4)).toBeUndefined();
    // A ring that runs on into the dark surroundings.
    expect(finderCorners(dark, { x: 30, y: 30 }, { x: 59, y: 30 }, 4)).toBeUndefined();
    // A round ring has no four corners.
    const round = binary(60, 60, (x, y) => {
      const r = Math.hypot(x + 0.5 - 30, y + 0.5 - 30) / 4;
      return r < 1.5 || (r >= 2.5 && r < 3.5);
    });
    expect(finderCorners(round, { x: 30, y: 30 }, { x: 59, y: 30 }, 4)).toBeUndefined();
  });

  it("snaps traced corners to module coordinates, or rejects them", () => {
    const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const square = [
      { x: 0.2, y: -0.1 },
      { x: 7.1, y: 0 },
      { x: 6.9, y: 7.2 },
      { x: 0, y: 6.8 },
    ];
    expect(ringModules(square, identity, { x: 0, y: 0 })).toEqual([
      { x: 0, y: 0 },
      { x: 7, y: 0 },
      { x: 7, y: 7 },
      { x: 0, y: 7 },
    ]);
    // Two corners on one place, or one far from any.
    expect(
      ringModules([square[0], square[0], square[2], square[3]], identity, { x: 0, y: 0 }),
    ).toBeUndefined();
    expect(
      ringModules([{ x: 3, y: 3 }, ...square.slice(1)], identity, { x: 0, y: 0 }),
    ).toBeUndefined();
  });
});

describe("findAlignmentPattern", () => {
  it("finds the pattern's centre, or nothing", () => {
    // 5 x 5 modules of 4 pixels centred at (40, 40), in a light field.
    const image = binary(80, 80, (x, y) => {
      const ring = Math.max(Math.abs(x + 0.5 - 40), Math.abs(y + 0.5 - 40)) / 4;
      return ring < 0.5 || (ring >= 1.5 && ring < 2.5);
    });
    const right = { x: 4, y: 0 };
    const down = { x: 0, y: 4 };
    const centre = findAlignmentPattern(image, { x: 44, y: 37 }, right, down, 4);
    expect(centre!.x).toBeCloseTo(40, 0);
    expect(centre!.y).toBeCloseTo(40, 0);
    expect(
      findAlignmentPattern(
        binary(80, 80, () => false),
        { x: 40, y: 40 },
        right,
        down,
        4,
      ),
    ).toBeUndefined();
  });
});

describe("refineTransform", () => {
  const fallback = perspectiveTransform(
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ],
  );

  it("keeps the first estimate without enough points or a fit", () => {
    const few = [{ x: 0, y: 0 }];
    expect(refineTransform(few, few, fallback, 4)).toBe(fallback);
    // Eight points on one line: no homography fits them.
    const line = Array.from({ length: 8 }, (_, i) => ({ x: i, y: 0 }));
    expect(refineTransform(line, line, fallback, 4)).toBe(fallback);
  });

  it("fits all points when there are enough", () => {
    const from = Array.from({ length: 9 }, (_, i) => ({ x: i % 3, y: Math.floor(i / 3) }));
    const to = from.map((p) => ({ x: 3 * p.x + 1, y: 3 * p.y - 2 }));
    const fit = refineTransform(from, to, fallback, 4);
    expect(fit).not.toBe(fallback);
    expect(fit[0]).toBeCloseTo(3, 9);
    expect(fit[5]).toBeCloseTo(-2, 9);
  });
});

describe("decodeFinders", () => {
  it("gives up when the patterns can't be measured", () => {
    const light = binary(200, 200, () => false);
    expect(decodeFinders(light, [pattern(20, 20), pattern(150, 20), pattern(20, 150)])).toBeNull();
  });
});
