import { defineExample } from "../define";
import { demo } from "./demo";
import type { HlsToRgbDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const hlsToRgbExample = defineExample<HlsToRgbDemoOptions>({
  slug: "hls-to-rgb",
  title: "hlsToRgb",
  functions: ["hlsToRgb", "rgbToHls"],
  category: "image",
  description:
    "Converts hue, lightness and saturation back to RGB. Edit colours in HLS, where lightening keeps the hue, then convert back to show them.",
  howItWorks: [
    "From lightness L and saturation S it finds the brightest channel value p2 (L · (1 + S) below half lightness, L + S − L · S above) and the darkest p1 = 2L − p2. The hue picks which channel gets which, and the middle channel is blended between them by the hue's position in its sixth of the wheel.",
    "The arithmetic follows OpenCV's `COLOR_HLS2RGB` in single precision, so results are identical to OpenCV's. Input is a 3-channel matrix of H (0–179), L and S; hues of 180 and more wrap round.",
  ],
  howToTest:
    "Lightens the palette sample by 40 levels of lightness. Gray (128, 128, 128) is HLS (0, 128, 0): without saturation every channel equals the lightness, so it comes back as 128 and, lightened, as 168. White (250) lightened clips at 255. Red (220, 38, 38) is HLS (0, 129, 184); at lightness 169, p2 = 0.663 + 0.722 − 0.663 · 0.722 = 0.906 → 231 and p1 = 2 · 0.663 − 0.906 = 0.419 → 107, so it becomes (231, 107, 107): lighter, still red.",
  input: "image",
  sample: "palette",
  controls: [
    {
      type: "range",
      key: "lighten",
      label: "Lighten",
      description: "Added to every pixel's lightness (0–255).",
      min: -100,
      max: 100,
      step: 1,
      default: 40,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "grayBack", label: "Gray comes back unchanged", equals: "128,128,128" },
    { key: "grayLighter", label: "Gray + 40 = 168", equals: "168,168,168" },
    { key: "whiteLighter", label: "White clips at 255", equals: "255,255,255" },
    { key: "redLighter", label: "Red becomes (231, 107, 107)", equals: "231,107,107" },
  ],
});
