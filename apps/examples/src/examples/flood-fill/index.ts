import { defineExample } from "../define";
import { demo } from "./demo";
import type { FloodFillDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const floodFillExample = defineExample<FloodFillDemoOptions>({
  slug: "flood-fill",
  title: "floodFill",
  functions: ["floodFill"],
  category: "image",
  description:
    "The paint bucket: fills the connected region of similar colour round a seed pixel, and reports how many pixels it filled and their bounding box.",
  howItWorks: [
    "Starting at the seed, it fills whole runs of a row at a time and checks the rows above and below for pixels that may join. A pixel joins when each channel is within `loDiff` below and `upDiff` above a reference: the neighbour it is reached from, or, with `fixedRange`, the seed itself. Without a fixed range a smooth gradient can carry the fill far from the seed's colour.",
    "It is OpenCV's scan-line `floodFill`, so the region, its area and its bounding box are identical to OpenCV's. A mask the size of the image can block pixels, and records the filled ones.",
  ],
  howToTest:
    "Fills the green circle of the shapes sample (radius 44, centre 220, 70) from its centre, within 20 levels of the seed colour. Its fully green pixels and the edge pixels that are at least 90 % green join, so the area lies between π · 43² = 5,809 and π · 44.5² = 6,221 pixels, and the box is the circle's diameter, 87 to 89 pixels, starting 44 left of and above the centre (±1).",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "tolerance",
      label: "Tolerance",
      description: "How many levels each channel may differ.",
      min: 0,
      max: 60,
      step: 1,
      default: 20,
    },
    {
      type: "toggle",
      key: "fixedRange",
      label: "Compare with the seed",
      description: "Off: compare with the neighbour instead, so gradients can carry the fill on.",
      default: true,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "area", label: "About π · 44² pixels", min: 5809, max: 6221 },
    { key: "width", label: "Diameter 88 ± 1", min: 87, max: 89 },
    { key: "height", label: "Diameter 88 ± 1", min: 87, max: 89 },
    { key: "left", label: "Starts at 220 − 44", min: 175, max: 177 },
    { key: "top", label: "Starts at 70 − 44", min: 25, max: 27 },
  ],
});
