import type { Matrix } from "../core/matrix.model";
import type { Point } from "../math/transforms.model";
import { contourArea } from "../shape/polygon";
import type { TracedLoop, TracedShape } from "./trace.model";

// Directions east, south, west, north: each is a right turn from the one before.
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
// From a pixel corner, the pixel to the right and to the left of the next edge in each direction.
const RIGHT_X = [0, -1, -1, 0];
const RIGHT_Y = [0, 0, -1, -1];
const LEFT_X = [0, 0, -1, -1];
const LEFT_Y = [-1, 0, 0, -1];

/**
 * Traces every boundary between shape and background along the pixel
 * edges, as closed loops through pixel corners. Shape pixels are
 * 8-connected (diagonal neighbours touch) and background 4-connected, so
 * each region has exactly one outer loop and one loop per hole.
 *
 * @param mask - Single-channel `u8` matrix; non-zero pixels are shape.
 * @param labels - The mask's 8-connected region labels, from {@link connectedComponents}.
 * @returns The loops in the order their topmost-leftmost horizontal edge appears.
 */
export function traceLoops(mask: Matrix<"u8">, labels: Int32Array): TracedLoop[] {
  const { width: w, height: h, data } = mask;
  const shape = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && data[y * w + x] !== 0;
  // Every loop has a top edge running east (shape below, background above);
  // these are marked as they're traced, so each loop is found once.
  const visited = new Uint8Array(w * h);
  const loops: TracedLoop[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (visited[y * w + x] || !shape(x, y) || shape(x, y - 1)) continue;
      const vertices: Point[] = [{ x, y }];
      let cx = x + 1;
      let cy = y;
      let direction = 0;
      visited[y * w + x] = 1;
      for (;;) {
        // Turn left when the pixel ahead-left is shape (which joins diagonal
        // neighbours), go straight along shape, otherwise turn right.
        let next = (direction + 1) % 4;
        if (shape(cx + LEFT_X[direction], cy + LEFT_Y[direction])) next = (direction + 3) % 4;
        else if (shape(cx + RIGHT_X[direction], cy + RIGHT_Y[direction])) next = direction;
        if (cx === x && cy === y && next === 0) break;
        if (next !== direction) vertices.push({ x: cx, y: cy });
        direction = next;
        if (direction === 0) visited[cy * w + cx] = 1;
        cx += DX[direction];
        cy += DY[direction];
      }
      loops.push({ vertices, area: contourArea(vertices), label: labels[y * w + x] });
    }
  }
  return loops;
}

/**
 * Groups loops into shapes: each region's outer loop with the holes inside
 * it. Loops enclosing fewer than `minArea` pixels are dropped; a dropped
 * outline takes its holes with it, and a dropped hole is filled.
 *
 * @param loops - Loops from {@link traceLoops}.
 * @param minArea - Smallest enclosed area kept, in pixels.
 * @returns The shapes, in the order of their outlines.
 */
export function groupShapes(loops: readonly TracedLoop[], minArea: number): TracedShape[] {
  const byLabel = new Map<number, TracedShape>();
  for (const loop of loops) {
    if (loop.area >= minArea) byLabel.set(loop.label, { outline: loop, holes: [] });
  }
  for (const loop of loops) {
    if (loop.area <= -minArea) byLabel.get(loop.label)?.holes.push(loop);
  }
  return [...byLabel.values()];
}

/**
 * The midpoint of every unit pixel edge along a loop. Each lies halfway
 * between a shape pixel's centre and a background pixel's centre, so on a
 * rasterised curve it's within half a pixel of the true boundary.
 *
 * @param vertices - The loop's corners, from {@link traceLoops}.
 * @returns The midpoints, in order.
 */
export function edgeMidpoints(vertices: readonly Point[]): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const steps = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    const sx = Math.sign(b.x - a.x);
    const sy = Math.sign(b.y - a.y);
    for (let s = 0; s < steps; s++)
      points.push({ x: a.x + sx * (s + 0.5), y: a.y + sy * (s + 0.5) });
  }
  return points;
}
