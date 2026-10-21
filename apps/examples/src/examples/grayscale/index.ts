import { defineExample } from "../define";
import { demo } from "./demo";
import type { GrayscaleDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const grayscaleExample = defineExample<GrayscaleDemoOptions>({
  slug: "grayscale",
  title: "grayscale",
  functions: ["grayscale"],
  category: "image",
  description:
    "Converts colour pixels to one 8-bit gray channel, the input almost every other image function expects.",
  howItWorks: [
    "Each pixel becomes `0.299 R + 0.587 G + 0.114 B` (the BT.601 luma weights: green looks brightest to us, blue darkest), computed in fixed point as `(R·4899 + G·9617 + B·1868 + 8192) >> 14`.",
    "The channel order tells it where R, G and B sit: canvas `ImageData` is RGBA; some cameras and decoders give BGR(A). Picking the wrong order swaps the red and blue weights.",
  ],
  howToTest:
    "Converts the shapes sample and checks one pixel inside the pure red rectangle: `(255·4899 + 8192) >> 14 = 76`. With the BGRA order the same pixel would read as blue and give 29.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "order",
      label: "Channel order",
      description: "Layout of the input pixels.",
      options: [
        { label: "RGBA (canvas)", value: "rgba" },
        { label: "BGRA", value: "bgra" },
      ],
      default: "rgba",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "channels", label: "One channel", equals: 1 },
    { key: "grayOfRed", label: "Pure red becomes 76", equals: 76 },
    { key: "meanGray", label: "Average brightness", min: 150, max: 210 },
  ],
});
