import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const rgbToYCrCbExample = defineExample<Record<string, never>>({
  slug: "rgb-to-ycrcb",
  title: "rgbToYCrCb",
  functions: ["rgbToYCrCb", "inRange"],
  category: "image",
  description:
    "Converts colour pixels to YCrCb, the luma and colour-difference space of JPEG and video. Brightness lands in Y alone, so skin and other colours keep their Cr and Cb in shade and in light.",
  howItWorks: [
    "Y is the luma, 0.299 R + 0.587 G + 0.114 B. Cr is (R − Y) · 0.713 and Cb is (B − Y) · 0.564, both centred on 128, so grays have Cr = Cb = 128.",
    "The weights are OpenCV's 14-bit fixed-point ones (4899, 9617, 1868; 11682, 9241), so results are identical to OpenCV's `COLOR_RGB2YCrCb`. Pass `ImageData` (RGBA) or a 3- or 4-channel matrix in RGB order; `yCrCbToRgb` converts back.",
  ],
  howToTest:
    "Reads the palette sample. Red (220, 38, 38): Y = (220 · 4899 + 38 · 9617 + 38 · 1868 + 8192) >> 14 = 92, Cr = 128 + (220 − 92) · 0.713 = 219, Cb = 128 + (38 − 92) · 0.564 = 98. Gray (128, 128, 128) is (128, 128, 128). The four skin swatches of the top row have Cr 150–166 and Cb 83–99, inside the skin box; yellow and purple pass Cr but not Cb, the rest fail Cr. So the mask holds exactly 4 · 80 · 80 = 25,600 pixels.",
  input: "image",
  sample: "palette",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "red", label: "Red is (92, 219, 98)", equals: "92,219,98" },
    { key: "gray", label: "Gray keeps Cr = Cb = 128", equals: "128,128,128" },
    { key: "skin", label: "Skin (224, 172, 105) is (180, 159, 86)", equals: "180,159,86" },
    { key: "skinPixels", label: "Exactly the 4 skin swatches", equals: 25600 },
  ],
});
