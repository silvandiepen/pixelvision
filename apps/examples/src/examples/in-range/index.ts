import { defineExample } from "../define";
import { demo } from "./demo";
import type { InRangeDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const inRangeExample = defineExample<InRangeDemoOptions>({
  slug: "in-range",
  title: "inRange",
  functions: ["inRange", "rgbToHsv"],
  category: "image",
  description:
    "Marks the pixels whose every channel lies between a lower and an upper bound. On HSV pixels that picks a colour: a green screen, a coloured marker, a ripe tomato.",
  howItWorks: [
    "For each pixel it checks every channel against its pair of bounds, inclusive, and writes 255 when all fit, 0 otherwise. Give one bound per channel.",
    "Bounds in RGB are hard to choose, because a colour in shade has very different numbers. Convert with `rgbToHsv` first and bound the hue (0–179), keep saturation above a minimum so grays drop out, and value above a minimum so near-black does. Red wraps round 0, so it needs two ranges, joined.",
  ],
  howToTest:
    "Selects hues 35–85 (70°–170°, the greens) with some saturation in the shapes sample. Only the green circle (hue 71) must be picked: its centre is set, the red rectangle and the gray background aren't, and the count is about the circle's area, π x 44² ≈ 6,082 pixels.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "hueFrom",
      label: "Hue from",
      description: "Lowest hue, 0–179 (degrees halved).",
      min: 0,
      max: 179,
      step: 1,
      default: 35,
    },
    {
      type: "range",
      key: "hueTo",
      label: "Hue to",
      description: "Highest hue, 0–179.",
      min: 0,
      max: 179,
      step: 1,
      default: 85,
    },
    {
      type: "range",
      key: "minSaturation",
      label: "Least saturation",
      description: "Grays have none; raise it to ignore washed-out colours.",
      min: 0,
      max: 255,
      step: 1,
      default: 80,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "circleCentre", label: "Green circle picked", equals: 255 },
    { key: "redRectangle", label: "Red left out", equals: 0 },
    { key: "background", label: "Gray left out", equals: 0 },
    { key: "selected", label: "About π x 44² pixels", min: 5900, max: 6250 },
  ],
});
