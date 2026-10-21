import { defineExample } from "../define";
import { demo } from "./demo";
import type { ThresholdDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const thresholdExample = defineExample<ThresholdDemoOptions>({
  slug: "threshold",
  title: "threshold",
  functions: ["threshold"],
  category: "image",
  description:
    "Turns a gray image into black and white: everything brighter than a level becomes white, the rest black. The usual first step before finding shapes with `findContours`.",
  howItWorks: [
    "Each pixel above `level` becomes `max` (255), the others 0; `invert` swaps the two. Without a level, Otsu's method picks one from the histogram (see `otsuLevel`), which works well when the image has a clear dark and a clear bright part. Uneven lighting defeats a single level; blur first to keep noise from speckling the result.",
  ],
  howToTest:
    "Thresholds the shapes sample at the automatic level and checks the level falls between the dark shapes and the light background, the red rectangle (gray 76) comes out black, the background white, and every pixel is 0 or 255.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "level",
      label: "Level",
      description: "Pixels above this become white. 0 picks the level automatically (Otsu).",
      min: 0,
      max: 254,
      step: 1,
      default: 0,
    },
    {
      type: "toggle",
      key: "invert",
      label: "Invert",
      description: "Make pixels above the level black instead.",
      default: false,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "level", label: "Between the shapes and the background", min: 77, max: 213 },
    { key: "redRectangle", label: "Dark shape is black", equals: 0 },
    { key: "background", label: "Background is white", equals: 255 },
    { key: "binary", label: "Only 0 and 255", equals: true },
  ],
});
