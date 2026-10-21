import { describe, expect, it } from "vitest";
import { posterize } from "./posterize";

/**
 * Builds RGB pixels from a list of colours and how often each appears.
 *
 * @param runs - `[r, g, b, count]` per colour.
 * @returns The pixels.
 */
const pixels = (runs: number[][]): Uint8Array =>
  Uint8Array.from(
    runs.flatMap(([r, g, b, count]) => Array.from({ length: count }, () => [r, g, b]).flat()),
  );

describe("posterize", () => {
  it("splits colours at the median of the channel they spread most along", () => {
    const rgb = pixels([
      [250, 250, 250, 50],
      [249, 249, 252, 50],
      [200, 20, 20, 30],
      [20, 30, 200, 20],
      [200, 120, 20, 10],
    ]);

    const { palette, labels } = posterize(rgb, 3);

    expect(palette).toHaveLength(3);
    // The orange shares the red's red channel; it joins the red, weighted by count.
    // The two near-whites fall in one 5-bit bin, so they share a colour: their average.
    expect(new Set(labels.slice(0, 100)).size).toBe(1);
    expect(palette[labels[0]]).toEqual([250, 250, 251]);
    expect(palette[labels[100]]).toEqual([200, 45, 20]);
    expect(palette[labels[150]]).toEqual([200, 45, 20]);
    expect(palette[labels[149]]).toEqual([20, 30, 200]);
  });

  it("gives fewer colours when the image has fewer", () => {
    const { palette, labels } = posterize(pixels([[9, 9, 9, 4]]), 4);

    expect(palette).toEqual([[9, 9, 9]]);
    expect([...labels]).toEqual([0, 0, 0, 0]);
  });

  it("cuts where the two halves differ least, keeping a large area whole", () => {
    const rgb = pixels([
      [20, 20, 20, 100],
      [128, 128, 128, 10],
      [250, 250, 250, 10],
    ]);

    const { palette, labels } = posterize(rgb, 2);

    expect(palette[labels[0]]).toEqual([20, 20, 20]);
    expect(palette[labels[100]]).toEqual([189, 189, 189]);
    expect(labels[119]).toBe(labels[100]);
  });
});
