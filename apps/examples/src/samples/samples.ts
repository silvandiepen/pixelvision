import type { Point, RGBAImage } from "pixelvision";
import { seededRandom } from "./random";
import { addNoise, createImage, fillCircle, fillPolygon, fillRect, quadPoint } from "./raster";
import type { Color, Vec } from "./raster.model";
import type { Sample, SampleId } from "./samples.model";

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
