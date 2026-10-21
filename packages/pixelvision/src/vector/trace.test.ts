import { describe, expect, it } from "vitest";
import type { Matrix } from "../core/matrix.model";
import { connectedComponents } from "../shape/connectedComponents";
import { fromRows } from "../test-utils";
import { edgeMidpoints, groupShapes, traceLoops } from "./trace";

/**
 * Traces a mask's loops.
 *
 * @param mask - The mask.
 * @returns Its loops.
 */
const trace = (mask: Matrix<"u8">) => traceLoops(mask, connectedComponents(mask).labels.data);

describe("traceLoops", () => {
  it("traces a square along its pixel edges, clockwise from the top-left corner", () => {
    const [loop, ...rest] = trace(
      fromRows([
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ]),
    );

    expect(rest).toEqual([]);
    expect(loop.vertices).toEqual([
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 1, y: 3 },
    ]);
    expect(loop.area).toBe(4);
    expect(loop.label).toBe(1);
  });

  it("traces a hole anticlockwise, with negative area and its region's label", () => {
    const loops = trace(
      fromRows([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ]),
    );

    expect(loops.map((loop) => loop.area)).toEqual([9, -1]);
    expect(loops[1].vertices).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ]);
    expect(loops.map((loop) => loop.label)).toEqual([1, 1]);
  });

  it("joins pixels that touch at a corner into one shape", () => {
    const loops = trace(
      fromRows([
        [1, 0],
        [0, 1],
      ]),
    );

    expect(loops).toHaveLength(1);
    expect(loops[0].area).toBe(2);
    expect(loops[0].vertices).toHaveLength(8);
  });
});

describe("groupShapes", () => {
  it("puts holes with their outline and drops loops below the smallest area", () => {
    const mask = fromRows([
      [1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0],
      [1, 1, 1, 0, 0],
    ]);
    const loops = trace(mask);

    expect(groupShapes(loops, 1).map((shape) => shape.holes.length)).toEqual([1, 0]);
    expect(groupShapes(loops, 2).map((shape) => shape.holes.length)).toEqual([0]);
  });
});

describe("edgeMidpoints", () => {
  it("puts one sample in the middle of every unit edge", () => {
    expect(
      edgeMidpoints([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 },
      ]),
    ).toEqual([
      { x: 0.5, y: 0 },
      { x: 1.5, y: 0 },
      { x: 2, y: 0.5 },
      { x: 1.5, y: 1 },
      { x: 0.5, y: 1 },
      { x: 0, y: 0.5 },
    ]);
  });
});
