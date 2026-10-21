import { describe, expect, it } from "vitest";
import { parsePathData } from "../test-svg";
import { pathData, writeSvg } from "./svg";
import type { PathSegment } from "./vectorize.model";

const p = (x: number, y: number) => ({ x, y });

describe("pathData", () => {
  it("writes relative, rounded commands without needless characters", () => {
    const segments: PathSegment[] = [
      { type: "M", points: [p(10.04, 20.5)] },
      { type: "L", points: [p(30, 20.5)] },
      { type: "L", points: [p(30, 10.25)] },
      { type: "L", points: [p(29.5, 9.75)] },
      { type: "L", points: [p(29.51, 9.76)] }, // rounds to the same point
      { type: "C", points: [p(25, 5), p(15, 5), p(10, 10)] },
      { type: "L", points: [p(10.04, 20.5)] }, // drawn by z anyway
      { type: "Z", points: [] },
    ];

    expect(pathData(segments, 1)).toBe("M10 20.5h20v-10.2l-.5-.5c-4.5-4.8-14.5-4.8-19.5.2z");
    // At whole pixels the small step rounds away too.
    expect(pathData(segments, 0)).toBe("M10 21h20v-11c-5-5-15-5-20 0z");
  });

  it("steps between rounded points, so the path ends where it started", () => {
    const zigzag: PathSegment[] = [{ type: "M", points: [p(0.04, 0.04)] }];
    for (let i = 1; i <= 50; i++) zigzag.push({ type: "L", points: [p(i * 1.04, (i % 2) * 1.04)] });
    zigzag.push({ type: "Z", points: [] });

    const [points] = parsePathData(pathData(zigzag, 1));
    expect(points[50].x).toBeCloseTo(52, 6);
  });

  it("starts each subpath afresh", () => {
    const two: PathSegment[] = [
      { type: "M", points: [p(0, 0)] },
      { type: "L", points: [p(4, 0)] },
      { type: "L", points: [p(4, 4)] },
      { type: "Z", points: [] },
      { type: "M", points: [p(1, 1)] },
      { type: "L", points: [p(2, 2)] },
      { type: "L", points: [p(3, 1)] },
      { type: "Z", points: [] },
    ];
    expect(pathData(two, 1)).toBe("M0 0h4v4zM1 1l1 1 1-1z");
  });
});

describe("writeSvg", () => {
  it("writes one path element per shape, with its colour", () => {
    const square: PathSegment[] = [
      { type: "M", points: [p(0, 0)] },
      { type: "L", points: [p(2, 0)] },
      { type: "L", points: [p(2, 2)] },
      { type: "Z", points: [] },
    ];
    expect(writeSvg([{ segments: square, holes: 0, color: "#ff0000" }], 4, 3)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3" viewBox="0 0 4 3"><path fill="#ff0000" d="M0 0h2v2z"/></svg>',
    );
  });
});
