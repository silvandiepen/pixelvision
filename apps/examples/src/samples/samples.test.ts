import { describe, expect, it } from "vitest";
import { fnv1a } from "../utils/checksum";
import { seededRandom } from "./random";
import { insidePolygon, quadPoint } from "./raster";
import { SAMPLES, getSample } from "./samples";

describe("samples", () => {
  it.each(SAMPLES.map((sample) => [sample.id, sample] as const))(
    "%s is 320 x 240, opaque and the same every time",
    (_, sample) => {
      const first = sample.generate();
      expect(first.width).toBe(320);
      expect(first.height).toBe(240);
      expect(first.data.every((value, i) => i % 4 !== 3 || value === 255)).toBe(true);
      expect(fnv1a(sample.generate().data)).toBe(fnv1a(first.data));
    },
  );

  it("throws for an unknown sample", () => {
    expect(() => getSample("nope" as never)).toThrow("Unknown sample");
  });
});

describe("raster", () => {
  it("repeats a seeded sequence", () => {
    const a = seededRandom(1);
    const b = seededRandom(1);
    expect([a(), a()]).toEqual([b(), b()]);
  });

  it("tests points against polygons and maps unit squares onto quads", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(insidePolygon(square, 5, 5)).toBe(true);
    expect(insidePolygon(square, 15, 5)).toBe(false);
    expect(quadPoint(square, 0.5, 0.5)).toEqual({ x: 5, y: 5 });
  });
});
