import type { Posterized } from "./posterize.model";

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
 * Gives every pixel the most common label of its 3x3 neighbourhood (its own
 * on a tie). Removes the one-pixel fringes of in-between colours that
 * anti-aliased edges leave, and isolated noisy pixels.
 *
 * @param labels - One label per pixel, row by row.
 * @param width - Width in pixels.
 * @param height - Height in pixels.
 * @param count - Number of labels in use.
 * @returns The filtered labels.
 */
export function majorityFilter(
  labels: Uint8Array,
  width: number,
  height: number,
  count: number,
): Uint8Array {
  const out = new Uint8Array(labels.length);
  const votes = new Uint16Array(count);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      votes.fill(0);
      for (let ny = Math.max(0, y - 1); ny <= Math.min(height - 1, y + 1); ny++) {
        for (let nx = Math.max(0, x - 1); nx <= Math.min(width - 1, x + 1); nx++) {
          votes[labels[ny * width + nx]]++;
        }
      }
      let best = labels[y * width + x];
      for (let i = 0; i < count; i++) if (votes[i] > votes[best]) best = i;
      out[y * width + x] = best;
    }
  }
  return out;
}
