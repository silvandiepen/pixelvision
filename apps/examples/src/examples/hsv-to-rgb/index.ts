import { defineExample } from "../define";
import { demo } from "./demo";
import type { HsvToRgbDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const hsvToRgbExample = defineExample<HsvToRgbDemoOptions>({
  slug: "hsv-to-rgb",
  title: "hsvToRgb",
  functions: ["hsvToRgb", "rgbToHsv"],
  category: "image",
  description:
    "Converts hue, saturation and value back to RGB. Recolour an image by turning its hues, or build a colour from an angle, then convert back to show it.",
  howItWorks: [
    "Value V is the brightest channel and V · (1 − S) the darkest. The hue picks which channel is which, and the middle one is blended between them by the hue's position in its sixth of the wheel.",
    "The arithmetic follows OpenCV's `COLOR_HSV2RGB` in single precision, so results are identical to OpenCV's. Input is a 3-channel matrix of H (0–179, degrees halved), S and V; hues of 180 and more wrap round.",
  ],
  howToTest:
    "Turns the hues of the palette sample by 60 (120°). Red (220, 38, 38) is HSV (0, 211, 220); at hue 60 it is the start of the green sixth, so G = V = 220 and R = B = 220 · (1 − 211 / 255) = 38: (38, 220, 38). Blue (37, 99, 235) is HSV (111, 215, 235); at hue 171 (342°) R = 235, G = 235 · (1 − 215 / 255) = 37 and B = 235 · (1 − 0.843 · 0.7) = 96: (235, 37, 96), a pink. Gray has no saturation, so its hue doesn't matter.",
  input: "image",
  sample: "palette",
  controls: [
    {
      type: "range",
      key: "shift",
      label: "Hue shift",
      description: "Added to every hue, 0–179 (degrees halved).",
      min: 0,
      max: 179,
      step: 1,
      default: 60,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "red", label: "Red turns green: (38, 220, 38)", equals: "38,220,38" },
    { key: "blue", label: "Blue turns pink: (235, 37, 96)", equals: "235,37,96" },
    { key: "gray", label: "Gray stays gray", equals: "128,128,128" },
  ],
});
