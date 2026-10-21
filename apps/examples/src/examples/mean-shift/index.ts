import { defineExample } from "../define";
import { demo } from "./demo";
import type { MeanShiftDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const meanShiftExample = defineExample<MeanShiftDemoOptions>({
  slug: "mean-shift",
  title: "meanShift",
  functions: ["meanShift", "calcBackProject"],
  category: "tracking",
  description:
    "Slides a window to the densest part of a probability image, such as a back-projected colour histogram. Started from last frame's window, it follows an object from frame to frame.",
  howItWorks: [
    "It sums the probability under the window, moves the window so its centre is on the centroid, and repeats until a move is shorter than `epsilon` pixels or `maxIterations` moves were made. The window keeps its size, stays inside the image and moves in whole pixels; windows are identical to OpenCV's `meanShift`.",
    "It finds the nearest peak, not the biggest: the window has to overlap the object to be pulled towards it.",
  ],
  howToTest:
    "Back-projects the green circle's hue in the shapes sample, so only the circle (centre 220, 70) is lit, then starts a 100-pixel window at (120, 10): it covers the circle's left part and sits 10 pixels too high. Inside a window that contains the whole circle the centroid is the circle's centre, so the window stops when its centre is within half a pixel of (220, 70), give or take the rounding of whole-pixel moves: within a pixel.",
  input: "image",
  sample: "shapes",
  controls: [
    {
      type: "range",
      key: "startX",
      label: "Start x",
      description: "Left edge of the starting window.",
      min: 80,
      max: 200,
      step: 1,
      default: 120,
    },
    {
      type: "range",
      key: "size",
      label: "Window size",
      description: "Width and height of the window, in pixels.",
      min: 40,
      max: 140,
      step: 2,
      default: 100,
    },
    {
      type: "range",
      key: "maxIterations",
      label: "Max moves",
      description: "Stop after this many moves.",
      min: 1,
      max: 20,
      step: 1,
      default: 10,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "centreX", label: "Centred on x = 220 (± 1)", min: 219, max: 221 },
    { key: "centreY", label: "Centred on y = 70 (± 1)", min: 69, max: 71 },
    { key: "moved", label: "Moved about 50 px right", min: 49, max: 51 },
  ],
});
