import type { VectorPath } from "pixelvision";
import { describe, expect, it } from "vitest";
import { flattenSegments, maskIou, rasterizePaths } from "./vector";

const p = (x: number, y: number) => ({ x, y });

describe("vector", () => {
  const ring: VectorPath = {
    holes: 1,
    segments: [
      { type: "M", points: [p(1, 1)] },
      { type: "L", points: [p(5, 1)] },
      { type: "L", points: [p(5, 5)] },
      { type: "L", points: [p(1, 5)] },
      { type: "Z", points: [] },
      // The hole runs the other way round.
      { type: "M", points: [p(2, 2)] },
      { type: "L", points: [p(2, 4)] },
      { type: "L", points: [p(4, 4)] },
      { type: "L", points: [p(4, 2)] },
      { type: "Z", points: [] },
    ],
  };

  it("fills paths at pixel centres, leaving holes empty", () => {
    const mask = rasterizePaths([ring], 6, 6);
    expect(Array.from({ length: 6 }, (_, y) => [...mask.slice(y * 6, y * 6 + 6)].join(""))).toEqual(
      ["000000", "011110", "010010", "010010", "011110", "000000"],
    );
  });

  it("flattens curves and compares masks", () => {
    const [polygon] = flattenSegments([
      { type: "M", points: [p(0, 0)] },
      { type: "C", points: [p(0, 4), p(4, 4), p(4, 0)] },
      { type: "Z", points: [] },
    ]);
    expect(polygon).toHaveLength(17);
    expect(polygon[8]).toEqual(p(2, 3));
    expect(maskIou([1, 1, 0, 0], [1, 0, 1, 0])).toBeCloseTo(1 / 3);
    expect(maskIou([0, 0], [0, 0])).toBe(1);
  });
});
