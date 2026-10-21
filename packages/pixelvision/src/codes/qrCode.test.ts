import { describe, expect, it } from "vitest";
import { createMatrix } from "../core/matrix";
import { perspectiveTransform, transformPoint } from "../math/transforms";
import type { Point } from "../math/transforms.model";
import { addGaussianNoise, drawQuad, squareCorners } from "../test-images";
import { encodeQr, renderQr } from "../test-qr";
import { readQrCode } from "./qrCode";

/**
 * Asserts that found corners are the drawn ones, within a tolerance.
 *
 * @param found - Corners from readQrCode.
 * @param drawn - The symbol's drawn corners.
 * @param tolerance - Pixels.
 */
const expectCorners = (found: readonly Point[], drawn: readonly Point[], tolerance = 2) => {
  found.forEach((corner, k) => {
    expect(
      Math.hypot(corner.x - drawn[k].x, corner.y - drawn[k].y),
      `corner ${k}`,
    ).toBeLessThanOrEqual(tolerance);
  });
};

describe("readQrCode", () => {
  it("reads a code at any rotation, top-left corner first", () => {
    const symbol = encodeQr("https://pixelvision.dev", { version: 3, level: "M" });
    for (const angle of [0, 90, 180, 270, 45, 200]) {
      const { image, symbol: drawn } = renderQr(symbol, {
        corners: squareCorners(160, 120, 200, angle),
      });
      const code = readQrCode(image);

      expect(code, `${angle}°`).toMatchObject({
        text: "https://pixelvision.dev",
        version: 3,
        errorCorrectionLevel: "M",
      });
      expect(Array.from(code!.bytes)).toEqual(Array.from(new TextEncoder().encode(code!.text)));
      expectCorners(code!.corners, drawn);
    }
  });

  it("reads codes in perspective, with noise, version 1 to 10", () => {
    for (let version = 1; version <= 10; version++) {
      const text = version === 1 ? "v1" : `version ${version}`;
      const symbol = encodeQr(text, { version, level: "Q", mask: version % 8 });
      const { image, symbol: drawn } = renderQr(symbol, {
        width: 400,
        height: 400,
        corners: squareCorners(200, 200, 300, version * 37, 0.2),
      });
      addGaussianNoise(image, 6, version);

      const code = readQrCode(image);
      expect(code?.text, `version ${version}`).toBe(text);
      expect(code?.version).toBe(version);
      expectCorners(code!.corners, drawn, 2.5);
    }
  });

  it("reads an unevenly lit code with the local threshold", () => {
    const symbol = encodeQr("in the shade", { version: 2, level: "H" });
    const { image } = renderQr(symbol, {
      corners: squareCorners(160, 120, 200, 10),
      background: 200,
    });
    // Darken the right half of the image steeply: one global level can't split it.
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const i = y * image.width + x;
        image.data[i] = Math.round(image.data[i] * (x < 160 ? 1 : 0.35));
      }
    }
    expect(readQrCode(image)?.text).toBe("in the shade");
  });

  it("reads a code without its alignment pattern", () => {
    const symbol = encodeQr("no alignment", { version: 3, level: "H", mask: 2 });
    // Paint the alignment pattern (modules 20-24) light: no data is lost.
    for (let y = 20; y < 25; y++)
      symbol.modules.fill(0, y * symbol.size + 20, y * symbol.size + 25);
    const { image, symbol: drawn } = renderQr(symbol, {
      corners: squareCorners(160, 120, 210, 20, 0.15),
    });
    const code = readQrCode(image);
    expect(code?.text).toBe("no alignment");
    expectCorners(code!.corners, drawn, 2.5);
  });

  it("reads codes whose finder rings can't be traced", () => {
    /**
     * Draws a 1-module bar from a finder's outer ring out past the quiet
     * zone, joining the ring to the dark surroundings.
     */
    const withBars = (version: number, text: string, bars: number[]) => {
      const symbol = encodeQr(text, { version, level: "H", mask: 1 });
      const { image, symbol: drawn } = renderQr(symbol, {
        corners: squareCorners(160, 120, 210, 0),
      });
      const size = symbol.size;
      const toImage = perspectiveTransform(
        [
          { x: 0, y: 0 },
          { x: size, y: 0 },
          { x: size, y: size },
          { x: 0, y: size },
        ],
        drawn,
      );
      const rect = (x0: number, y0: number, x1: number, y1: number) =>
        [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ].map(([x, y]) => transformPoint(toImage, { x, y }));
      const all = [
        rect(1, -6, 2, 0.3),
        rect(size - 2, -6, size - 1, 0.3),
        rect(-6, size - 2, 0.3, size - 1),
      ];
      for (const k of bars) drawQuad(image, all[k], () => 25);
      return { image, drawn };
    };
    // One ring lost: the other two and the alignment pattern fix the perspective.
    const one = withBars(3, "one ring lost", [0]);
    expect(readQrCode(one.image)?.text).toBe("one ring lost");
    // Version 1 with every ring lost: the finder centres alone.
    const all = withBars(1, "rings", [0, 1, 2]);
    const code = readQrCode(all.image);
    expect(code?.text).toBe("rings");
    expectCorners(code!.corners, all.drawn, 2.5);
  });

  it("reads a code whose corner is cut off by the image edge", () => {
    const symbol = encodeQr("cut corner", { version: 2, level: "H", mask: 5 });
    const { image } = renderQr(symbol, {
      width: 300,
      height: 250,
      corners: squareCorners(150, 150, 220, 45),
    });
    expect(readQrCode(image)?.text).toBe("cut corner");
  });

  it("gives up on a code whose data is ruined", () => {
    const symbol = encodeQr("ruined", { version: 1, level: "L" });
    for (let y = 9; y < symbol.size; y++) {
      for (let x = 9; x < symbol.size; x++) symbol.modules[y * symbol.size + x] ^= 1;
    }
    const { image } = renderQr(symbol, { corners: squareCorners(160, 120, 200, 0) });
    expect(readQrCode(image)).toBeNull();
  });

  it("decodes a damaged code by error correction, and gives up on a ruined one", () => {
    const symbol = encodeQr("damaged", { version: 2, level: "H" });
    const { image, symbol: drawn } = renderQr(symbol, { corners: squareCorners(160, 120, 200, 0) });
    const stain = (size: number) => {
      const copy = createMatrix(image.width, image.height);
      copy.data.set(image.data);
      drawQuad(
        copy,
        squareCorners((drawn[0].x + drawn[2].x) / 2, (drawn[0].y + drawn[2].y) / 2 + 20, size, 0),
        () => 30,
      );
      return copy;
    };
    expect(readQrCode(stain(40))?.text).toBe("damaged");
    expect(readQrCode(stain(110))).toBeNull();
  });

  it("returns null when there is no code", () => {
    const flat = createMatrix(120, 100);
    flat.data.fill(200);
    expect(readQrCode(flat)).toBeNull();
    const noise = createMatrix(200, 200);
    noise.data.fill(128);
    addGaussianNoise(noise, 50, 3);
    expect(readQrCode(noise)).toBeNull();
  });

  it("rejects bad input", () => {
    expect(() => readQrCode(createMatrix(10, 10, { channels: 3 }))).toThrow(RangeError);
    expect(() => readQrCode(createMatrix(10, 10, { type: "f32" }) as never)).toThrow(TypeError);
  });
});
