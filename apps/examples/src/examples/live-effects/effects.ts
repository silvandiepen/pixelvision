import {
  adaptiveThreshold,
  canny,
  clahe,
  cloneMatrix,
  dilate,
  erode,
  filter2D,
  flip,
  fromImageData,
  gaussianBlur,
  grayscale,
  medianBlur,
  threshold,
} from "pixelvision";
import type { Matrix, RGBAImage } from "pixelvision";
import { defaultValues } from "../define";
import type { Effect, EffectId, EffectLayer } from "./effects.model";

/**
 * The image as one gray channel; gray images are returned as they are.
 *
 * @param image - RGBA or gray.
 * @returns A gray image.
 */
const gray = (image: Matrix<"u8">): Matrix<"u8"> =>
  image.channels === 1 ? image : grayscale(image);

/** Odd sizes for kernels and windows. */
const odd = (sizes: number[]) => sizes.map((value) => ({ label: `${value}`, value }));

/** Every effect, in the order the palette shows them. */
export const EFFECTS: readonly Effect[] = [
  {
    id: "grayscale",
    label: "Gray",
    description: "Drops the colour (`grayscale`).",
    controls: [],
    apply: gray,
  },
  {
    id: "blur",
    label: "Blur",
    description: "Softens the whole picture (`gaussianBlur`).",
    controls: [
      {
        type: "select",
        key: "size",
        label: "Strength",
        description: "Kernel size.",
        options: odd([3, 5, 9, 15, 21]),
        default: 9,
      },
    ],
    apply: (image, { size }) => gaussianBlur(image, { kernelSize: size as number }),
  },
  {
    id: "smooth",
    label: "Paint",
    description: "Flattens texture but keeps edges, like paint (`medianBlur`).",
    controls: [
      {
        type: "select",
        key: "size",
        label: "Brush",
        description: "Window size.",
        options: odd([3, 5, 7, 9]),
        default: 5,
      },
    ],
    apply: (image, { size }) => medianBlur(image, size as number),
  },
  {
    id: "sharpen",
    label: "Sharpen",
    description: "Makes edges crisper (`filter2D` with a sharpening kernel).",
    controls: [
      {
        type: "range",
        key: "amount",
        label: "Amount",
        description: "How much the centre outweighs its neighbours.",
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.8,
      },
    ],
    apply: (image, { amount }) => {
      const a = amount as number;
      return filter2D(image, [
        [0, -a, 0],
        [-a, 1 + 4 * a, -a],
        [0, -a, 0],
      ]);
    },
  },
  {
    id: "emboss",
    label: "Emboss",
    description: "Lights the picture from one side, like a relief (`filter2D`).",
    controls: [],
    apply: (image) =>
      filter2D(
        gray(image),
        [
          [-2, -1, 0],
          [-1, 0, 1],
          [0, 1, 2],
        ],
        { delta: 128 },
      ),
  },
  {
    id: "edges",
    label: "Edges",
    description: "Keeps only the outlines (`canny`).",
    controls: [
      {
        type: "range",
        key: "low",
        label: "Low threshold",
        description: "Weak edges are kept when they touch strong ones.",
        min: 0,
        max: 200,
        step: 1,
        default: 40,
      },
      {
        type: "range",
        key: "high",
        label: "High threshold",
        description: "Edges stronger than this always count.",
        min: 1,
        max: 400,
        step: 1,
        default: 100,
      },
    ],
    apply: (image, { low, high }) =>
      canny(gaussianBlur(gray(image), { kernelSize: 3 }), {
        low: low as number,
        high: high as number,
      }),
  },
  {
    id: "threshold",
    label: "Black and white",
    description: "Every pixel black or white (`threshold`, Otsu's level by default).",
    controls: [
      {
        type: "toggle",
        key: "auto",
        label: "Automatic level",
        description: "Let Otsu's method pick the level.",
        default: true,
      },
      {
        type: "range",
        key: "level",
        label: "Level",
        description: "Brighter than this turns white (when not automatic).",
        min: 0,
        max: 255,
        step: 1,
        default: 128,
      },
    ],
    apply: (image, { auto, level }) =>
      threshold(gray(image), auto ? {} : { level: level as number }),
  },
  {
    id: "scan",
    label: "Scanned page",
    description: "Ink on white paper, even in uneven light (`adaptiveThreshold`).",
    controls: [
      {
        type: "select",
        key: "blockSize",
        label: "Area",
        description: "Neighbourhood the local level is taken over.",
        options: odd([7, 11, 15, 25, 35]),
        default: 15,
      },
      {
        type: "range",
        key: "offset",
        label: "Cleanness",
        description: "Higher keeps only clearly dark ink.",
        min: 0,
        max: 30,
        step: 1,
        default: 8,
      },
    ],
    apply: (image, { blockSize, offset }) =>
      adaptiveThreshold(gray(image), {
        blockSize: blockSize as number,
        offset: offset as number,
        invert: true,
      }),
  },
  {
    id: "contrast",
    label: "Local contrast",
    description: "Brings out detail in dark and bright areas (`clahe`).",
    controls: [
      {
        type: "range",
        key: "clipLimit",
        label: "Strength",
        description: "Higher brings out more detail, and more noise.",
        min: 1,
        max: 40,
        step: 1,
        default: 4,
      },
    ],
    apply: (image, { clipLimit }) => clahe(gray(image), { clipLimit: clipLimit as number }),
  },
  {
    id: "thicken",
    label: "Thicken",
    description: "Grows bright areas, so lines get bolder (`dilate`).",
    controls: [
      {
        type: "range",
        key: "radius",
        label: "Radius",
        description: "How far bright areas grow.",
        min: 1,
        max: 4,
        step: 1,
        default: 1,
      },
    ],
    apply: (image, { radius }) => dilate(gray(image), { radius: radius as number }),
  },
  {
    id: "thin",
    label: "Thin",
    description: "Shrinks bright areas, so specks disappear (`erode`).",
    controls: [
      {
        type: "range",
        key: "radius",
        label: "Radius",
        description: "How far bright areas shrink.",
        min: 1,
        max: 4,
        step: 1,
        default: 1,
      },
    ],
    apply: (image, { radius }) => erode(gray(image), { radius: radius as number }),
  },
  {
    id: "invert",
    label: "Negative",
    description: "Turns dark into light and back; the one effect written by hand.",
    controls: [],
    apply: (image) => {
      const out = cloneMatrix(image);
      const { channels, data } = out;
      for (let i = 0; i < data.length; i++) {
        // Leave the alpha channel of RGBA alone.
        if (channels !== 4 || i % 4 !== 3) data[i] = 255 - data[i];
      }
      return out;
    },
  },
  {
    id: "mirror",
    label: "Mirror",
    description: "Flips the picture left to right (`flip`).",
    controls: [],
    apply: (image) => flip(image, "horizontal"),
  },
];

/**
 * Finds an effect.
 *
 * @param id - Its id.
 * @returns The effect.
 * @throws {Error} When there's no effect with that id.
 */
export function findEffect(id: EffectId): Effect {
  const effect = EFFECTS.find((candidate) => candidate.id === id);
  if (!effect) throw new Error(`Unknown effect "${id}"`);
  return effect;
}

let nextKey = 1;

/**
 * A new layer for the stack, with the effect's default settings.
 *
 * @param id - The effect.
 * @returns The layer, switched on.
 */
export function createLayer(id: EffectId): EffectLayer {
  return {
    key: nextKey++,
    effect: id,
    enabled: true,
    options: defaultValues(findEffect(id).controls),
  };
}

/**
 * Runs an image through the stack, top to bottom, skipping layers that are off.
 *
 * @param image - RGBA pixels, such as a camera frame.
 * @param layers - The stack.
 * @returns The result, RGBA or gray.
 */
export function applyEffects(image: RGBAImage, layers: readonly EffectLayer[]): Matrix<"u8"> {
  let result = fromImageData(image);
  for (const layer of layers) {
    if (layer.enabled) result = findEffect(layer.effect).apply(result, layer.options);
  }
  return result;
}
