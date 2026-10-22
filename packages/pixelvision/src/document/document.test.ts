import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import type { Point } from "../math/transforms.model";
import { extractDocument, findDocument, orderCorners, toQuad } from "./document";
import type { Quad } from "./document.model";

/** Draws a filled quadrilateral of `fg` on a textured `bg` RGBA scene. */
const scene = (
  width: number,
  height: number,
  quad: Quad,
  fg: number,
  bg: (n: number) => number,
) => {
  const data = new Uint8ClampedArray(width * height * 4);
  const inside = (x: number, y: number) =>
    quad.every((a, i) => {
      const b = quad[(i + 1) % 4];
      return (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) >= 0;
    });
  let seed = 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const n = (seed >>> 24) / 255;
      const v = inside(x, y) ? fg + n * 12 : bg(n);
      data.set([v, v * 0.98, v * 0.95, 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
};

const quad: Quad = [
  { x: 150, y: 110 },
  { x: 470, y: 140 },
  { x: 500, y: 360 },
  { x: 120, y: 330 },
];
const close = (found: readonly Point[], expected: readonly Point[], tolerance: number) =>
  found.forEach((p, i) => {
    expect(Math.abs(p.x - expected[i].x)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(p.y - expected[i].y)).toBeLessThanOrEqual(tolerance);
  });

describe("findDocument", () => {
  it("finds a light document on a dark textured background", () => {
    const found = findDocument(scene(640, 480, quad, 215, (n) => 40 + n * 50))!;

    close(found.corners, quad, 4);
    expect(found.area).toBeGreaterThan(0.2);
  });

  it("finds a dark document on a light background", () => {
    close(findDocument(scene(640, 480, quad, 50, (n) => 200 + n * 40))!.corners, quad, 4);
  });

  it("works on gray and RGB matrices at full resolution", () => {
    const rgba = scene(
      320,
      240,
      quad.map((p) => ({ x: p.x / 2, y: p.y / 2 })) as Quad,
      215,
      (n) => 40 + n * 50,
    );
    const rgb = createMatrix(320, 240, { channels: 3 });
    for (let i = 0, j = 0; i < rgba.data.length; i += 4, j += 3)
      rgb.data.set(rgba.data.subarray(i, i + 3), j);
    const gray = createMatrix(320, 240);
    for (let i = 0; i < gray.data.length; i++) gray.data[i] = rgba.data[i * 4];

    expect(findDocument(rgb)).not.toBeNull();
    expect(findDocument(gray)).not.toBeNull();
  });

  it("returns null when nothing stands out, or for tiny images", () => {
    expect(
      findDocument(
        scene(320, 240, quad, 60, (n) => 40 + n * 50),
        { minArea: 0.9 },
      ),
    ).toBeNull();
    expect(findDocument(createMatrix(4, 4))).toBeNull();
  });

  it("rejects a real document outside the area limits", () => {
    expect(
      findDocument(
        scene(640, 480, quad, 215, (n) => 40 + n * 50),
        { minArea: 0.5 },
      ),
    ).toBeNull();
    expect(
      findDocument(
        scene(640, 480, quad, 215, (n) => 40 + n * 50),
        { maxArea: 0.1 },
      ),
    ).toBeNull();
  });

  it("ignores shapes that aren't quadrilaterals", () => {
    const data = new Uint8ClampedArray(200 * 200 * 4);
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const v = (x - 100) ** 2 + (y - 100) ** 2 < 70 ** 2 ? 220 : 30;
        data.set([v, v, v, 255], (y * 200 + x) * 4);
      }
    }

    expect(findDocument({ width: 200, height: 200, data })).toBeNull();
  });
});

describe("toQuad", () => {
  it("rejects a shape that never simplifies to four corners", () => {
    // A five-pointed star: its deep notches survive any reasonable tolerance.
    const star = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? 20 : 100;
      const a = (i * Math.PI) / 5;
      return { x: 120 + r * Math.cos(a), y: 120 + r * Math.sin(a) };
    });

    expect(toQuad(star)).toBeNull();
  });
});

describe("toQuad (concave)", () => {
  it("rejects a concave four-cornered shape (a dart)", () => {
    const corners = [
      { x: 0, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 100 },
      { x: 60, y: 50 },
    ];
    const outline = corners.flatMap((a, i) => {
      const b = corners[(i + 1) % 4];
      return Array.from({ length: 40 }, (_, k) => ({
        x: a.x + ((b.x - a.x) * k) / 40,
        y: a.y + ((b.y - a.y) * k) / 40,
      }));
    });

    expect(toQuad(outline)).toBeNull();
  });
});

describe("orderCorners", () => {
  it("orders any permutation as top-left, top-right, bottom-right, bottom-left", () => {
    expect(orderCorners([quad[2], quad[0], quad[3], quad[1]])).toEqual(quad);
  });

  it("starts at the corner nearest the origin even when it isn't first by angle", () => {
    const tilted = [
      { x: 0, y: 30 },
      { x: 20, y: 0 },
      { x: 100, y: 70 },
      { x: 80, y: 100 },
    ];

    expect(orderCorners(tilted)[0]).toEqual({ x: 20, y: 0 });
  });
});

describe("extractDocument", () => {
  const image = scene(640, 480, quad, 215, (n) => 40 + n * 50);

  it("straightens to the measured size, keeping channels", () => {
    const flat = extractDocument(image, quad);

    expect(flat.channels).toBe(4);
    // The longer of the top (321 px) and bottom (381 px) edges.
    expect(flat.width).toBe(Math.round(Math.hypot(380, 30)));
    // The inside of the document is light everywhere.
    expect(
      flat.data[(Math.floor(flat.height / 2) * flat.width + Math.floor(flat.width / 2)) * 4],
    ).toBeGreaterThan(200);
  });

  it("honours width, height and aspect ratio", () => {
    expect(extractDocument(image, quad, { width: 200, height: 100 })).toMatchObject({
      width: 200,
      height: 100,
    });
    expect(extractDocument(image, quad, { width: 856, aspectRatio: 85.6 / 53.98 }).height).toBe(
      540,
    );
  });

  it("accepts u8 matrices", () => {
    const gray = createMatrix(640, 480);

    expect(extractDocument(gray, quad).channels).toBe(1);
  });
});

describe("findDocument with reportCut", () => {
  // The right-hand corners lie beyond the 640 px wide image.
  const offRight: Quad = [
    { x: 300, y: 100 },
    { x: 760, y: 120 },
    { x: 760, y: 380 },
    { x: 280, y: 360 },
  ];
  const dark = (n: number) => 40 + n * 50;

  it("reports a document running off the edge as cut, only when asked", () => {
    const image = scene(640, 480, offRight, 215, dark);

    expect(findDocument(image)).toBeNull();
    const found = findDocument(image, { reportCut: true });

    expect(found?.cut).toBe(true);
    if (!found?.cut) return;
    expect(found.outline.filter((p) => p.x >= 636).length).toBeGreaterThanOrEqual(2);
    expect(found.area).toBeGreaterThan(0.2);
  });

  it("prefers a whole document and returns it unflagged", () => {
    const found = findDocument(scene(640, 480, quad, 215, dark), { reportCut: true });

    expect(found?.cut).toBeUndefined();
    if (found?.cut !== undefined) return;
    close(found!.corners, quad, 4);
  });

  it("doesn't call a region touching three sides a document", () => {
    const wall: Quad = [
      { x: -20, y: -20 },
      { x: 660, y: -20 },
      { x: 660, y: 300 },
      { x: -20, y: 280 },
    ];

    expect(findDocument(scene(640, 480, wall, 215, dark), { reportCut: true })).toBeNull();
  });

  it("finds nothing in a plain image", () => {
    expect(
      findDocument(
        scene(64, 48, quad, 60, () => 60),
        { reportCut: true },
      ),
    ).toBeNull();
  });
});

describe("findDocument with reportCut: shapes that aren't a cut document", () => {
  /** A light shape given by `inside` on a dark textured 640×480 background. */
  const shapeScene = (inside: (x: number, y: number) => boolean) => {
    const width = 640;
    const height = 480;
    const data = new Uint8ClampedArray(width * height * 4);
    let seed = 5;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const n = (seed >>> 24) / 255;
        const v = inside(x, y) ? 215 + n * 12 : 40 + n * 50;
        data.set([v, v, v, 255], (y * width + x) * 4);
      }
    }
    return { width, height, data };
  };
  const report = (inside: (x: number, y: number) => boolean) =>
    findDocument(shapeScene(inside), { reportCut: true });

  it("keeps the largest of two cut documents", () => {
    const found = report(
      (x, y) => (x > 400 && y > 100 && y < 380) || (x < 120 && y > 200 && y < 330),
    );

    expect(found?.cut).toBe(true);
    if (!found?.cut) return;
    expect(Math.min(...found.outline.map((p) => p.x))).toBeGreaterThan(390);
  });

  it("ignores a cut region below the smallest size", () => {
    expect(report((x, y) => x > 620 && y > 200 && y < 240)).toBeNull();
  });

  it("rejects a triangle, a half disc and an L shape", () => {
    // Triangle with one side on the right edge.
    expect(report((x, y) => x > 400 && Math.abs(y - 240) < (x - 400) * 0.8)).toBeNull();
    // Half a disc centred on the right edge: round, so not a document.
    expect(report((x, y) => (x - 639) ** 2 + (y - 240) ** 2 < 180 ** 2)).toBeNull();
    // An L running off the bottom: never convex.
    expect(
      report((x, y) => (x > 200 && x < 300 && y > 150) || (x > 200 && x < 520 && y > 380)),
    ).toBeNull();
  });
});

describe("findDocument on a blank image", () => {
  it("finds nothing, with no bright or dark class to split again", () => {
    const blank = createMatrix(80, 60);
    // All black: Otsu puts the level at 0, so nothing is brighter than it.
    blank.data.fill(0);
    expect(findDocument(blank)).toBeNull();
  });
});
