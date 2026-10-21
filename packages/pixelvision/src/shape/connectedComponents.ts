import { assertChannels, assertType } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import type { Component, ConnectedComponents } from "./connectedComponents.model";

/**
 * Labels connected regions of non-zero pixels and measures them, as
 * OpenCV's `connectedComponentsWithStats`, with the same label numbers
 * (row by row for 4-connectivity, by 2x2 block rows for 8-connectivity);
 * each region gets its bounding box, pixel count and centre of mass.
 *
 * @param binary - Single-channel `u8` matrix; non-zero is foreground.
 * @param connectivity - 8 (default, diagonals connect) or 4.
 * @returns The label image and the regions.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When it has more than one channel or connectivity isn't 4 or 8.
 *
 * @example
 * const { components } = connectedComponents(threshold(gray));
 * const big = components.filter((c) => c.area > 500);
 */
export function connectedComponents(
  binary: Matrix<"u8">,
  connectivity: 4 | 8 = 8,
): ConnectedComponents {
  assertType("connectedComponents", binary, "u8");
  assertChannels("connectedComponents", binary, 1);
  if (connectivity !== 4 && connectivity !== 8) {
    throw new RangeError(`connectedComponents: connectivity must be 4 or 8, got ${connectivity}`);
  }
  const { width: w, height: h, data } = binary;
  const labels = createMatrix(w, h, { type: "i32" });
  const offsets =
    connectivity === 8
      ? [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1]
      : [0, -1, -1, 0, 1, 0, 0, 1];
  const components: Component[] = [];
  const stack: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (data[start] === 0 || labels.data[start] !== 0) continue;
    const label = components.length + 1;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    let area = 0;
    let sumX = 0;
    let sumY = 0;
    labels.data[start] = label;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % w;
      const y = (p / w) | 0;
      area++;
      sumX += x;
      sumY += y;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (let k = 0; k < offsets.length; k += 2) {
        const nx = x + offsets[k];
        const ny = y + offsets[k + 1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (data[n] !== 0 && labels.data[n] === 0) {
          labels.data[n] = label;
          stack.push(n);
        }
      }
    }
    components.push({
      label,
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      area,
      centroid: { x: sumX / area, y: sumY / area },
    });
  }
  if (connectivity === 4) return { labels, components };
  // OpenCV labels 8-connected regions in 2x2 blocks (Spaghetti/BBDT), so
  // regions are numbered by the first block they touch, scanning block rows.
  const firstBlock = new Float64Array(components.length + 1).fill(Infinity);
  const blockColumns = Math.ceil(w / 2);
  for (let p = 0; p < w * h; p++) {
    const label = labels.data[p];
    if (label === 0) continue;
    const block = Math.floor(p / w / 2) * blockColumns + Math.floor((p % w) / 2);
    if (block < firstBlock[label]) firstBlock[label] = block;
  }
  const order = components.map((c) => c.label).sort((a, b) => firstBlock[a] - firstBlock[b]);
  const relabel = new Int32Array(components.length + 1);
  order.forEach((old, k) => (relabel[old] = k + 1));
  for (let p = 0; p < w * h; p++) labels.data[p] = relabel[labels.data[p]];
  const renumbered = order.map((old, k) => ({ ...components[old - 1], label: k + 1 }));
  return { labels, components: renumbered };
}
