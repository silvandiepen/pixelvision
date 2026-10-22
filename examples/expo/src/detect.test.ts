import { describe, expect, it } from "@jest/globals";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { countEdges, detect, formatCorners } from "./detect";
import { decodeJpeg, fitSize, MAX_SIZE } from "./pixels";

/** Where the sample's document is: the corners its generator drew. */
const SAMPLE_CORNERS = [
  { x: 150, y: 90 },
  { x: 500, y: 120 },
  { x: 470, y: 400 },
  { x: 120, y: 360 },
];

describe("the sample scan", () => {
  // The bundled JPEG, decoded with the same pure-JavaScript decoder the app uses.
  const image = decodeJpeg(readFileSync(join(__dirname, "../assets/sample.jpg")));

  it("decodes to RGBA pixels", () => {
    expect([image.width, image.height]).toEqual([640, 480]);
    expect(image.data).toHaveLength(640 * 480 * 4);
  });

  it("finds the document's corners within 4 px", () => {
    const { corners } = detect(image);
    expect(corners).not.toBeNull();
    corners!.forEach((corner, i) => {
      const expected = SAMPLE_CORNERS[i];
      expect(Math.hypot(corner.x - expected.x, corner.y - expected.y)).toBeLessThanOrEqual(4);
    });
    expect(formatCorners(corners!).split(" ")).toHaveLength(4);
  });

  it("finds edges at the photo's size", () => {
    const { edges } = detect(image);
    expect([edges.width, edges.height]).toEqual([640, 480]);
    expect(countEdges(edges)).toBeGreaterThan(0);
  });
});

describe("fitSize", () => {
  it("keeps images that fit", () => {
    expect(fitSize(640, 480)).toEqual({ width: 640, height: 480 });
  });

  it("scales the longer side down to the maximum", () => {
    expect(fitSize(4032, 3024)).toEqual({ width: MAX_SIZE, height: 960 });
    expect(fitSize(3024, 4032)).toEqual({ width: 960, height: MAX_SIZE });
  });
});
