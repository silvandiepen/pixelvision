import { describe, expect, it } from "vitest";
import { groupRectangles } from "./groupRectangles";

const rect = (x: number, y: number, size: number, confidence = 1) => ({
  x,
  y,
  width: size,
  height: size,
  neighbors: 1,
  confidence,
});

describe("groupRectangles", () => {
  it("merges overlapping detections and averages them", () => {
    const merged = groupRectangles([rect(10, 10, 20, 1), rect(12, 11, 22, 3), rect(11, 9, 21, 2)]);

    expect(merged).toEqual([{ x: 11, y: 10, width: 21, height: 21, neighbors: 3, confidence: 3 }]);
  });

  it("keeps separate objects apart", () => {
    expect(groupRectangles([rect(0, 0, 20), rect(100, 100, 20)])).toHaveLength(2);
  });

  it("drops groups with too few members", () => {
    const merged = groupRectangles([rect(0, 0, 20), rect(1, 1, 20), rect(100, 100, 20)], 2);

    expect(merged).toHaveLength(1);
    expect(merged[0].neighbors).toBe(2);
  });

  it("drops a weak small detection inside a strong large one", () => {
    const big = [rect(0, 0, 60), rect(1, 1, 60), rect(0, 1, 60), rect(1, 0, 60)];
    const small = rect(20, 20, 20);

    const merged = groupRectangles([...big, small]);

    expect(merged).toHaveLength(1);
    expect(merged[0].width).toBe(60);
  });

  it("keeps a well-supported small detection inside a large one", () => {
    const big = [rect(0, 0, 60), rect(1, 1, 60), rect(0, 1, 60)];
    const small = [rect(20, 20, 20), rect(21, 21, 20), rect(20, 21, 20)];

    expect(groupRectangles([...big, ...small])).toHaveLength(2);
  });

  it("returns nothing for no detections", () => {
    expect(groupRectangles([])).toEqual([]);
  });
});
