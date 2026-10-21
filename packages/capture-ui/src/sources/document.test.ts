import { describe, expect, it } from "vitest";
import { mainThreadDocumentFinder } from "./document";

describe("mainThreadDocumentFinder", () => {
  it("finds a bright card on a dark background", () => {
    const width = 160;
    const height = 120;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const inside = x >= 30 && x < 130 && y >= 25 && y < 95;
        data.fill(inside ? 235 : 30, (y * width + x) * 4, (y * width + x) * 4 + 3);
        data[(y * width + x) * 4 + 3] = 255;
      }
    }
    const found = mainThreadDocumentFinder().find({ width, height, data });
    expect(found).not.toBeNull();
    const [tl, , br] = (found as Exclude<typeof found, Promise<unknown> | null>)!.corners;
    expect(tl.x).toBeCloseTo(30, -1);
    expect(br.y).toBeCloseTo(95, -1);
  });

  it("returns null without a document", () => {
    const frame = { width: 40, height: 30, data: new Uint8ClampedArray(40 * 30 * 4).fill(90) };
    expect(mainThreadDocumentFinder({ minArea: 0.2 }).find(frame)).toBeNull();
  });
});
