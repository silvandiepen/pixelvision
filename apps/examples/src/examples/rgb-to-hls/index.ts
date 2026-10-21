import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const rgbToHlsExample = defineExample<Record<string, never>>({
  slug: "rgb-to-hls",
  title: "rgbToHls",
  functions: ["rgbToHls"],
  category: "image",
  description:
    "Converts colour pixels to hue, lightness and saturation. Lightness runs from black through the pure colour to white, so lightening or darkening a colour is a change of one number.",
  howItWorks: [
    "Lightness is the midpoint of the brightest and darkest of R, G and B: 0 is black, 255 white, and every fully saturated colour sits at 128. Saturation is their spread relative to how far lightness is from black or white. Hue is the angle round the colour wheel, stored halved (0–179) as in OpenCV's 8-bit conversion.",
    "The arithmetic follows OpenCV's `COLOR_RGB2HLS` in single precision, so results are identical to OpenCV's. Pass `ImageData` (RGBA) or a 3- or 4-channel matrix in RGB order; `hlsToRgb` converts back.",
  ],
  howToTest:
    "Reads the flat swatches of the palette sample. Red (220, 38, 38): lightness (220 + 38) / 2 = 129, saturation 182 / (510 − 258) · 255 = 184, hue 0. Green (34, 197, 94) lies at 120° + 60° · 60 / 163 = 142°, stored as 71. Blue (37, 99, 235): hue 240° − 60° · 62 / 198 = 221° → 111, lightness (235 + 37) / 2 = 136, saturation 198 / (510 − 272) · 255 = 212. The gray swatch (128, 128, 128) has lightness 128 and no saturation.",
  input: "image",
  sample: "palette",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "redHue", label: "Red at 0°", equals: 0 },
    { key: "redLightness", label: "Red lightness (220 + 38) / 2", equals: 129 },
    { key: "redSaturation", label: "Red saturation 182 / 252 · 255", equals: 184 },
    { key: "greenHue", label: "Green at 142° = 71", equals: 71 },
    { key: "blueHue", label: "Blue at 221° = 111", equals: 111 },
    { key: "blueLightness", label: "Blue lightness (235 + 37) / 2", equals: 136 },
    { key: "blueSaturation", label: "Blue saturation 198 / 238 · 255", equals: 212 },
    { key: "grayLightness", label: "Gray lightness 128", equals: 128 },
    { key: "graySaturation", label: "Gray has no saturation", equals: 0 },
  ],
});
