import { defineExample } from "../define";
import { demo } from "./demo";
import type { CreateMatrixDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const createMatrixExample = defineExample<CreateMatrixDemoOptions>({
  slug: "create-matrix",
  title: "createMatrix",
  functions: ["createMatrix"],
  category: "core",
  description:
    "Creates a matrix: the plain object every pixelvision function reads and returns. It holds the size, the number of channels and a typed array with the values.",
  howItWorks: [
    "A matrix is `{ type, width, height, channels, data }`. Values are stored row by row with the channels of each pixel next to each other, so channel `c` of pixel `(x, y)` is `data[(y * width + x) * channels + c]`.",
    "The type picks the typed array: `u8` → `Uint8Array` for pixels, `i32` → `Int32Array` for gradients and sums, `f32`/`f64` → float arrays for maths. New matrices are zero-filled; pass `data` to wrap an existing array instead of allocating.",
  ],
  howToTest:
    "Creates the default 16 x 12 `u8` matrix and checks its type, that `data` has exactly width x height x channels values of one byte each, and that they start at zero.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "width",
      label: "Width",
      description: "Number of columns.",
      min: 1,
      max: 48,
      step: 1,
      default: 16,
    },
    {
      type: "range",
      key: "height",
      label: "Height",
      description: "Number of rows.",
      min: 1,
      max: 48,
      step: 1,
      default: 12,
    },
    {
      type: "select",
      key: "type",
      label: "Type",
      description: "Element type of `data`.",
      options: [
        { label: "u8", value: "u8" },
        { label: "i32", value: "i32" },
        { label: "f32", value: "f32" },
        { label: "f64", value: "f64" },
      ],
      default: "u8",
    },
    {
      type: "select",
      key: "channels",
      label: "Channels",
      description: "Values per pixel: 1 for gray, 3 for RGB, 4 for RGBA.",
      options: [
        { label: "1", value: 1 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "type", label: "Default type is u8", equals: "u8" },
    { key: "length", label: "16 x 12 x 1 values", equals: 192 },
    { key: "bytesPerValue", label: "One byte per value", equals: 1 },
    { key: "allZero", label: "Zero-filled", equals: true },
  ],
});
