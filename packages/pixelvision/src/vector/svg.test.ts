import { describe, expect, it } from "vitest";
import { parsePathData } from "../test-svg";
import { formatNumber, pathData, primitiveData, writeSvg } from "./svg";
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
    expect(writeSvg([{ kind: "path", segments: square, holes: 0, color: "#ff0000" }], 4, 3)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3" viewBox="0 0 4 3"><path fill="#ff0000" d="M0 0h2v2z"/></svg>',
    );
  });
});

describe("formatNumber", () => {
  it("drops trailing zeros, a leading zero and a negative zero", () => {
    expect(formatNumber(12.5, 2)).toBe("12.5");
    expect(formatNumber(-0.25, 1)).toBe("-.3");
    expect(formatNumber(3, 1)).toBe("3");
    expect(formatNumber(-0.01, 1)).toBe("0");
  });
});

describe("primitiveData", () => {
  it("writes circles and ellipses as two half arcs, rounded corners as quarter arcs", () => {
    expect(primitiveData({ kind: "circle", cx: 10, cy: 5, r: 3 }, 1)).toBe(
      "M13 5A3 3 0 1 1 7 5A3 3 0 1 1 13 5z",
    );
    expect(primitiveData({ kind: "ellipse", cx: 0, cy: 0, rx: 4, ry: 2, angle: 90 }, 1)).toBe(
      "M0 4A4 2 90 1 1 0 -4A4 2 90 1 1 0 4z",
    );
    expect(
      primitiveData({ kind: "rect", x: 0, y: 0, width: 10, height: 4, rx: 2, angle: 0 }, 1),
    ).toBe("M2 0L8 0A2 2 0 0 1 10 2L10 2A2 2 0 0 1 8 4L2 4A2 2 0 0 1 0 2L0 2A2 2 0 0 1 2 0z");
    expect(
      primitiveData({ kind: "rect", x: 0, y: 0, width: 2, height: 2, rx: 0, angle: 90 }, 1),
    ).toBe("M2 0L2 2L0 2L0 0z");
    expect(primitiveData({ kind: "polygon", points: [p(0, 0), p(4, 0), p(2, 3)] }, 1)).toBe(
      "M0 0L4 0L2 3z",
    );
  });
});

describe("writeSvg with shapes", () => {
  it("writes each primitive as its own element, turned when it's turned", () => {
    const svg = writeSvg(
      [
        { kind: "circle", cx: 5, cy: 5, r: 2, color: "#ff0000" },
        { kind: "circle", cx: 5, cy: 5, r: 3, strokeWidth: 1, color: "#00ff00" },
        { kind: "ellipse", cx: 5, cy: 5, rx: 3, ry: 1, angle: 0 },
        { kind: "ellipse", cx: 5, cy: 5, rx: 3, ry: 1, angle: 30 },
        { kind: "rect", x: 1, y: 2, width: 3, height: 4, rx: 0, angle: 0 },
        { kind: "rect", x: 1, y: 2, width: 3, height: 4, rx: 1, angle: -10 },
        { kind: "polygon", points: [p(0, 0), p(4, 0.25), p(2, 3)] },
        {
          kind: "path",
          segments: [],
          holes: 1,
          parts: [
            { kind: "rect", x: 0, y: 0, width: 4, height: 4, rx: 0, angle: 0 },
            { kind: "circle", cx: 2, cy: 2, r: 1 },
          ],
        },
      ],
      10,
      10,
    );
    expect(svg.replace(/^<svg[^>]*>|<\/svg>$/g, "").split("/>")).toEqual([
      '<circle fill="#ff0000" cx="5" cy="5" r="2"',
      '<circle fill="none" stroke="#00ff00" stroke-width="1" cx="5" cy="5" r="3"',
      '<ellipse cx="5" cy="5" rx="3" ry="1"',
      '<ellipse cx="5" cy="5" rx="3" ry="1" transform="rotate(30 5 5)"',
      '<rect x="1" y="2" width="3" height="4"',
      '<rect x="1" y="2" width="3" height="4" rx="1" transform="rotate(-10 2.5 4)"',
      '<polygon points="0,0 4,.3 2,3"',
      '<path fill-rule="evenodd" d="M0 0L4 0L4 4L0 4zM3 2A1 1 0 1 1 1 2A1 1 0 1 1 3 2z"',
      "",
    ]);
  });
});
