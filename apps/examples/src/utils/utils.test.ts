import { createMatrix, matrixFromRows } from "pixelvision";
import { describe, expect, it } from "vitest";
import { fnv1a } from "./checksum";
import { toDisplayPixels } from "./display";
import { round, roundRows, toRows } from "./format";
import { lineThrough, rectangleCorners, rowsToPoints, sameLine } from "./geometry";
import { fitSize } from "./input";
import {
  countDifferences,
  countNonZero,
  countSharpSteps,
  histogram,
  maxDifference,
  mean,
  minMax,
  standardDeviation,
  valueAt,
} from "./stats";
import { splitInlineCode } from "./text";
import {
  blankImage,
  gradientMagnitude,
  gradientsToColor,
  houghLineToSegment,
  normalizeToGray,
} from "./visualize";

describe("stats", () => {
  const m = matrixFromRows([
    [0, 2],
    [4, 6],
  ]);

  it("summarises values", () => {
    expect(countNonZero(m)).toBe(3);
    expect(mean(m)).toBe(3);
    expect(minMax(m)).toEqual([0, 6]);
    expect(standardDeviation(m)).toBeCloseTo(Math.sqrt(5));
    expect(valueAt(m, 1, 1)).toBe(6);
    expect(countSharpSteps(m, 1)).toBe(2);
  });

  it("compares matrices and lists", () => {
    expect(
      countDifferences(
        m,
        matrixFromRows([
          [0, 2],
          [4, 7],
        ]),
      ),
    ).toBe(1);
    expect(countDifferences(m, matrixFromRows([[0, 2, 3]]))).toBe(Infinity);
    expect(maxDifference([1, 2], [1.5, 2])).toBe(0.5);
    expect(maxDifference([1], [1, 2])).toBe(Infinity);
  });

  it("counts gray levels", () => {
    const gray = createMatrix(2, 1, { data: new Uint8Array([3, 3]) });
    expect(histogram(gray)[3]).toBe(2);
  });
});

describe("format", () => {
  it("rounds and reshapes", () => {
    expect(round(1.23456, 2)).toBe(1.23);
    expect(Object.is(round(-0.00001), 0)).toBe(true);
    expect(roundRows([[1.006]], 2)).toEqual([[1.01]]);
    expect(toRows([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});

describe("geometry", () => {
  it("finds the normal form of horizontal and vertical lines", () => {
    const horizontal = lineThrough({ x: 0, y: 10 }, { x: 5, y: 10 });
    expect(horizontal.theta).toBeCloseTo(Math.PI / 2);
    expect(horizontal.rho).toBeCloseTo(10);
    const vertical = lineThrough({ x: 7, y: 0 }, { x: 7, y: 5 });
    expect(vertical.theta).toBeCloseTo(0);
    expect(vertical.rho).toBeCloseTo(7);
  });

  it("treats (rho, theta) and (-rho, theta - pi) as the same line", () => {
    expect(sameLine({ rho: 30, theta: 0 }, { rho: -30, theta: Math.PI - 0.01 }, 1, 0.02)).toBe(
      true,
    );
    expect(sameLine({ rho: 30, theta: 0 }, { rho: 40, theta: 0 }, 1, 0.02)).toBe(false);
  });

  it("builds corners and points", () => {
    expect(rectangleCorners(2, 1)[2]).toEqual({ x: 2, y: 1 });
    expect(rowsToPoints([[1, 2]])).toEqual([{ x: 1, y: 2 }]);
  });
});

describe("visualize", () => {
  it("scales values to 0-255", () => {
    expect(Array.from(normalizeToGray([5, 10, 15], 3, 1).data)).toEqual([0, 128, 255]);
    expect(blankImage(2, 2).data[3]).toBe(236);
  });

  it("shows gradients", () => {
    const gradients = createMatrix(1, 1, {
      type: "i32",
      channels: 2,
      data: new Int32Array([-4, 0]),
    });
    expect(Array.from(gradientsToColor(gradients).data)).toEqual([1, 128, 191]);
    expect(gradientMagnitude(gradients).data[0]).toBe(0);
  });

  it("clips Hough lines to the image", () => {
    const segment = houghLineToSegment({ rho: 10, theta: Math.PI / 2, votes: 1 }, 100, 50);
    expect(segment?.from.x).toBeCloseTo(0);
    expect(segment?.from.y).toBeCloseTo(10);
    expect(segment?.to.x).toBeCloseTo(100);
    expect(segment?.to.y).toBeCloseTo(10);
    expect(houghLineToSegment({ rho: 500, theta: 0, votes: 1 }, 100, 50)).toBeNull();
  });
});

describe("display", () => {
  it("makes every pixel opaque and hashes the result", () => {
    const pixels = toDisplayPixels({
      width: 1,
      height: 1,
      data: new Uint8ClampedArray([9, 8, 7, 0]),
    });
    expect(Array.from(pixels.data)).toEqual([9, 8, 7, 255]);
    expect(pixels.checksum).toBe(fnv1a([9, 8, 7, 255]));
  });

  it("spreads gray over RGB", () => {
    const gray = createMatrix(1, 1, { data: new Uint8Array([42]) });
    expect(Array.from(toDisplayPixels(gray).data)).toEqual([42, 42, 42, 255]);
  });
});

describe("checksum", () => {
  it("is FNV-1a", () => {
    expect(fnv1a([])).toBe("811c9dc5");
    expect(fnv1a([97])).toBe("e40c292c");
  });
});

describe("input", () => {
  it("fits sizes without enlarging", () => {
    expect(fitSize(1280, 960, { width: 640, height: 480 })).toEqual({ width: 640, height: 480 });
    expect(fitSize(100, 50, { width: 640, height: 480 })).toEqual({ width: 100, height: 50 });
  });
});

describe("text", () => {
  it("splits inline code", () => {
    expect(splitInlineCode("use `canny` here")).toEqual([
      { text: "use ", code: false },
      { text: "canny", code: true },
      { text: " here", code: false },
    ]);
  });
});
