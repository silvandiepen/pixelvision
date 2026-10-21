import { defineExample } from "../define";
import { demo } from "./demo";
import type { ToImageDataDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const toImageDataExample = defineExample<ToImageDataDemoOptions>({
  slug: "to-image-data",
  title: "toImageData",
  functions: ["toImageData"],
  category: "core",
  description:
    "Converts an 8-bit matrix back to RGBA pixels that a canvas can draw with `putImageData`.",
  howItWorks: [
    "Gray (1 channel) is copied into R, G and B; 3 channels are read as RGB; 4 channels are copied as they are. Alpha is 255 unless the matrix has its own. The result uses a `Uint8ClampedArray`, as `ImageData` requires.",
  ],
  howToTest:
    "Converts the gray version of the sample and checks that the result has width x height x 4 values, that R, G and B equal the gray value and alpha is 255 at every pixel, and that the data is a `Uint8ClampedArray`.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "channels",
      label: "Convert from",
      description: "Channel count of the matrix that is converted.",
      options: [
        { label: "1 channel (gray)", value: 1 },
        { label: "3 channels (RGB)", value: 3 },
        { label: "4 channels (RGBA)", value: 4 },
      ],
      default: 1,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "length", label: "320 x 240 x 4 values", equals: 307200 },
    { key: "mismatches", label: "Every channel as expected", equals: 0 },
    { key: "isClamped", label: "Uint8ClampedArray", equals: true },
  ],
});
