import type { Detection } from "./haar.model";

/**
 * Whether two detections are close enough to be the same object: within a
 * quarter of the first one's width in position and 1.5x in size.
 *
 * @param r1 - First detection.
 * @param r2 - Second detection.
 * @returns `true` when they should be merged.
 */
const similar = (r1: Detection, r2: Detection): boolean => {
  const distance = (r1.width * 0.25 + 0.5) | 0;
  return (
    r2.x <= r1.x + distance &&
    r2.x >= r1.x - distance &&
    r2.y <= r1.y + distance &&
    r2.y >= r1.y - distance &&
    r2.width <= ((r1.width * 1.5 + 0.5) | 0) &&
    ((r2.width * 1.5 + 0.5) | 0) >= r1.width
  );
};

/**
 * Merges overlapping raw detections (OpenCV's grouping): similar rectangles
 * are joined, groups with fewer than `minNeighbors` members dropped, each
 * group averaged (rounded as OpenCV does), and small results inside larger,
 * better-supported ones removed.
 *
 * @param rects - Raw detections, e.g. from one detector pass.
 * @param minNeighbors - Minimum group size (default 1).
 * @returns The merged detections.
 *
 * @example
 * const faces = groupRectangles(rawDetections, 3);
 */
export function groupRectangles(rects: readonly Detection[], minNeighbors = 1): Detection[] {
  const n = rects.length;
  const parent = new Int32Array(n).fill(-1);
  const rank = new Int32Array(n);
  const rootOf = (i: number) => {
    while (parent[i] !== -1) i = parent[i];
    return i;
  };
  const compress = (from: number, root: number) => {
    while (parent[from] !== -1) {
      const next = parent[from];
      parent[from] = root;
      from = next;
    }
  };
  for (let i = 0; i < n; i++) {
    let root = rootOf(i);
    // Groups are the connected components of "either one is similar to the
    // other", so each pair is visited once, in both directions.
    for (let j = i + 1; j < n; j++) {
      if (!similar(rects[i], rects[j]) && !similar(rects[j], rects[i])) continue;
      const root2 = rootOf(j);
      if (root2 === root) continue;
      if (rank[root] > rank[root2]) {
        parent[root2] = root;
      } else {
        parent[root] = root2;
        if (rank[root] === rank[root2]) rank[root2]++;
        root = root2;
      }
      compress(j, root);
      compress(i, root);
    }
  }

  const classOf = new Int32Array(n);
  const classIndex = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const root = rootOf(i);
    if (!classIndex.has(root)) classIndex.set(root, classIndex.size);
    classOf[i] = classIndex.get(root)!;
  }
  const groups = Array.from({ length: classIndex.size }, () => ({
    neighbors: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    confidence: 0,
  }));
  rects.forEach((r, i) => {
    const g = groups[classOf[i]];
    if (g.neighbors === 0) g.confidence = r.confidence;
    g.neighbors++;
    g.x += r.x;
    g.y += r.y;
    g.width += r.width;
    g.height += r.height;
    g.confidence = Math.max(g.confidence, r.confidence);
  });
  // Average each group, rounding to the nearest pixel as OpenCV does (jsfeat
  // skipped the division's rounding and shifted results by up to half a pixel).
  const average = (sum: number, count: number) => Math.floor((sum * 2 + count) / (2 * count));
  const merged: Detection[] = groups
    .filter((g) => g.neighbors >= minNeighbors)
    .map((g) => ({
      x: average(g.x, g.neighbors),
      y: average(g.y, g.neighbors),
      width: average(g.width, g.neighbors),
      height: average(g.height, g.neighbors),
      neighbors: g.neighbors,
      confidence: g.confidence,
    }));

  // Drop small results inside larger, better-supported ones.
  return merged.filter((r1, i) =>
    merged.every((r2, j) => {
      const distance = (r2.width * 0.25 + 0.5) | 0;
      const inside =
        r1.x >= r2.x - distance &&
        r1.y >= r2.y - distance &&
        r1.x + r1.width <= r2.x + r2.width + distance &&
        r1.y + r1.height <= r2.y + r2.height + distance;
      return i === j || !(inside && (r2.neighbors > Math.max(3, r1.neighbors) || r1.neighbors < 3));
    }),
  );
}
