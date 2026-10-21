import { defineExample } from "../define";
import { demo } from "./demo";
import type { LabToRgbDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const labToRgbExample = defineExample<LabToRgbDemoOptions>({
  slug: "lab-to-rgb",
  title: "labToRgb",
  functions: ["labToRgb", "rgbToLab"],
  category: "image",
  description:
    "Converts L*a*b* pixels back to RGB. Change lightness in Lab, where it is separate from colour, and convert back to see the result.",
  howItWorks: [
    "L* gives Y through the inverse of Lab's cube-root curve; a* and b* give X and Z relative to it. XYZ is mixed back to linear RGB with the D65 white point, and the sRGB gamma is reapplied. Colours outside what sRGB can show are clipped.",
    "This is OpenCV's bit-exact fixed-point `COLOR_Lab2RGB`, so results are identical to OpenCV's. Input is a 3-channel matrix of L (L* · 255 / 100), a + 128 and b + 128. Storing Lab in bytes rounds a little, so a round trip can move a colour by a few levels.",
  ],
  howToTest:
    "Converts the palette sample to Lab and back: red (220, 38, 38), gray (128, 128, 128) and white (250, 250, 250) come back exactly. Then every pixel is set to L* 60 (stored 153). For the gray swatch a* = b* = 0, so it becomes the neutral gray of L* 60: Y = ((60 + 16) / 116)³ = 0.281, which sRGB encodes as 1.055 · 0.281^(1/2.4) − 0.055 = 0.567 → 144.6. Each channel must be 144 to 146.",
  input: "image",
  sample: "palette",
  controls: [
    {
      type: "range",
      key: "lightness",
      label: "Lightness L*",
      description: "Lightness given to every pixel, 0 (black) to 100 (white).",
      min: 0,
      max: 100,
      step: 1,
      default: 60,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "redBack", label: "Red round-trips", equals: "220,38,38" },
    { key: "grayBack", label: "Gray round-trips", equals: "128,128,128" },
    { key: "whiteBack", label: "White round-trips", equals: "250,250,250" },
    { key: "grayR", label: "L* 60 gray: R ≈ 144.6", min: 144, max: 146 },
    { key: "grayG", label: "L* 60 gray: G ≈ 144.6", min: 144, max: 146 },
    { key: "grayB", label: "L* 60 gray: B ≈ 144.6", min: 144, max: 146 },
  ],
});
