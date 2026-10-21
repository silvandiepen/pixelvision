import { defineExample } from "../define";
import { demo } from "./demo";
import type { TrackPointsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const trackPointsExample = defineExample<TrackPointsDemoOptions>({
  slug: "track-points",
  title: "trackPoints",
  functions: ["trackPoints"],
  category: "tracking",
  description:
    "Follows points from one video frame to the next (optical flow). Choose Webcam as the input and move: each line shows where a corner went since the previous frame.",
  howItWorks: [
    "Pyramidal Lucas-Kanade (Bouguet's method, as OpenCV's `calcOpticalFlowPyrLK`). Around each point it takes a `windowSize` window and solves for the small shift that best explains the brightness change between the frames, using the image gradients. It repeats that until the step is below `epsilon`.",
    "A shift of more than a few pixels breaks that small-motion assumption, so it starts on the smallest pyramid level, where the motion is a fraction of its size, and refines the estimate level by level. Points whose window leaves the image or has too little texture come back with `tracked: false`.",
  ],
  howToTest:
    "Without a webcam the demo tracks FAST corners of the desk sample into a copy moved 6 pixels right and 4 down, and checks that nearly all points are tracked and the median motion is (6, 4) within 0.1 pixel.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "dx",
      label: "Shift x",
      description: "How far the copy moves right (when not using the webcam).",
      min: -20,
      max: 20,
      step: 1,
      default: 6,
    },
    {
      type: "range",
      key: "dy",
      label: "Shift y",
      description: "How far the copy moves down (when not using the webcam).",
      min: -20,
      max: 20,
      step: 1,
      default: 4,
    },
    {
      type: "range",
      key: "windowSize",
      label: "Window",
      description: "Side of the search window in pixels.",
      min: 5,
      max: 41,
      step: 2,
      default: 21,
    },
    {
      type: "range",
      key: "levels",
      label: "Pyramid levels",
      description: "More levels follow larger motion.",
      min: 1,
      max: 5,
      step: 1,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "trackedShare", label: "Nearly every point tracked", min: 0.8 },
    { key: "medianDx", label: "Moved 6 px right", min: 5.9, max: 6.1 },
    { key: "medianDy", label: "Moved 4 px down", min: 3.9, max: 4.1 },
  ],
});
