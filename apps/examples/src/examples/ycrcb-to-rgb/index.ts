import { defineExample } from "../define";
import { demo } from "./demo";
import type { YCrCbToRgbDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const yCrCbToRgbExample = defineExample<YCrCbToRgbDemoOptions>({
  slug: "ycrcb-to-rgb",
  title: "yCrCbToRgb",
  functions: ["yCrCbToRgb", "rgbToYCrCb"],
  category: "image",
  description:
    "Converts YCrCb pixels back to RGB. Work on the luma alone (equalise it, sharpen it) or on the colour difference alone, then convert back.",
  howItWorks: [
    "R = Y + 1.403 (Cr − 128), G = Y − 0.344 (Cb − 128) − 0.714 (Cr − 128), B = Y + 1.773 (Cb − 128), each clipped to 0–255.",
    "The weights are OpenCV's 14-bit fixed-point ones, so results are identical to OpenCV's `COLOR_YCrCb2RGB`. Input is a 3-channel matrix of Y, Cr and Cb.",
  ],
  howToTest:
    "Converts the palette sample and back at 100 % colour. Red (220, 38, 38) is (92, 219, 98): R = 92 + (91 · 22987 + 8192) >> 14 = 92 + 128 = 220, G = 92 + (−30 · −5636 + 91 · −11698 + 8192) >> 14 = 92 − 55 = 37, B = 92 + (−30 · 29049 + 8192) >> 14 = 92 − 53 = 39: (220, 37, 39), off by one in G and B from rounding Cr and Cb to bytes. Gray comes back exactly. With Cr = Cb = 128 only the luma is left, so red becomes the gray (92, 92, 92).",
  input: "image",
  sample: "palette",
  controls: [
    {
      type: "range",
      key: "saturation",
      label: "Colour",
      description: "Scales Cr and Cb round 128: 0 % is gray, 100 % unchanged.",
      min: 0,
      max: 200,
      step: 5,
      default: 100,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "redBack", label: "Red comes back as (220, 37, 39)", equals: "220,37,39" },
    { key: "grayBack", label: "Gray comes back exactly", equals: "128,128,128" },
    { key: "redAdjusted", label: "100 % is the plain round trip", equals: "220,37,39" },
    { key: "redLumaOnly", label: "Luma alone: red is gray 92", equals: "92,92,92" },
  ],
});
