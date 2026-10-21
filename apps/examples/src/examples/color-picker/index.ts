import { defineExample } from "../define";
import { demo } from "./demo";
import type { ColorPickerDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const colorPickerExample = defineExample<ColorPickerDemoOptions>({
  slug: "color-picker",
  title: "Pick a colour",
  functions: ["rgbToHsv", "inRange", "connectedComponents"],
  category: "pipeline",
  description:
    "Finds the biggest patch of a colour, in light or shade: a coloured marker to follow, a sticker to locate, a ball to track. Try it with the camera and something brightly coloured.",
  howItWorks: [
    "`rgbToHsv` separates the colour (hue) from its brightness (value) and strength (saturation), so one hue range covers a colour in the sun and in the shade.",
    "`inRange` keeps the pixels within the colour's hue range with enough saturation (grays have none) and some brightness. Red sits at both ends of the hue circle, so it takes two ranges, joined.",
    "`connectedComponents` splits the mask into patches; the largest is the object.",
  ],
  howToTest:
    "Picks green in the palette sample: the green swatch (34, 197, 94) is the only one with a hue in 35–85, so the largest patch must be exactly that 80 x 80 swatch at (80, 80), 6,400 pixels.",
  input: "image",
  sample: "palette",
  controls: [
    {
      type: "select",
      key: "color",
      label: "Colour",
      description: "The colour to look for.",
      options: [
        { label: "Red", value: "red" },
        { label: "Yellow", value: "yellow" },
        { label: "Green", value: "green" },
        { label: "Blue", value: "blue" },
        { label: "Purple", value: "purple" },
      ],
      default: "green",
    },
    {
      type: "range",
      key: "minSaturation",
      label: "Least saturation",
      description: "Raise it to ignore pale and grayish pixels.",
      min: 0,
      max: 255,
      step: 1,
      default: 100,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "found", label: "Found", equals: true },
    { key: "box", label: "The green swatch", equals: "80,80,80,80" },
    { key: "area", label: "80 x 80 pixels", equals: 6400 },
  ],
});
