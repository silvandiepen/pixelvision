import { defineExample } from "../define";
import { demo } from "./demo";
import type { ConnectedComponentsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const connectedComponentsExample = defineExample<ConnectedComponentsDemoOptions>({
  slug: "connected-components",
  title: "connectedComponents",
  functions: ["connectedComponents"],
  category: "shape",
  description:
    "Gives every separate blob in a black-and-white mask its own number, with its box, pixel count and centre: counting objects, dropping specks, or finding the biggest region.",
  howItWorks: [
    "It scans the mask row by row, gives each new foreground pixel its neighbour's label or a new one, and records which labels touch so they can be merged in a second pass (union-find). The labels and their order match OpenCV's `connectedComponentsWithStats`: 1 is the region met first, 0 is the background.",
    "With 8-connectivity (the default) pixels touching only at a corner belong together; with 4, only those sharing an edge do. Areas count pixels, so they're exact, unlike a traced outline's area.",
  ],
  howToTest:
    "Labels the four shapes of the shapes sample. The red rectangle, drawn as 96 x 72 whole pixels, must be region 1 with exactly 6,912 pixels and its centre at (71.5, 59.5), the middle of columns 24–119 and rows 24–95. The dark square is 68 x 68 = 4,624 pixels, give or take its jagged turned edges.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "select",
      key: "connectivity",
      label: "Connectivity",
      description: "8: pixels touching at a corner connect. 4: only pixels sharing an edge.",
      options: [
        { label: "8", value: 8 },
        { label: "4", value: 4 },
      ],
      default: 8,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "count", label: "Four shapes", equals: 4 },
    { key: "rectangleArea", label: "96 x 72 pixels", equals: 6912 },
    { key: "rectangleCentre", label: "Centre (71.5, 59.5)", equals: "71.5,59.5" },
    { key: "squareArea", label: "About 68 x 68", min: 4500, max: 4750 },
  ],
});
