import { defineExample } from "../define";
import { PRESETS, demo } from "./demo";
import type { LiveEffectsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const liveEffectsExample = defineExample<LiveEffectsDemoOptions>({
  slug: "live-effects",
  title: "Live camera effects",
  functions: [
    "gaussianBlur",
    "medianBlur",
    "filter2D",
    "canny",
    "threshold",
    "adaptiveThreshold",
    "clahe",
    "dilate",
    "erode",
    "flip",
  ],
  category: "pipeline",
  description:
    "Stack effects on the live camera picture, tune each one, and take a photo. Every effect is one or two pixelvision calls.",
  howItWorks: [
    "Each camera frame goes through the stack from top to bottom: the output of one effect is the input of the next, so the order matters. Edges and then Thicken gives bold outlines; Thicken and then Edges outlines the bold shapes.",
    "Effects that work on brightness only (Edges, Black and white, Scanned page, Local contrast, Thicken, Thin, Emboss) turn the picture gray first; the others keep the colour. Settings change the next frame straight away.",
    "Take a photo runs the full-size frame through the same stack, so the photo is sharper than the preview, and offers it as a PNG.",
  ],
  howToTest:
    "Runs the Pencil sketch preset (Edges, Thicken, Negative) on the desk sample and checks that the result has the sample's size and that a small share of it is dark lines: the outlines, not the wood grain. In the browsers, a test adds an effect from the palette, changes its setting, and takes a photo.",
  input: "image",
  sample: "desk",
  live: "live-effects",
  controls: [
    {
      type: "select",
      key: "preset",
      label: "Start from",
      description: "A ready-made stack.",
      options: PRESETS.map((preset) => ({ label: preset.label, value: preset.id })),
      default: "sketch",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "sameSize", label: "Same size as the input", equals: true },
    { key: "inkShare", label: "Lines, not wood grain", min: 0.02, max: 0.25 },
  ],
});
