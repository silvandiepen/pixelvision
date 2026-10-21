import { describe, expect, it } from "vitest";
import { posterize, unmixEdges } from "./posterize";

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

describe("unmixEdges", () => {
  const navy = [31, 42, 83] as const;
  const teal = [21, 146, 137] as const;
  const paper = [246, 244, 239] as const;
  const palette = [navy, teal, paper];

  /**
   * A 3-row image of columns: navy, a blend of navy on paper, or paper.
   *
   * @param columns - Per column: 1 for navy, 0 for paper, in between for a blend.
   * @param noise - Added to the blended columns' channels.
   * @returns The pixels and their nearest colours.
   */
  const image = (columns: number[], noise = 0) => {
    const w = columns.length;
    const rgb = new Uint8Array(w * 9);
    for (let p = 0; p < w * 3; p++) {
      const share = columns[p % w];
      const blended = share > 0 && share < 1;
      rgb.set(
        navy.map((v, c) => Math.round(v * share + paper[c] * (1 - share) + (blended ? noise : 0))),
        p * 3,
      );
    }
    const labels = Uint8Array.from({ length: w * 3 }, (_, p) => {
      const c = [...rgb.subarray(p * 3, p * 3 + 3)];
      const d = palette.map((q) => q.reduce((sum, v, i) => sum + (v - c[i]) ** 2, 0));
      return d.indexOf(Math.min(...d));
    });
    return { rgb, labels, w };
  };
  const unmix = (columns: number[], noise = 0) => {
    const { rgb, labels, w } = image(columns, noise);
    return [...unmixEdges(rgb, labels, palette, w, 3)].slice(0, w);
  };

  it("gives a blend of two colours to the one covering more of it, not a third", () => {
    // Half navy on paper is nearer teal than either.
    expect(image([1, 0.5, 0]).labels[1]).toBe(1);
    expect(unmix([1, 0.6, 0])).toEqual([0, 0, 2]);
    expect(unmix([1, 0.4, 0])).toEqual([0, 2, 2]);
  });

  it("gives an even split to the more common colour, whatever the noise", () => {
    for (const noise of [-2, 2]) {
      expect(unmix([1, 0.5, 0, 0], noise), String(noise)).toEqual([0, 2, 2, 2]);
      expect(unmix([1, 1, 0.5, 0], noise), String(noise)).toEqual([0, 0, 0, 2]);
    }
  });

  it("leaves pixels alone that no blend explains better", () => {
    // A real teal pixel between navy and paper.
    const { rgb, labels } = image([1, 0.6, 0]);
    rgb.set(teal, 4 * 3);
    labels[4] = 1;
    expect(unmixEdges(rgb, labels, palette, 3, 3)[4]).toBe(1);
  });
});
