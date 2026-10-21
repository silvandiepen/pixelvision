import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const rgbToLabExample = defineExample<Record<string, never>>({
  slug: "rgb-to-lab",
  title: "rgbToLab",
  functions: ["rgbToLab"],
  category: "image",
  description:
    "Converts colour pixels to CIE L*a*b*, where distance follows perceived colour difference: compare colours, cluster them, or adjust lightness without touching hue.",
  howItWorks: [
    "Each channel is linearised (sRGB gamma removed), mixed into XYZ with the D65 white point, and passed through a cube root: L* is lightness 0–100, a* runs from green (negative) to red, b* from blue (negative) to yellow. In 8 bits L is stored as L* · 255 / 100 and a, b with 128 added.",
    "This is OpenCV's bit-exact fixed-point `COLOR_RGB2Lab`, including its own cube root, so results are identical to OpenCV's. Pass `ImageData` (RGBA) or a 3- or 4-channel matrix in RGB order; `labToRgb` converts back.",
  ],
  howToTest:
    "Reads the palette sample and checks against the textbook formula (sRGB, D65). Red (220, 38, 38) is L* 47.9, a* 67.0, b* 46.9: stored 122, 195, 175. Green (34, 197, 94) has a* −61.7: stored 66. Blue (37, 99, 235) has b* −73.8: stored 54. Gray (128, 128, 128) is L* 53.6 (stored 137) with a* = b* = 0 exactly, because each row of the RGB → XYZ weights adds up to the white point. Fixed-point rounding may move a value by one.",
  input: "image",
  sample: "palette",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "redL", label: "Red L* 47.9 → 122", min: 121, max: 123 },
    { key: "redA", label: "Red a* 67.0 → 195", min: 194, max: 196 },
    { key: "redB", label: "Red b* 46.9 → 175", min: 174, max: 176 },
    { key: "greenA", label: "Green a* −61.7 → 66", min: 65, max: 67 },
    { key: "blueB", label: "Blue b* −73.8 → 54", min: 53, max: 55 },
    { key: "grayL", label: "Gray L* 53.6 → 137", min: 136, max: 138 },
    { key: "grayA", label: "Gray a* = 0", equals: 128 },
    { key: "grayB", label: "Gray b* = 0", equals: 128 },
  ],
});
