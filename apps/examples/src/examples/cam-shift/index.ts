import { defineExample } from "../define";
import { demo } from "./demo";
import type { CamShiftDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const camShiftExample = defineExample<CamShiftDemoOptions>({
  slug: "cam-shift",
  title: "camShift",
  functions: ["camShift"],
  category: "tracking",
  description:
    "Tracks an object on a probability image and measures it: a rotated box with its size and orientation, and a window that grows, shrinks and turns with the object for the next frame.",
  howItWorks: [
    "It runs `meanShift` to find the object, widens the window by 10 pixels on each side, and computes the probability's centroid and second moments there. The long axis becomes the box's `height` and the short axis its `width`, each four standard deviations, which for a uniform ellipse is exactly its full axis. `angle` is the direction of `width`, from 0 to 180°.",
    "The returned window fits the box, so pass it in again for the next frame. Windows are identical to OpenCV's `CamShift` and the box agrees with it to single precision, except that the centre is the centroid rather than the centre of the whole-pixel window, which OpenCV reports.",
  ],
  howToTest:
    "An ellipse with half-axes 60 and 25 around (160, 120), its long axis tilted 30°, starting from a small window off its centre. After 10 frames the box must be the ellipse: a uniform ellipse has variance a²/4 along each axis, so four standard deviations are 2 · 60 = 120 and 2 · 25 = 50 (± 0.5 for the pixel grid); `width` runs across the long axis, at 30 + 90 = 120°; and the ellipse is symmetric about (160, 120), so that is exactly its centroid.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "angle",
      label: "Tilt",
      description: "Direction of the ellipse's long axis, in degrees.",
      min: 0,
      max: 179,
      step: 1,
      default: 30,
    },
    {
      type: "range",
      key: "frames",
      label: "Frames",
      description: "How many times camShift runs, each from the last window.",
      min: 1,
      max: 15,
      step: 1,
      default: 10,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "centre", label: "Centred on (160, 120)", equals: "160,120" },
    { key: "longAxis", label: "Long axis 2 · 60 = 120", min: 119.5, max: 120.5 },
    { key: "shortAxis", label: "Short axis 2 · 25 = 50", min: 49.5, max: 50.5 },
    { key: "angle", label: "Width across the long axis: 120°", min: 119.5, max: 120.5 },
  ],
});
