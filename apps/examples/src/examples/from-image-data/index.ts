import { defineExample } from "../define";
import { demo } from "./demo";
import type { FromImageDataDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const fromImageDataExample = defineExample<FromImageDataDemoOptions>({
  slug: "from-image-data",
  title: "fromImageData",
  functions: ["fromImageData"],
  category: "core",
  description:
    "Turns canvas pixels (`ImageData`, a decoded PNG, anything RGBA) into a 4-channel `u8` matrix you can pass to any function.",
  howItWorks: [
    "`ImageData` stores RGBA bytes row by row, which is exactly a 4-channel `u8` matrix. The pixels are copied into a new `Uint8Array`, so drawing on the canvas afterwards doesn't change the matrix.",
    "Most functions also accept `ImageData` directly; use this when you need a real matrix, e.g. to warp a colour image.",
  ],
  howToTest:
    "Converts the sample and checks that the matrix is 4-channel `u8`, that every one of its bytes equals the input's, and that it doesn't share the input's buffer.",
  input: "image",
  sample: "card-photo",
  controls: [
    {
      type: "range",
      key: "x",
      label: "Pixel x",
      description: "Column of the pixel to read back.",
      min: 0,
      max: 639,
      step: 1,
      default: 160,
    },
    {
      type: "range",
      key: "y",
      label: "Pixel y",
      description: "Row of the pixel to read back.",
      min: 0,
      max: 479,
      step: 1,
      default: 40,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "type", label: "8-bit", equals: "u8" },
    { key: "channels", label: "RGBA", equals: 4 },
    { key: "differences", label: "Every byte copied exactly", equals: 0 },
    { key: "copied", label: "Doesn't share the input's buffer", equals: true },
  ],
});
