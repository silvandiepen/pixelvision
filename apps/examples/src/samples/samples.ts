import type { Point, RGBAImage } from "pixelvision";
import { seededRandom } from "./random";
import { generateArucoMarker } from "pixelvision";
import {
  addNoise,
  createImage,
  fillCircle,
  fillPolygon,
  fillRect,
  fillShape,
  insidePolygon,
  quadPoint,
} from "./raster";
import type { Color, Vec } from "./raster.model";
import type { Sample, SampleId, TurnedSquare } from "./samples.model";

/** Width of every sample. */
export const SAMPLE_WIDTH = 320;
/** Height of every sample. */
export const SAMPLE_HEIGHT = 240;

/** Corners of the card in the desk sample: top-left, top-right, bottom-right, bottom-left. */
export const DESK_CARD_CORNERS: readonly Point[] = [
  { x: 84, y: 46 },
  { x: 252, y: 66 },
  { x: 238, y: 196 },
  { x: 64, y: 172 },
];

/** Corners of the blue triangle in the shapes sample. */
export const SHAPES_TRIANGLE: readonly Point[] = [
  { x: 40, y: 212 },
  { x: 110, y: 118 },
  { x: 180, y: 212 },
];

/** Card colours in the desk sample. */
export const DESK_COLORS = {
  card: [244, 242, 236] as Color,
  header: [37, 99, 235] as Color,
  text: [55, 60, 72] as Color,
  stamp: [220, 38, 38] as Color,
};

/** Swatches of the palette sample, row by row; `skin` marks the ones in the skin-tone range. */
export const PALETTE_SWATCHES: readonly { color: Color; skin: boolean }[] = [
  { color: [255, 219, 172], skin: true },
  { color: [224, 172, 105], skin: true },
  { color: [198, 134, 66], skin: true },
  { color: [141, 85, 36], skin: true },
  { color: [220, 38, 38], skin: false },
  { color: [34, 197, 94], skin: false },
  { color: [37, 99, 235], skin: false },
  { color: [128, 128, 128], skin: false },
  { color: [240, 220, 10], skin: false },
  { color: [147, 51, 234], skin: false },
  { color: [250, 250, 250], skin: false },
  { color: [20, 20, 24], skin: false },
];

/** Size of one palette swatch in pixels (4 columns, 3 rows). */
export const PALETTE_SWATCH_SIZE = 80;

/**
 * Maps a rectangle given in card coordinates (0–1) onto the card in the
 * desk sample.
 *
 * @param u0 - Left, 0–1.
 * @param v0 - Top, 0–1.
 * @param u1 - Right, 0–1.
 * @param v1 - Bottom, 0–1.
 * @returns The four corners in the image.
 */
function onCard(u0: number, v0: number, u1: number, v1: number): Vec[] {
  return [
    quadPoint(DESK_CARD_CORNERS, u0, v0),
    quadPoint(DESK_CARD_CORNERS, u1, v0),
    quadPoint(DESK_CARD_CORNERS, u1, v1),
    quadPoint(DESK_CARD_CORNERS, u0, v1),
  ];
}

/**
 * Draws a business card lying at an angle on a wooden desk, with a pen.
 *
 * @returns The image.
 */
function desk(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [0, 0, 0]);
  const { data } = image;
  for (let y = 0; y < SAMPLE_HEIGHT; y++) {
    for (let x = 0; x < SAMPLE_WIDTH; x++) {
      const grain = 0.88 + 0.12 * Math.sin(y * 0.31 + Math.sin(x * 0.021) * 3);
      const i = (y * SAMPLE_WIDTH + x) * 4;
      data[i] = Math.round(132 * grain);
      data[i + 1] = Math.round(94 * grain);
      data[i + 2] = Math.round(62 * grain);
    }
  }
  addNoise(image, 5, seededRandom(11));
  fillPolygon(image, DESK_CARD_CORNERS, DESK_COLORS.card);
  fillPolygon(image, onCard(0.05, 0.07, 0.95, 0.3), DESK_COLORS.header);
  for (const [v, end] of [
    [0.42, 0.5],
    [0.56, 0.62],
    [0.7, 0.4],
  ]) {
    fillPolygon(image, onCard(0.08, v, end, v + 0.06), DESK_COLORS.text);
  }
  fillPolygon(image, onCard(0.76, 0.66, 0.92, 0.88), DESK_COLORS.stamp);
  fillPolygon(
    image,
    [
      { x: 22, y: 214 },
      { x: 150, y: 196 },
      { x: 151, y: 202 },
      { x: 23, y: 220 },
    ],
    [30, 32, 40],
  );
  fillCircle(image, { x: 286, y: 200 }, 24, [64, 44, 34]);
  fillCircle(image, { x: 286, y: 200 }, 17, [92, 58, 38]);
  return image;
}

/**
 * Draws flat coloured shapes on a light background: a red rectangle, a green
 * circle, a blue triangle and a dark rotated square.
 *
 * @returns The image.
 */
function shapes(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [0, 0, 0]);
  const { data } = image;
  for (let y = 0; y < SAMPLE_HEIGHT; y++) {
    const shade = Math.round(236 - (y / SAMPLE_HEIGHT) * 22);
    for (let x = 0; x < SAMPLE_WIDTH; x++) {
      const i = (y * SAMPLE_WIDTH + x) * 4;
      data[i] = shade;
      data[i + 1] = shade;
      data[i + 2] = shade;
    }
  }
  addNoise(image, 3, seededRandom(7));
  fillRect(image, [24, 24, 96, 72], [255, 0, 0]);
  fillCircle(image, { x: 220, y: 70 }, 44, [34, 197, 94]);
  fillPolygon(image, SHAPES_TRIANGLE, [37, 99, 235]);
  const center = { x: 252, y: 172 };
  const angle = (20 * Math.PI) / 180;
  fillPolygon(
    image,
    [
      [-34, -34],
      [34, -34],
      [34, 34],
      [-34, 34],
    ].map(([dx, dy]) => ({
      x: center.x + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: center.y + dx * Math.sin(angle) + dy * Math.cos(angle),
    })),
    [40, 40, 48],
  );
  return image;
}

/**
 * Draws a dull, low-contrast gray scene: every value sits between about 90
 * and 160.
 *
 * @returns The image.
 */
function lowContrast(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [0, 0, 0]);
  const { data } = image;
  for (let y = 0; y < SAMPLE_HEIGHT; y++) {
    for (let x = 0; x < SAMPLE_WIDTH; x++) {
      const value = Math.round(108 + (x / SAMPLE_WIDTH) * 26 + (y / SAMPLE_HEIGHT) * 8);
      const i = (y * SAMPLE_WIDTH + x) * 4;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
  }
  fillCircle(image, { x: 100, y: 118 }, 62, [148, 148, 148]);
  fillRect(image, [184, 52, 100, 136], [98, 98, 98]);
  fillPolygon(
    image,
    [
      { x: 200, y: 168 },
      { x: 236, y: 76 },
      { x: 272, y: 168 },
    ],
    [154, 154, 154],
  );
  addNoise(image, 4, seededRandom(3));
  return image;
}

/**
 * Draws a 4x3 grid of colour swatches; the first row are skin tones.
 *
 * @returns The image.
 */
function palette(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [0, 0, 0]);
  PALETTE_SWATCHES.forEach(({ color }, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    fillRect(
      image,
      [
        column * PALETTE_SWATCH_SIZE,
        row * PALETTE_SWATCH_SIZE,
        PALETTE_SWATCH_SIZE,
        PALETTE_SWATCH_SIZE,
      ],
      color,
    );
  });
  return image;
}

/** Centre and size of the face in the portrait sample. */
export const PORTRAIT_FACE = { x: 160, y: 128.5, width: 78, height: 101 };

/**
 * Outlines an ellipse as a polygon.
 *
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param rx - Horizontal radius.
 * @param ry - Vertical radius.
 * @returns 48 points around it.
 */
function ellipse(cx: number, cy: number, rx: number, ry: number): Vec[] {
  return Array.from({ length: 48 }, (_, i) => ({
    x: cx + rx * Math.cos((i / 48) * 2 * Math.PI),
    y: cy + ry * Math.sin((i / 48) * 2 * Math.PI),
  }));
}

/**
 * Draws a plain, schematic face (hair, skin, eyes, brows, nose, mouth, one
 * ear) on a blue-gray background: enough structure for the frontal-face
 * cascade, and no real person.
 *
 * @returns The image.
 */
function portrait(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [70, 80, 95]);
  const s = 0.7;
  const cx = 160;
  const cy = 125;
  fillPolygon(image, ellipse(cx, cy - 20 * s, 66 * s, 70 * s), [40, 30, 25]);
  fillPolygon(image, ellipse(cx, cy + 5 * s, 56 * s, 72 * s), [224, 180, 150]);
  for (const side of [-1, 1]) {
    fillPolygon(image, ellipse(cx + side * 22 * s, cy - 12 * s, 11 * s, 5 * s), [50, 40, 40]);
    fillPolygon(image, ellipse(cx + side * 22 * s, cy - 26 * s, 14 * s, 3 * s), [70, 50, 40]);
  }
  fillPolygon(image, ellipse(cx, cy + 14 * s, 7 * s, 4 * s), [180, 130, 110]);
  fillPolygon(image, ellipse(cx, cy + 36 * s, 20 * s, 5 * s), [140, 70, 70]);
  fillCircle(image, { x: cx - 52 * s, y: cy + 2 * s }, 8 * s, [205, 160, 130]);
  return image;
}

/** Size of the page sample's text: line count, line pitch and stroke height, in pixels. */
const PAGE_TEXT = { lines: 9, top: 34, pitch: 20, stroke: 4, left: 28, right: 292 };

/**
 * Where the page sample's "words" are: `[left, top, width, height]` bars,
 * line by line, the same every time.
 */
export const PAGE_WORDS: readonly (readonly [number, number, number, number])[] = (() => {
  const random = seededRandom(11);
  const words: [number, number, number, number][] = [];
  for (let line = 0; line < PAGE_TEXT.lines; line++) {
    const top = PAGE_TEXT.top + line * PAGE_TEXT.pitch;
    // The last line of a paragraph is shorter.
    const end = line % 4 === 3 ? 180 : PAGE_TEXT.right;
    let x = PAGE_TEXT.left;
    while (true) {
      const width = 10 + Math.floor(random() * 34);
      if (x + width > end) break;
      words.push([x, top, width, PAGE_TEXT.stroke]);
      x += width + 7;
    }
  }
  return words;
})();

/**
 * How much light reaches each point of the page sample: full at the top
 * left, falling to 20 % at the bottom right.
 *
 * @param x - Column.
 * @param y - Row.
 * @returns A factor from 0.2 to 1.
 */
export function pageLight(x: number, y: number): number {
  return 1 - 0.8 * ((x / (SAMPLE_WIDTH - 1)) * 0.7 + (y / (SAMPLE_HEIGHT - 1)) * 0.3);
}

/**
 * Draws a page of text (bars standing in for words) lit from the top left,
 * so the paper on the right is darker than the ink on the left.
 *
 * @returns The image.
 */
function page(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [0, 0, 0]);
  const ink = new Uint8Array(SAMPLE_WIDTH * SAMPLE_HEIGHT);
  for (const [left, top, width, height] of PAGE_WORDS) {
    for (let y = top; y < top + height; y++)
      ink.fill(1, y * SAMPLE_WIDTH + left, y * SAMPLE_WIDTH + left + width);
  }
  const { data } = image;
  for (let y = 0; y < SAMPLE_HEIGHT; y++) {
    for (let x = 0; x < SAMPLE_WIDTH; x++) {
      const i = y * SAMPLE_WIDTH + x;
      const light = pageLight(x, y);
      const [r, g, b] = ink[i] ? [86, 88, 98] : [240, 236, 226];
      data[i * 4] = r * light;
      data[i * 4 + 1] = g * light;
      data[i * 4 + 2] = b * light;
    }
  }
  addNoise(image, 3, seededRandom(5));
  return image;
}

/** The pebbles sample's stones: centre and radii, placed so none touch. */
export const PEBBLES: readonly { x: number; y: number; rx: number; ry: number }[] = (() => {
  const random = seededRandom(23);
  const stones: { x: number; y: number; rx: number; ry: number }[] = [];
  for (let attempt = 0; attempt < 500 && stones.length < 17; attempt++) {
    const rx = 8 + Math.round(random() * 10);
    const ry = Math.round(rx * (0.6 + random() * 0.4));
    const x = 16 + rx + Math.round(random() * (SAMPLE_WIDTH - 32 - 2 * rx));
    const y = 16 + ry + Math.round(random() * (SAMPLE_HEIGHT - 32 - 2 * ry));
    // At least 6 pixels of table between any two stones.
    if (
      stones.every(
        (o) => Math.hypot(o.x - x, o.y - y) > Math.max(o.rx, o.ry) + Math.max(rx, ry) + 6,
      )
    ) {
      stones.push({ x, y, rx, ry });
    }
  }
  return stones;
})();

/**
 * Draws dark pebbles of different sizes on a light table, none touching,
 * for counting objects.
 *
 * @returns The image.
 */
function pebbles(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [222, 218, 208]);
  addNoise(image, 4, seededRandom(29));
  const random = seededRandom(31);
  for (const stone of PEBBLES) {
    const shade = 50 + Math.round(random() * 40);
    fillPolygon(image, ellipse(stone.x, stone.y, stone.rx, stone.ry), [
      shade,
      shade - 6,
      shade - 12,
    ]);
  }
  return image;
}

/**
 * The QR code in the qr-code sample: "https://pixelvision.dev" as version 2
 * (25 x 25 modules), error correction M, mask 4, made by pixelvision's test
 * encoder. Rows top to bottom, 1 for a dark module.
 */
export const QR_MODULES: readonly string[] = [
  "1111111011011011101111111",
  "1000001000001000101000001",
  "1011101001111011101011101",
  "1011101011001110101011101",
  "1011101010111011101011101",
  "1000001011111000101000001",
  "1111111010101010101111111",
  "0000000011100000100000000",
  "1000101110111010111111001",
  "0000110100100011100011010",
  "0000101000100111011001100",
  "0010010110110001100000110",
  "1011101011111001011001111",
  "1110010011100111110010010",
  "0000111100100011111111100",
  "0011100111001000010110110",
  "1110011110010000111111100",
  "0000000011001111100010000",
  "1111111010011010101010000",
  "1000001001010010100011101",
  "1011101010001000111111111",
  "1011101001000100011100111",
  "1011101001100110011001010",
  "1000001000001001000111110",
  "1111111011011111011000111",
];

/** Where the qr-code sample's symbol is drawn (5 pixels per module, no quiet zone). */
export const QR_SYMBOL: TurnedSquare = { x: 160, y: 120, side: 125, angle: 8 };

/**
 * Corners of a turned square: top-left, top-right, bottom-right, bottom-left
 * as it is drawn, wherever the turn puts them.
 *
 * @param square - Centre, side and turn.
 * @returns The four corners.
 */
export function squareCorners({ x, y, side, angle }: TurnedSquare): Vec[] {
  const a = (angle * Math.PI) / 180;
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([dx, dy]) => ({
    x: x + (side / 2) * (dx * Math.cos(a) - dy * Math.sin(a)),
    y: y + (side / 2) * (dx * Math.sin(a) + dy * Math.cos(a)),
  }));
}

/**
 * Paints a grid of cells over a turned square, anti-aliased in one pass so
 * neighbouring cells don't leave seams.
 *
 * @param image - Image to draw on.
 * @param square - Where the grid goes.
 * @param cells - Cells per side.
 * @param dark - Whether a cell (column, row) is dark.
 * @param color - Colour of the dark cells.
 */
function paintGrid(
  image: RGBAImage,
  square: TurnedSquare,
  cells: number,
  dark: (column: number, row: number) => boolean,
  color: Color,
): void {
  const a = (square.angle * Math.PI) / 180;
  const corners = squareCorners(square);
  fillShape(
    image,
    [
      Math.min(...corners.map((c) => c.x)),
      Math.min(...corners.map((c) => c.y)),
      Math.max(...corners.map((c) => c.x)),
      Math.max(...corners.map((c) => c.y)),
    ],
    color,
    (x, y) => {
      // Turn the point back into the square's own frame, 0-1 across.
      const u = ((x - square.x) * Math.cos(a) + (y - square.y) * Math.sin(a)) / square.side + 0.5;
      const v = (-(x - square.x) * Math.sin(a) + (y - square.y) * Math.cos(a)) / square.side + 0.5;
      if (u < 0 || v < 0 || u >= 1 || v >= 1) return false;
      return dark(Math.floor(u * cells), Math.floor(v * cells));
    },
  );
}

/**
 * Draws the generated QR code printed on a card, turned a little on a gray
 * desk.
 *
 * @returns The image.
 */
function qrCode(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [150, 146, 140]);
  // The card: the symbol plus a quiet zone of 4 modules on every side.
  fillPolygon(
    image,
    squareCorners({ ...QR_SYMBOL, side: (QR_SYMBOL.side * 33) / 25 }),
    [242, 240, 234],
  );
  paintGrid(image, QR_SYMBOL, 25, (column, row) => QR_MODULES[row][column] === "1", [24, 24, 30]);
  addNoise(image, 4, seededRandom(17));
  return image;
}

/** The ArUco markers (DICT_4X4_50) in the markers sample: id and where each is drawn. */
export const MARKERS: readonly ({ id: number } & TurnedSquare)[] = [
  { id: 3, x: 70, y: 75, side: 72, angle: 0 },
  { id: 17, x: 232, y: 72, side: 64, angle: 30 },
  { id: 42, x: 160, y: 178, side: 60, angle: -15 },
];

/**
 * Draws three ArUco markers (DICT_4X4_50, as `generateArucoMarker` makes
 * them) on a light table, turned different ways.
 *
 * @returns The image.
 */
function markers(): RGBAImage {
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [0, 0, 0]);
  const { data } = image;
  for (let y = 0; y < SAMPLE_HEIGHT; y++) {
    for (let x = 0; x < SAMPLE_WIDTH; x++) {
      const shade = Math.round(214 - (x / SAMPLE_WIDTH) * 18);
      const i = (y * SAMPLE_WIDTH + x) * 4;
      data[i] = shade;
      data[i + 1] = shade;
      data[i + 2] = shade - 6;
    }
  }
  for (const marker of MARKERS) {
    // 6 x 6 cells: the black border and the 4 x 4 bits.
    const cells = generateArucoMarker(marker.id, { size: 6 });
    paintGrid(image, marker, 6, (column, row) => cells.data[row * 6 + column] === 0, [22, 22, 26]);
  }
  addNoise(image, 4, seededRandom(19));
  return image;
}

/** The badge of the logo sample: a ring, with a disc in its middle. */
export const LOGO_BADGE = { x: 80, y: 88, outer: 56, inner: 44, disc: 20 };

/** The square of the logo sample: `[left, top, width, height]`, on whole pixels. */
export const LOGO_SQUARE: readonly [number, number, number, number] = [40, 168, 48, 48];

/** Corners of the triangle in the logo sample. */
export const LOGO_TRIANGLE: readonly Point[] = [
  { x: 120, y: 216 },
  { x: 150, y: 166 },
  { x: 180, y: 216 },
];

/** The pill of the logo sample: the centres of its two round ends, and its radius. */
export const LOGO_PILL = { left: 216, right: 280, y: 192, radius: 16 };

/** Shapes in the logo sample, and holes among them (ring 1, O 1, A 1, B 2). */
export const LOGO_COUNTS = { shapes: 8, holes: 5 };

/**
 * Whether a point is inside an axis-aligned ellipse.
 *
 * @param x - Point x.
 * @param y - Point y.
 * @param cx - Centre x.
 * @param cy - Centre y.
 * @param rx - Horizontal radius.
 * @param ry - Vertical radius.
 * @returns `true` inside.
 */
function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
}

/** Outline of the A in the wordmark, in glyph units (scaled by 0.8 and moved when drawn). */
const LETTER_A: readonly Vec[] = [
  [70, 85],
  [95, 15],
  [115, 15],
  [140, 85],
  [124, 85],
  [118, 67],
  [92, 67],
  [86, 85],
].map(([x, y]) => ({ x, y }));

/** The counter of the A, in glyph units. */
const COUNTER_A: readonly Vec[] = [
  [96, 55],
  [105, 28],
  [114, 55],
].map(([x, y]) => ({ x, y }));

/**
 * Whether a point is inside the wordmark "OAB", in glyph units: an O with
 * one counter, an A with one and a B with two.
 *
 * @param x - Point x.
 * @param y - Point y.
 * @returns `true` on a letter.
 */
function inWordmark(x: number, y: number): boolean {
  if (inEllipse(x, y, 35, 50, 22, 32) && !inEllipse(x, y, 35, 50, 11, 20)) return true;
  if (insidePolygon(LETTER_A, x, y) && !insidePolygon(COUNTER_A, x, y)) return true;
  const b =
    x >= 150 &&
    (inEllipse(x, y, 162, 32.5, 20, 17.5) ||
      inEllipse(x, y, 162, 66.5, 23, 18.5) ||
      (x <= 162 && y >= 15 && y <= 85));
  const counters =
    x > 162 && (inEllipse(x, y, 162, 32.5, 10, 8) || inEllipse(x, y, 162, 66.5, 12, 9));
  return b && !counters;
}

/**
 * Draws a flat logo sheet on paper: a navy ring badge with an orange disc
 * inside, the wordmark "OAB", and a row of simple shapes: a teal square, a
 * navy triangle and an orange pill.
 *
 * @returns The image.
 */
function logo(): RGBAImage {
  const navy: Color = [30, 41, 82];
  const orange: Color = [234, 88, 12];
  const image = createImage(SAMPLE_WIDTH, SAMPLE_HEIGHT, [247, 245, 240]);
  addNoise(image, 3, seededRandom(29));
  const { x, y, outer, inner, disc } = LOGO_BADGE;
  fillShape(image, [x - outer, y - outer, x + outer, y + outer], navy, (px, py) => {
    const d = Math.hypot(px - x, py - y);
    return d <= outer && d >= inner;
  });
  fillCircle(image, { x, y }, disc, orange);
  // The wordmark, 0.8 of its glyph size, from (160, 30).
  fillShape(image, [160, 30, 310, 100], navy, (px, py) =>
    inWordmark((px - 160) / 0.8, (py - 30) / 0.8),
  );
  fillRect(image, LOGO_SQUARE, [13, 148, 136]);
  fillPolygon(image, LOGO_TRIANGLE, navy);
  const pill = LOGO_PILL;
  const pillBounds = [
    pill.left - pill.radius,
    pill.y - pill.radius,
    pill.right + pill.radius,
    pill.y + pill.radius,
  ] as const;
  fillShape(image, pillBounds, orange, (px, py) => {
    const cx = Math.min(Math.max(px, pill.left), pill.right);
    return Math.hypot(px - cx, py - pill.y) <= pill.radius;
  });
  return image;
}

/** Every bundled sample. */
export const SAMPLES: readonly Sample[] = [
  {
    id: "desk",
    label: "Card on a desk",
    description: "A business card photographed at an angle on a wooden desk.",
    generate: desk,
  },
  {
    id: "shapes",
    label: "Shapes",
    description: "Flat coloured shapes with sharp edges on a light background.",
    generate: shapes,
  },
  {
    id: "low-contrast",
    label: "Low contrast",
    description: "A dull gray scene whose values span only about 90 to 160.",
    generate: lowContrast,
  },
  {
    id: "palette",
    label: "Colour swatches",
    description: "Twelve flat swatches; the top row are skin tones.",
    generate: palette,
  },
  {
    id: "portrait",
    label: "Drawn face",
    description: "A plain schematic face, drawn from ellipses, for the face detector.",
    generate: portrait,
  },
  {
    id: "page",
    label: "Unevenly lit page",
    description:
      "Lines of text on a page, lit from the top left: the paper on the right is darker than the ink on the left.",
    generate: page,
  },
  {
    id: "qr-code",
    label: "QR code",
    description:
      'A QR code for "https://pixelvision.dev" (version 2, 25 x 25 modules) printed on a card, turned 8° on a gray desk.',
    generate: qrCode,
  },
  {
    id: "markers",
    label: "ArUco markers",
    description:
      "Three ArUco markers from DICT_4X4_50 (ids 3, 17 and 42) on a light table, turned 0°, 30° and -15°.",
    generate: markers,
  },
  {
    id: "pebbles",
    label: "Pebbles",
    description: "Seventeen dark pebbles of different sizes on a light table, none touching.",
    generate: pebbles,
  },
  {
    id: "logo",
    label: "Logo sheet",
    description:
      "A flat logo on paper: a ring badge with a disc inside, the letters O, A and B with their counters, a square, a triangle and a pill.",
    generate: logo,
  },
];

/**
 * Finds a sample by id.
 *
 * @param id - Sample id.
 * @returns The sample.
 * @throws {Error} When no sample has that id.
 */
export function getSample(id: SampleId): Sample {
  const sample = SAMPLES.find((candidate) => candidate.id === id);
  if (!sample) throw new Error(`Unknown sample: ${id}`);
  return sample;
}
