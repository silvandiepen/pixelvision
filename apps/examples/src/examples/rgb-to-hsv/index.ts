import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const rgbToHsvExample = defineExample<Record<string, never>>({
  slug: "rgb-to-hsv",
  title: "rgbToHsv",
  functions: ["rgbToHsv"],
  category: "image",
  description:
    'Converts colour pixels to hue, saturation and value. Hue names the colour whatever its brightness, so picking "green" works in shade and in sun.',
  howItWorks: [
    "Value is the largest of R, G and B; saturation is how far the smallest is below it (0 for any gray). Hue is the angle round the colour wheel: red at 0°, green at 120°, blue at 240°. As in OpenCV's 8-bit conversion, hue is stored halved, 0–179, so it fits a byte, and the same integer tables are used, so results match OpenCV exactly.",
    "Pass `ImageData` (RGBA) or a 3- or 4-channel matrix in RGB order. Pair it with `inRange` to select a colour.",
  ],
  howToTest:
    "Samples the flat colours of the shapes sample. Pure red (255, 0, 0) must be hue 0 and saturation 255. Green (34, 197, 94) lies at 60 x (2 + 60/163) = 142° on the wheel, stored as 71. Blue (37, 99, 235) lies at 60 x (4 − 62/198) = 221°, stored as 111. The gray background has no saturation.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "redHue", label: "Red at 0°", equals: 0 },
    { key: "redSaturation", label: "Fully saturated", equals: 255 },
    { key: "greenHue", label: "Green at 142° = 71", equals: 71 },
    { key: "blueHue", label: "Blue at 221° = 111", equals: 111 },
    { key: "backgroundSaturation", label: "Gray has no saturation", equals: 0 },
  ],
});
