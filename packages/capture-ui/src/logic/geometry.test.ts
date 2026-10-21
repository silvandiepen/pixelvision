import { describe, expect, it } from "vitest";
import {
  assessFace,
  boxToView,
  bracketsPath,
  containTransform,
  coverTransform,
  fromView,
  guideFor,
  guidePath,
  holeMask,
  inflateGuide,
  round,
  roundedPolygonPath,
  toView,
  viewfinderPath,
} from "./geometry";

describe("coverTransform", () => {
  it("scales a landscape frame to cover a portrait view and centres it", () => {
    const t = coverTransform(640, 480, 300, 600);
    expect(t.scale).toBe(1.25);
    expect(t.offsetX).toBe((300 - 800) / 2);
    expect(t.offsetY).toBe(0);
    expect(t.mirrored).toBe(false);
  });

  it("falls back to scale 1 before the video has a size", () => {
    expect(coverTransform(0, 0, 300, 600).scale).toBe(1);
  });
});

describe("containTransform", () => {
  it("fits the image inside the view", () => {
    const t = containTransform(1000, 500, 400, 400);
    expect(t.scale).toBe(0.4);
    expect(t.offsetX).toBe(0);
    expect(t.offsetY).toBe(100);
  });

  it("falls back to scale 1 for an empty image", () => {
    expect(containTransform(0, 10, 400, 400).scale).toBe(1);
  });
});

describe("toView and fromView", () => {
  it("round-trip a point, mirrored and not", () => {
    for (const mirrored of [false, true]) {
      const t = coverTransform(640, 480, 300, 600, mirrored);
      const p = { x: 100, y: 50 };
      const back = fromView(toView(p, t), t);
      expect(back.x).toBeCloseTo(100);
      expect(back.y).toBeCloseTo(50);
    }
  });

  it("flips x when mirrored", () => {
    const plain = coverTransform(100, 100, 100, 100);
    const mirror = coverTransform(100, 100, 100, 100, true);
    expect(toView({ x: 10, y: 0 }, plain).x).toBe(10);
    expect(toView({ x: 10, y: 0 }, mirror).x).toBe(90);
  });
});

describe("boxToView", () => {
  it("keeps a positive width when mirrored", () => {
    const t = coverTransform(100, 100, 100, 100, true);
    expect(boxToView({ x: 10, y: 20, width: 30, height: 40 }, t)).toEqual({
      x: 60,
      y: 20,
      width: 30,
      height: 40,
    });
  });

  it("scales and offsets", () => {
    const t = coverTransform(100, 50, 200, 200);
    expect(boxToView({ x: 0, y: 0, width: 10, height: 10 }, t)).toEqual({
      x: -100,
      y: 0,
      width: 40,
      height: 40,
    });
  });
});

describe("guideFor", () => {
  it("makes an oval limited by height on a portrait view", () => {
    const g = guideFor(600, 800);
    expect(g.shape).toBe("oval");
    expect(g.ry).toBeCloseTo((800 * 0.62) / 2);
    expect(g.rx).toBeCloseTo(g.ry * 0.78);
    expect(g.cx).toBe(300);
    expect(g.cy).toBeCloseTo(800 * 0.44);
    expect(g.corner).toBe(g.rx);
  });

  it("is limited by width on a narrow view", () => {
    const g = guideFor(200, 800, { aspect: 1 });
    expect(g.rx * 2).toBeCloseTo(200 * 0.82);
  });

  it("forces aspect 1 for circles", () => {
    const g = guideFor(400, 400, { shape: "circle", aspect: 0.5 });
    expect(g.rx).toBe(g.ry);
  });

  it("gives rectangles a softer corner", () => {
    const g = guideFor(400, 800, { shape: "rect" });
    expect(g.corner).toBeCloseTo(Math.min(g.rx, g.ry) * 0.38);
  });

  it("never goes negative", () => {
    expect(guideFor(0, -10).ry).toBe(0);
  });
});

describe("assessFace", () => {
  const guide = guideFor(400, 800);
  const centred = (width: number) => ({
    x: guide.cx - width / 2,
    y: guide.cy - width / 2,
    width,
    height: width,
  });

  it("reports no face", () => {
    expect(assessFace(undefined, guide)).toBe("no-face");
    expect(assessFace(centred(10), { ...guide, rx: 0 })).toBe("no-face");
  });

  it("reports off-centre before size", () => {
    expect(assessFace({ ...centred(20), x: 0 }, guide)).toBe("off-centre");
  });

  it("reports too far, too close and aligned", () => {
    const width = guide.rx * 2;
    expect(assessFace(centred(width * 0.3), guide)).toBe("too-far");
    expect(assessFace(centred(width * 1.2), guide)).toBe("too-close");
    expect(assessFace(centred(width * 0.7), guide)).toBe("aligned");
  });

  it("takes tolerances", () => {
    const width = guide.rx * 2;
    expect(assessFace(centred(width * 0.3), guide, { minFill: 0.2 })).toBe("aligned");
    expect(assessFace(centred(width * 0.7), guide, { maxFill: 0.6 })).toBe("too-close");
    expect(assessFace({ ...centred(width * 0.7), x: 10 }, guide, { maxOffset: 5 })).toBe("aligned");
  });
});

describe("paths", () => {
  it("draws an ellipse from the top", () => {
    const d = guidePath({ shape: "oval", cx: 50, cy: 50, rx: 20, ry: 30, corner: 20 });
    expect(d).toBe("M 50 20 A 20 30 0 0 1 50 80 A 20 30 0 0 1 50 20 Z");
  });

  it("draws a rounded rectangle from the top", () => {
    const d = guidePath({ shape: "rect", cx: 50, cy: 50, rx: 20, ry: 30, corner: 5 });
    expect(d.startsWith("M 50 20 H 65 A 5 5")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
  });

  it("inflates a guide", () => {
    const g = inflateGuide({ shape: "oval", cx: 0, cy: 0, rx: 10, ry: 20, corner: 10 }, 5);
    expect([g.rx, g.ry, g.corner]).toEqual([15, 25, 15]);
  });

  it("rounds a polygon's corners", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const d = roundedPolygonPath(square, 10);
    expect(d.startsWith("M 0 10 Q 0 0 10 0")).toBe(true);
    expect(d.match(/Q/g)).toHaveLength(4);
    expect(roundedPolygonPath(square.slice(0, 2), 10)).toBe("");
  });

  it("limits rounding to half an edge and survives repeated points", () => {
    const d = roundedPolygonPath(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 4, y: 0 },
      ],
      10,
    );
    expect(d).toContain("M 0 0");
    expect(d).not.toContain("NaN");
  });

  it("draws four brackets", () => {
    const d = bracketsPath({ x: 0, y: 0, width: 100, height: 100 });
    expect(d.match(/M/g)).toHaveLength(4);
    expect(d.startsWith("M 0 24 V 10 Q 0 0 10 0 H 24")).toBe(true);
  });

  it("draws a viewfinder inset in the view", () => {
    expect(viewfinderPath(100, 100, 10)).toBe(
      bracketsPath({ x: 10, y: 10, width: 80, height: 80 }),
    );
    expect(viewfinderPath(10, 10, 20)).toBe(bracketsPath({ x: 20, y: 20, width: 0, height: 0 }));
  });

  it("builds a mask with a hole", () => {
    const mask = holeMask(100.123, 50, "M 1 1 Z");
    expect(mask.startsWith('url("data:image/svg+xml,')).toBe(true);
    const svg = decodeURIComponent(mask.slice(24, -2));
    expect(svg).toContain('viewBox="0 0 100.12 50"');
    expect(svg).toContain("M0 0H100.12V50H0Z M 1 1 Z");
    expect(svg).toContain('fill-rule="evenodd"');
  });

  it("rounds to two decimals", () => {
    expect(round(1.23456)).toBe(1.23);
  });
});
