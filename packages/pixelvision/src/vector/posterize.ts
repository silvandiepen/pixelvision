import type { Posterized } from "./posterize.model";

// Blends closer than this to half and half are an even split.
const EVEN = 1 / 32;

/**
 * Reduces RGB pixels to at most `count` colours, a variant of median cut:
 * the colours (at 5 bits per channel) are split box by box, always the box
 * and channel with the largest squared error, at the cut that leaves the
 * least error in the two halves. Each pixel then takes the nearest box
 * average. Weighing errors by pixel count spends the colours on large
 * areas, not on stray pixels or noise, and keeps a flat background whole;
 * a box whose colours vary by less than about 8 levels isn't split at all.
 *
 * @param rgb - Pixels as `r, g, b` triples.
 * @param count - Largest number of colours, 1–256.
 * @returns The palette and each pixel's colour; fewer colours when the image has fewer distinct ones.
 */
export function posterize(rgb: Uint8Array, count: number): Posterized {
  const pixels = rgb.length / 3;
  const weight = new Float64Array(32768);
  const sums = new Float64Array(32768 * 3);
  for (let p = 0; p < pixels; p++) {
    const key = ((rgb[p * 3] >> 3) << 10) | ((rgb[p * 3 + 1] >> 3) << 5) | (rgb[p * 3 + 2] >> 3);
    weight[key]++;
    for (let c = 0; c < 3; c++) sums[key * 3 + c] += rgb[p * 3 + c];
  }
  const channel = (key: number, c: number) => (key >> (10 - 5 * c)) & 31;
  const used: number[] = [];
  for (let key = 0; key < 32768; key++) if (weight[key] > 0) used.push(key);
  const boxes = [used];
  while (boxes.length < count) {
    // The box and channel with the largest squared error: many pixels spread
    // far apart. A box of a single colour has none, so it's never split.
    let best = -1;
    let largest = 0;
    let along = 0;
    boxes.forEach((box, b) => {
      for (let c = 0; c < 3; c++) {
        let count = 0;
        let sum = 0;
        let squares = 0;
        for (const key of box) {
          count += weight[key];
          sum += weight[key] * channel(key, c);
          squares += weight[key] * channel(key, c) ** 2;
        }
        // Spread under one 5-bit step (8 levels) is noise, not another colour.
        const error = squares - (sum * sum) / count;
        if (error > largest && error > count) [best, largest, along] = [b, error, c];
      }
    });
    if (best < 0) break;
    // Cut between two channel values where the halves' squared errors add up
    // least, so a large flat area stays whole instead of being halved.
    const box = boxes[best].sort((a, b) => channel(a, along) - channel(b, along));
    const values = box.map((key) => channel(key, along));
    const total = [0, 0, 0];
    for (const [i, key] of box.entries()) {
      total[0] += weight[key];
      total[1] += weight[key] * values[i];
      total[2] += weight[key] * values[i] ** 2;
    }
    const left = [0, 0, 0];
    let cut = 0;
    let lowest = Infinity;
    for (let i = 1; i < box.length; i++) {
      left[0] += weight[box[i - 1]];
      left[1] += weight[box[i - 1]] * values[i - 1];
      left[2] += weight[box[i - 1]] * values[i - 1] ** 2;
      if (values[i] === values[i - 1]) continue;
      const right = total.map((t, k) => t - left[k]);
      const error = left[2] - left[1] ** 2 / left[0] + right[2] - right[1] ** 2 / right[0];
      if (error < lowest) [cut, lowest] = [i, error];
    }
    boxes.splice(best, 1, box.slice(0, cut), box.slice(cut));
  }
  const palette = boxes.map((box) => {
    const total = box.reduce((sum, key) => sum + weight[key], 0);
    return [0, 1, 2].map((c) =>
      Math.round(box.reduce((sum, key) => sum + sums[key * 3 + c], 0) / total),
    ) as [number, number, number];
  });
  const labels = new Uint8Array(pixels);
  for (let p = 0; p < pixels; p++) {
    let nearest = Infinity;
    palette.forEach((colour, i) => {
      const d =
        (rgb[p * 3] - colour[0]) ** 2 +
        (rgb[p * 3 + 1] - colour[1]) ** 2 +
        (rgb[p * 3 + 2] - colour[2]) ** 2;
      if (d < nearest) {
        nearest = d;
        labels[p] = i;
      }
    });
  }
  return { palette, labels };
}

/**
 * Relabels the anti-aliased pixels along colour edges. Such a pixel is a
 * blend of the two colours either side of the edge, and the palette colour
 * nearest to it can be a third one: half navy on white paper is closer to
 * teal than to either. Each pixel next to a different label is matched
 * against every blend of two colours found in its 3x3 neighbourhood; when
 * one blend explains it far better than its nearest colour does (the
 * residual is under half the distance), it takes whichever of the two
 * colours covers more of it, and on an even split the more common one.
 * That splits every edge at half coverage, as a threshold does in black and
 * white, and keeps corners where they are.
 *
 * @param rgb - Pixels as `r, g, b` triples.
 * @param labels - Each pixel's nearest palette colour.
 * @param palette - The colours.
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @returns The labels, fringe pixels relabelled.
 */
export function unmixEdges(
  rgb: Uint8Array,
  labels: Uint8Array,
  palette: readonly (readonly [number, number, number])[],
  width: number,
  height: number,
): Uint8Array {
  const out = labels.slice();
  const counts = palette.map(() => 0);
  for (const label of labels) counts[label]++;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const near = new Set<number>();
      for (let ny = Math.max(0, y - 1); ny <= Math.min(height - 1, y + 1); ny++) {
        for (let nx = Math.max(0, x - 1); nx <= Math.min(width - 1, x + 1); nx++) {
          near.add(labels[ny * width + nx]);
        }
      }
      if (near.size < 3) continue;
      const own = palette[labels[p]];
      const colour = [rgb[p * 3], rgb[p * 3 + 1], rgb[p * 3 + 2]];
      let best =
        ((colour[0] - own[0]) ** 2 + (colour[1] - own[1]) ** 2 + (colour[2] - own[2]) ** 2) / 4;
      const candidates = [...near].filter((label) => label !== labels[p]);
      for (const [k, i] of candidates.entries()) {
        for (const j of candidates.slice(k + 1)) {
          const a = palette[i];
          const b = palette[j];
          const ab = [0, 1, 2].map((c) => b[c] - a[c]);
          const ap = [0, 1, 2].map((c) => colour[c] - a[c]);
          const t = Math.min(
            1,
            Math.max(
              0,
              (ab[0] * ap[0] + ab[1] * ap[1] + ab[2] * ap[2]) /
                (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2),
            ),
          );
          const residual =
            (ap[0] - t * ab[0]) ** 2 + (ap[1] - t * ab[1]) ** 2 + (ap[2] - t * ab[2]) ** 2;
          // Two equal palette colours give no blend (NaN), which never wins.
          if (residual < best) {
            best = residual;
            // An even split (within the noise of a few levels) goes to the more common
            // colour, the layer below, so a row of half-covered pixels stays on one side.
            const even = Math.abs(t - 0.5) < EVEN;
            out[p] = even ? (counts[i] >= counts[j] ? i : j) : t < 0.5 ? i : j;
          }
        }
      }
    }
  }
  return out;
}
