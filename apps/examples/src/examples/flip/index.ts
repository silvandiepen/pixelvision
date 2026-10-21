import { defineExample } from "../define";
import { demo } from "./demo";
import type { FlipDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const flipExample = defineExample<FlipDemoOptions>({
  slug: "flip",
  title: "flip",
  functions: ["flip"],
  category: "image",
  description:
    "Mirrors an image left to right or top to bottom, for example to show a front camera like a mirror.",
  howItWorks: [
    "Horizontally, pixel `(x, y)` moves to `(width - 1 - x, y)`; vertically to `(x, height - 1 - y)`. All channels of a pixel move together, so it works on gray, RGB and RGBA, and on any type. Pass `out` to reuse a matrix frame after frame.",
  ],
  howToTest:
    "Flips the shapes sample horizontally and checks that pixel (10, 20) is now at (309, 20) with the same RGBA values, and that flipping twice gives back the original exactly.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "direction",
      label: "Direction",
      description: "Left–right or top–bottom.",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
      default: "horizontal",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "pixelMoved", label: "Pixel at the mirrored position", equals: true },
    { key: "twiceIsOriginal", label: "Flipping twice changes nothing", equals: true },
  ],
});
