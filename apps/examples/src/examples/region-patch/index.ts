import { defineExample } from "../define";
import { demo } from "./demo";
import type { RegionPatchDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const regionPatchExample = defineExample<RegionPatchDemoOptions>({
  slug: "region-patch",
  title: "regionPatch",
  functions: ["regionPatch", "measureMotion"],
  category: "detection",
  description:
    "Measures how much a face region changed between two frames, so a challenge can tell a live face from a frozen picture.",
  howItWorks: [
    "`regionPatch` shrinks a region of a gray frame (the face box from a detector) to a small grid of mean gray levels, 16 x 16 by default. Averaging makes it calm: sensor noise mostly cancels out, while a head that moves, blinks or breathes changes the cells.",
    "`measureMotion` compares the patches of two frames: the mean absolute difference of their cells, from 0 to 1. A frozen frame, a still image or a paused video gives exactly 0; a live face gives a little even when the person tries to keep still. Pass it as `motion` with each frame to `createFaceChallenge`, whose `move` step counts frames above `minMotion` (0.004, about one gray level).",
    "It stops a frozen picture, not a photo held up and moved by hand: that changes the patch too.",
  ],
  howToTest:
    "Takes the face region of the portrait sample, then the same region in the same frame (a frozen picture) and in a copy moved a few pixels (a head that moved). The frozen one must measure exactly 0, the moved one above the `move` step's threshold.",
  input: "image",
  sample: "face-photo",
  webcam: false,
  controls: [
    {
      type: "range",
      key: "shift",
      label: "Head moves",
      description: "Pixels the head moves between the two frames.",
      min: 0,
      max: 12,
      step: 1,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "frozen", label: "A frozen frame doesn't move", equals: 0 },
    { key: "moved", label: "A moving head counts as motion", min: 0.004, max: 0.2 },
  ],
});
