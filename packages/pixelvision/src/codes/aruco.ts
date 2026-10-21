import { assertChannels, assertInteger, assertType } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix } from "../core/matrix.model";
import { adaptiveThreshold } from "../imgproc/adaptiveThreshold";
import { otsuLevel } from "../imgproc/threshold";
import { perspectiveTransform, transformPoint } from "../math/transforms";
import type { Point } from "../math/transforms.model";
import { findContours } from "../shape/contours";
import { approxPolygon, isConvex } from "../shape/polygon";
import type {
  ArucoDictionary,
  ArucoDictionaryName,
  ArucoMarker,
  DetectArucoMarkersOptions,
  GenerateArucoMarkerOptions,
} from "./aruco.model";
import { ARUCO_DICTIONARIES } from "./arucoDictionaries";

// OpenCV's default detector parameters (ArucoDetector, DetectorParameters).
const THRESHOLD_WINDOWS = [3, 13, 23];
const THRESHOLD_CONSTANT = 7;
const MIN_PERIMETER_RATE = 0.03;
const MAX_PERIMETER_RATE = 4;
const APPROX_ACCURACY_RATE = 0.03;
const MIN_CORNER_DISTANCE_RATE = 0.05;
const MIN_DISTANCE_TO_BORDER = 3;
const MIN_MARKER_DISTANCE_RATE = 0.125;
const MIN_GROUP_DISTANCE = 0.21;
const PIXELS_PER_CELL = 4;
const MAX_BORDER_ERROR_RATE = 0.35;
const MIN_OTSU_DEVIATION = 5;
const ERROR_CORRECTION_RATE = 0.6;

const unpacked = new Map<ArucoDictionaryName, ArucoDictionary>();

/**
 * Packs a square grid of bits row by row, most significant bit first; the
 * last byte keeps the remaining bits in its low end (OpenCV's layout).
 *
 * @param bit - Returns the bit at a row and column.
 * @param n - Grid size.
 * @param out - Where to write the bytes.
 * @param offset - Index of the first byte in `out`.
 */
const packBits = (
  bit: (row: number, column: number) => number,
  n: number,
  out: Uint8Array,
  offset: number,
): void => {
  let byte = 0;
  let count = 0;
  let index = offset;
  for (let row = 0; row < n; row++) {
    for (let column = 0; column < n; column++) {
      byte = (byte << 1) | bit(row, column);
      if (++count === 8) {
        out[index++] = byte;
        byte = 0;
        count = 0;
      }
    }
  }
  if (count) out[index] = byte;
};

/**
 * Reads bit `i` (row-major) of a marker's packed bytes.
 *
 * @param bytes - The bytes.
 * @param offset - Index of the marker's first byte.
 * @param n - Grid size.
 * @param i - Bit index, `row * n + column`.
 * @returns 0 or 1.
 */
const unpackBit = (bytes: Uint8Array, offset: number, n: number, i: number): number => {
  const total = n * n;
  const byte = i >> 3;
  // The last, partial byte is right-aligned.
  const bitsInByte = byte === total >> 3 ? total & 7 : 8;
  return (bytes[offset + byte] >> (bitsInByte - 1 - (i & 7))) & 1;
};

/**
 * Unpacks a dictionary once and keeps it: every marker's bytes at all four
 * rotations.
 *
 * @param name - Dictionary name.
 * @param caller - Calling function, for the error message.
 * @returns The dictionary.
 * @throws {RangeError} When there's no dictionary of that name.
 */
export const getArucoDictionary = (name: ArucoDictionaryName, caller: string): ArucoDictionary => {
  const cached = unpacked.get(name);
  if (cached) return cached;
  const data = ARUCO_DICTIONARIES[name] as
    (typeof ARUCO_DICTIONARIES)[ArucoDictionaryName] | undefined;
  if (!data) {
    throw new RangeError(
      `${caller}: unknown dictionary "${name}"; use ${Object.keys(ARUCO_DICTIONARIES).join(" or ")}`,
    );
  }
  const n = data.markerSize;
  const byteCount = (n * n + 7) >> 3;
  const count = data.hex.length / 2 / byteCount;
  const plain = new Uint8Array(count * byteCount);
  for (let i = 0; i < plain.length; i++) plain[i] = parseInt(data.hex.slice(i * 2, i * 2 + 2), 16);
  const rotations = new Uint8Array(count * byteCount * 4);
  for (let m = 0; m < count; m++) {
    const at = (row: number, column: number) =>
      unpackBit(plain, m * byteCount, n, row * n + column);
    const base = m * byteCount * 4;
    // Quarter turns counter-clockwise, as OpenCV stores them.
    packBits(at, n, rotations, base);
    packBits((r, c) => at(c, n - 1 - r), n, rotations, base + byteCount);
    packBits((r, c) => at(n - 1 - r, n - 1 - c), n, rotations, base + 2 * byteCount);
    packBits((r, c) => at(n - 1 - c, r), n, rotations, base + 3 * byteCount);
  }
  const dictionary = {
    markerSize: n,
    maxCorrectionBits: data.maxCorrectionBits,
    byteCount,
    rotations,
    count,
  };
  unpacked.set(name, dictionary);
  return dictionary;
};

/** Number of set bits per byte value. */
const POPCOUNT = Uint8Array.from({ length: 256 }, (_, i) => {
  let bits = 0;
  for (let v = i; v; v >>= 1) bits += v & 1;
  return bits;
});

/**
 * Finds the marker whose bits, at one of its rotations, are closest to the
 * observed ones, accepting it within the dictionary's correction budget
 * (OpenCV's `Dictionary::identify`: the first marker within the budget wins).
 *
 * @param dictionary - The dictionary.
 * @param observed - Observed inner bits, packed.
 * @returns The id and the rotation it was seen at, or `undefined`.
 */
const identify = (
  dictionary: ArucoDictionary,
  observed: Uint8Array,
): { id: number; rotation: number } | undefined => {
  const { byteCount, rotations, count, markerSize, maxCorrectionBits } = dictionary;
  const allowed = Math.floor(maxCorrectionBits * ERROR_CORRECTION_RATE);
  for (let m = 0; m < count; m++) {
    let best = markerSize * markerSize + 1;
    let rotation = -1;
    for (let r = 0; r < 4; r++) {
      const base = (m * 4 + r) * byteCount;
      let distance = 0;
      for (let b = 0; b < byteCount; b++) distance += POPCOUNT[rotations[base + b] ^ observed[b]];
      if (distance < best) {
        best = distance;
        rotation = r;
      }
    }
    if (best <= allowed) return { id: m, rotation };
  }
  return undefined;
};

/**
 * Finds quadrilaterals that could be markers in one thresholded image
 * (OpenCV's `_findMarkerContours`): outlines of a plausible length that
 * simplify to four convex corners, with no side too short and no corner
 * near the image border. Corners come back clockwise on screen.
 *
 * @param binary - Thresholded image, markers' dark parts non-zero.
 * @returns The candidates' corners and outline lengths.
 */
const findCandidates = (binary: Matrix<"u8">): Point[][] => {
  const { width, height } = binary;
  const largest = Math.max(width, height);
  const minPerimeter = Math.floor(MIN_PERIMETER_RATE * largest);
  const maxPerimeter = Math.floor(MAX_PERIMETER_RATE * largest);
  const candidates: Point[][] = [];
  for (const contour of findContours(binary)) {
    const perimeter = contour.length;
    if (perimeter < minPerimeter || perimeter > maxPerimeter) continue;
    // OpenCV traces outlines the other way round from the same first pixel;
    // simplifying in its order keeps its vertex where two are equally far.
    const traced = [contour[0], ...contour.slice(1).reverse()];
    const corners = approxPolygon(traced, perimeter * APPROX_ACCURACY_RATE);
    if (corners.length !== 4 || !isConvex(corners)) continue;
    let shortest = Infinity;
    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      shortest = Math.min(shortest, (a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
    if (shortest < (perimeter * MIN_CORNER_DISTANCE_RATE) ** 2) continue;
    const border = MIN_DISTANCE_TO_BORDER;
    if (
      corners.some(
        (c) =>
          c.x < border || c.y < border || c.x > width - 1 - border || c.y > height - 1 - border,
      )
    ) {
      continue;
    }
    // Outlines run counter-clockwise on screen in this order; OpenCV turns
    // the corners clockwise (y down).
    [corners[1], corners[3]] = [corners[3], corners[1]];
    candidates.push(corners);
  }
  return candidates;
};

/**
 * Sum of a quad's side lengths.
 *
 * @param quad - Four corners.
 * @returns The perimeter.
 */
const quadPerimeter = (quad: readonly Point[]): number => {
  let sum = 0;
  for (let i = 0; i < 4; i++)
    sum += Math.hypot(quad[i].x - quad[(i + 1) % 4].x, quad[i].y - quad[(i + 1) % 4].y);
  return sum;
};

/**
 * Root-mean-square distance between two quads' corners, at the best of the
 * four ways to pair them up.
 *
 * @param a - First quad.
 * @param b - Second quad.
 * @returns The smallest root-mean-square corner distance.
 */
const quadDistance = (a: readonly Point[], b: readonly Point[]): number => {
  let best = Infinity;
  for (let shift = 0; shift < 4; shift++) {
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      const p = a[i];
      const q = b[(i + shift) % 4];
      sum += (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
    }
    best = Math.min(best, sum / 4);
  }
  return Math.sqrt(best);
};

/**
 * Groups candidate quads that are the same outline found more than once
 * (OpenCV's `filterTooCloseCandidates`) and lists what to read for each:
 * quads closer than an eighth of the smaller one's perimeter form a group,
 * read as its largest member; members more than 0.21 cells from the last
 * one listed follow, in case it isn't a marker.
 *
 * @param found - Candidate quads, clockwise.
 * @param cells - Cells per marker side, border included.
 * @returns Per group (or lone candidate), the quads to try in order.
 */
export const candidateTries = (found: readonly Point[][], cells: number): Point[][][] => {
  const candidates = found
    .map((corners) => ({ corners, perimeter: quadPerimeter(corners) }))
    .sort((a, b) => b.perimeter - a.perimeter);
  const groupOf = new Int32Array(candidates.length).fill(-1);
  const grouped: number[][] = [];
  const alone = candidates.map(() => true);
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const distance = quadDistance(candidates[i].corners, candidates[j].corners);
      if (distance >= candidates[j].perimeter * MIN_MARKER_DISTANCE_RATE) continue;
      alone[i] = false;
      alone[j] = false;
      // As OpenCV: a pair joins a group one of them is in; two groups are not merged.
      if (groupOf[i] < 0 && groupOf[j] < 0) {
        groupOf[i] = groupOf[j] = grouped.length;
        grouped.push([i, j]);
      } else if (groupOf[j] < 0) {
        groupOf[j] = groupOf[i];
        grouped[groupOf[i]].push(j);
      } else if (groupOf[i] < 0) {
        groupOf[i] = groupOf[j];
        grouped[groupOf[j]].push(i);
      }
    }
  }
  const tries: Point[][][] = candidates.flatMap((c, i) => (alone[i] ? [[c.corners]] : []));
  for (const members of grouped) {
    members.sort((a, b) => a - b);
    let kept = members[0];
    const options = [candidates[kept].corners];
    for (const id of members.slice(1)) {
      const moduleSize = candidates[id].perimeter / (4 * cells);
      if (
        quadDistance(candidates[id].corners, candidates[kept].corners) >
        MIN_GROUP_DISTANCE * moduleSize
      ) {
        kept = id;
        options.push(candidates[id].corners);
      }
    }
    tries.push(options);
  }
  return tries;
};

/**
 * Reads a candidate's cells (OpenCV's `_extractBits`): the quad is mapped
 * onto a square of 4 x 4 pixels per cell (nearest pixel), thresholded with
 * Otsu's level unless it is nearly uniform, and each cell is set when more
 * than half its pixels are bright.
 *
 * @param image - Gray image.
 * @param corners - The quad, clockwise.
 * @param cells - Cells per side, border included.
 * @returns One byte per cell, row by row: 1 for white.
 */
const readCells = (image: Matrix<"u8">, corners: readonly Point[], cells: number): Uint8Array => {
  const size = cells * PIXELS_PER_CELL;
  const last = size - 1;
  const transform = perspectiveTransform(
    [
      { x: 0, y: 0 },
      { x: last, y: 0 },
      { x: last, y: last },
      { x: 0, y: last },
    ],
    corners,
  );
  const warped = createMatrix(size, size);
  const { width, data } = image;
  for (let v = 0; v < size; v++) {
    for (let u = 0; u < size; u++) {
      const p = transformPoint(transform, { x: u, y: v });
      // Candidates keep 3 pixels from the image edge, so this stays inside.
      warped.data[v * size + u] = data[Math.round(p.y) * width + Math.round(p.x)];
    }
  }
  const bits = new Uint8Array(cells * cells);
  // Nearly uniform inside the outer half cell: everything is one colour.
  const half = PIXELS_PER_CELL / 2;
  let sum = 0;
  let squares = 0;
  let count = 0;
  for (let v = half; v < size - half; v++) {
    for (let u = half; u < size - half; u++) {
      const value = warped.data[v * size + u];
      sum += value;
      squares += value * value;
      count++;
    }
  }
  const mean = sum / count;
  if (Math.sqrt(Math.max(0, squares / count - mean * mean)) < MIN_OTSU_DEVIATION) {
    return bits.fill(mean > 127 ? 1 : 0);
  }
  const level = otsuLevel(warped);
  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      let bright = 0;
      for (let v = 0; v < PIXELS_PER_CELL; v++) {
        for (let u = 0; u < PIXELS_PER_CELL; u++) {
          const value = warped.data[(cy * PIXELS_PER_CELL + v) * size + cx * PIXELS_PER_CELL + u];
          if (value > level) bright++;
        }
      }
      bits[cy * cells + cx] = bright > (PIXELS_PER_CELL * PIXELS_PER_CELL) / 2 ? 1 : 0;
    }
  }
  return bits;
};

/**
 * Finds ArUco markers from a predefined dictionary and returns each one's
 * id and corners. It follows OpenCV's `ArucoDetector` with its default
 * parameters: the gray image is thresholded against its local mean at three
 * window sizes, outlines that simplify to convex quadrilaterals become
 * candidates, each candidate is unwarped and read cell by cell, and its bits
 * are matched against every marker of the dictionary at all four rotations.
 * Ids and corners match OpenCV's; corners are pixels of the marker's
 * outline, not refined to subpixel accuracy.
 *
 * Markers need their black border and a light quiet zone around it, and
 * must not touch other dark shapes. Inverted (white-on-black) markers are
 * not found.
 *
 * @param image - Single-channel `u8` matrix (gray).
 * @param options - The dictionary (default `"4x4_50"`).
 * @returns The markers found, by id, each with its corners in the marker's own
 *   order (top-left, top-right, bottom-right, bottom-left as drawn).
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel or the dictionary is unknown.
 *
 * @example
 * const markers = detectArucoMarkers(grayscale(frame), { dictionary: "6x6_250" });
 * for (const { id, corners } of markers) console.log(id, corners[0]);
 */
export function detectArucoMarkers(
  image: Matrix<"u8">,
  options: DetectArucoMarkersOptions = {},
): ArucoMarker[] {
  assertType("detectArucoMarkers", image, "u8");
  assertChannels("detectArucoMarkers", image, 1);
  const dictionary = getArucoDictionary(options.dictionary ?? "4x4_50", "detectArucoMarkers");
  const n = dictionary.markerSize;
  const cells = n + 2;

  const found: Point[][] = [];
  for (const blockSize of THRESHOLD_WINDOWS) {
    const binary = adaptiveThreshold(image, {
      blockSize,
      offset: THRESHOLD_CONSTANT,
      invert: true,
    });
    found.push(...findCandidates(binary));
  }
  const tries = candidateTries(found, cells);

  const maxBorderErrors = Math.floor(n * n * MAX_BORDER_ERROR_RATE);
  const observed = new Uint8Array(dictionary.byteCount);
  const markers: ArucoMarker[] = [];
  for (const options of tries) {
    for (const corners of options) {
      const bits = readCells(image, corners, cells);
      let borderErrors = 0;
      for (let y = 0; y < cells; y++) {
        for (let x = 0; x < cells; x++) {
          if ((x === 0 || y === 0 || x === cells - 1 || y === cells - 1) && bits[y * cells + x]) {
            borderErrors++;
          }
        }
      }
      if (borderErrors > maxBorderErrors) continue;
      observed.fill(0);
      packBits((r, c) => bits[(r + 1) * cells + c + 1], n, observed, 0);
      const match = identify(dictionary, observed);
      if (!match) continue;
      // Seen turned by `rotation` quarter turns: the marker's top-left corner
      // is that many corners back.
      const turn = (4 - match.rotation) % 4;
      markers.push({
        id: match.id,
        corners: [0, 1, 2, 3].map((i) => ({
          ...corners[(i + turn) % 4],
        })) as ArucoMarker["corners"],
      });
      break;
    }
  }
  return markers.sort(
    (a, b) => a.id - b.id || a.corners[0].y - b.corners[0].y || a.corners[0].x - b.corners[0].x,
  );
}

/**
 * Draws a marker of a predefined ArUco dictionary, as OpenCV's
 * `generateImageMarker`: black border, white and black cells, nearest-pixel
 * scaled to the requested size. Leave a white margin around it when you
 * print or show it.
 *
 * @param id - Index of the marker in the dictionary.
 * @param options - Dictionary, image size and border width.
 * @returns A single-channel `u8` image, `size` x `size`, 0 for black and 255 for white.
 * @throws {RangeError} When the id isn't in the dictionary, the dictionary is
 *   unknown, the border isn't at least 1 or the size is smaller than the cells.
 *
 * @example
 * const marker = generateArucoMarker(7, { size: 200 }); // DICT_4X4_50, id 7
 */
export function generateArucoMarker(
  id: number,
  options: GenerateArucoMarkerOptions = {},
): Matrix<"u8"> {
  const { size = 120, borderBits = 1 } = options;
  const dictionary = getArucoDictionary(options.dictionary ?? "4x4_50", "generateArucoMarker");
  const n = dictionary.markerSize;
  assertInteger("generateArucoMarker", "id", id, 0);
  if (id >= dictionary.count) {
    throw new RangeError(
      `generateArucoMarker: id must be below ${dictionary.count} for this dictionary, got ${id}`,
    );
  }
  assertInteger("generateArucoMarker", "borderBits", borderBits, 1);
  const cells = n + 2 * borderBits;
  assertInteger("generateArucoMarker", "size", size, cells);
  const marker = createMatrix(size, size);
  const offset = id * dictionary.byteCount * 4;
  // Nearest-pixel scaling as OpenCV's resize: source cell floor(x * cells / size).
  const scale = 1 / (size / cells);
  const cellOf = (x: number) => Math.min(Math.floor(x * scale), cells - 1);
  for (let y = 0; y < size; y++) {
    const row = cellOf(y) - borderBits;
    for (let x = 0; x < size; x++) {
      const column = cellOf(x) - borderBits;
      const inside = row >= 0 && column >= 0 && row < n && column < n;
      marker.data[y * size + x] =
        inside && unpackBit(dictionary.rotations, offset, n, row * n + column) ? 255 : 0;
    }
  }
  return marker;
}
