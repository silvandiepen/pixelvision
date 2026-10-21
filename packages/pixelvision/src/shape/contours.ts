import { assertChannels, assertType } from "../core/assert";
import type { Matrix } from "../core/matrix.model";
import type { Contour, FindContoursOptions } from "./contours.model";

// The 8 neighbours, clockwise in image coordinates (y down), starting west.
const DX = [-1, -1, 0, 1, 1, 1, 0, -1];
const DY = [0, -1, -1, -1, 0, 1, 1, 1];

/**
 * Finds the outer outline of every connected region of non-zero pixels
 * (8-connected), like OpenCV's `findContours` with `RETR_EXTERNAL`. Holes
 * are ignored. Each outline is traced clockwise with Moore-neighbour
 * tracing and starts at the region's top-left pixel.
 *
 * @param binary - Single-channel `u8` matrix; non-zero is foreground (e.g. from {@link threshold} or {@link canny}).
 * @param options - Minimum region size.
 * @returns One contour per region, in the order their top-left pixels appear.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel.
 *
 * @example
 * const outlines = findContours(threshold(gray));
 */
export function findContours(binary: Matrix<"u8">, options: FindContoursOptions = {}): Contour[] {
  assertType("findContours", binary, "u8");
  assertChannels("findContours", binary, 1);
  const minPixels = options.minPixels ?? 1;
  const { width: w, height: h, data } = binary;
  const labels = new Int32Array(w * h);
  const stack: number[] = [];
  const contours: Contour[] = [];
  const foreground = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && data[y * w + x] !== 0;

  let label = 0;
  for (let start = 0; start < w * h; start++) {
    if (data[start] === 0 || labels[start] !== 0) continue;
    // Label the region (8-connected flood fill) and count its pixels.
    label++;
    let pixels = 0;
    labels[start] = label;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      pixels++;
      const px = p % w;
      const py = (p / w) | 0;
      for (let d = 0; d < 8; d++) {
        const nx = px + DX[d];
        const ny = py + DY[d];
        if (!foreground(nx, ny)) continue;
        const n = ny * w + nx;
        if (labels[n] === 0) {
          labels[n] = label;
          stack.push(n);
        }
      }
    }
    if (pixels < minPixels) continue;
    contours.push(traceBoundary(foreground, start % w, (start / w) | 0));
  }
  return contours;
}

/**
 * Which direction the trace takes next from a pixel: the first foreground
 * neighbour clockwise after the background neighbour `back`.
 *
 * @param foreground - Whether a pixel is set.
 * @param x - Column.
 * @param y - Row.
 * @param back - Direction of the background pixel we came from.
 * @returns The direction, or -1 for an isolated pixel.
 */
const nextDirection = (
  foreground: (x: number, y: number) => boolean,
  x: number,
  y: number,
  back: number,
): number => {
  for (let k = 1; k <= 8; k++) {
    const d = (back + k) % 8;
    if (foreground(x + DX[d], y + DY[d])) return d;
  }
  return -1;
};

// Direction index for an offset, looked up at (dy + 1) * 3 + (dx + 1); the centre is unused.
const DIRECTION_OF = [1, 2, 3, 0, -1, 4, 7, 6, 5];

/**
 * Traces the outer boundary of the region containing `(sx, sy)`, which
 * must be its first pixel in raster order (so its west neighbour is
 * background). Moore-neighbour tracing, stopping when the trace returns
 * to the start and would repeat its first step (Jacob's criterion).
 *
 * @param foreground - Whether a pixel is set.
 * @param sx - Start column.
 * @param sy - Start row.
 * @returns The boundary points, clockwise.
 */
const traceBoundary = (
  foreground: (x: number, y: number) => boolean,
  sx: number,
  sy: number,
): Contour => {
  const contour: Contour = [{ x: sx, y: sy }];
  const first = nextDirection(foreground, sx, sy, 0);
  if (first === -1) return contour;
  let x = sx;
  let y = sy;
  let direction = first;
  for (;;) {
    // The neighbour checked just before `direction` is background; it becomes
    // the backtrack pixel, seen from the pixel we move to.
    const prev = (direction + 7) % 8;
    const bx = x + DX[prev];
    const by = y + DY[prev];
    x += DX[direction];
    y += DY[direction];
    const back = DIRECTION_OF[(by - y + 1) * 3 + (bx - x + 1)];
    direction = nextDirection(foreground, x, y, back);
    if (x === sx && y === sy && direction === first) return contour;
    contour.push({ x, y });
  }
};
