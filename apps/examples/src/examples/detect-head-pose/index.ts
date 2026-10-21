import { defineExample } from "../define";
import { demo } from "./demo";
import type { DetectHeadPoseDemoOptions, HeadPoseResources } from "./demo.model";
import code from "./demo.ts?raw";
import { loadHeadPoseCascades } from "./resources";

export const detectHeadPoseExample = defineExample<DetectHeadPoseDemoOptions, HeadPoseResources>({
  slug: "detect-head-pose",
  title: "detectHeadPose",
  functions: ["detectHeadPose"],
  category: "detection",
  description:
    "Tells from one camera frame whether a face looks at the camera, is turned to one side, or is turned to the other. Try it with the webcam.",
  howItWorks: [
    "It scales the gray frame down so its longer side is at most `maxSize` and runs three Haar cascades through `detectHaar`: the frontal face cascade, the profile cascade, and the profile cascade on a mirrored copy (`flip`), because the profile cascade only knows faces turned one way. The detection with the most support wins: `frontal`, `profile`, `mirrored-profile`, or `none`.",
    "Which of `profile` and `mirrored-profile` is the person's left depends on the cascade and on whether the camera image is mirrored, and hasn't been checked on real faces yet. Use it to tell the two sides apart, not to name them.",
    "It takes about 100 ms for a 640 x 480 frame on a desktop, so a camera loop should run it a few times a second rather than on every frame.",
  ],
  howToTest:
    "There are no face photos in the repository yet, so the automated test checks the honest part: on the desk sample it finds no face and reports `none` (no false positive). Faces are checked by hand with the webcam.",
  input: "image",
  sample: "desk",
  resources: loadHeadPoseCascades,
  controls: [
    {
      type: "range",
      key: "minFaceSize",
      label: "Smallest face",
      description: "Smallest face, as a share of the shorter image side.",
      min: 0.05,
      max: 0.8,
      step: 0.05,
      default: 0.2,
    },
    {
      type: "range",
      key: "minNeighbors",
      label: "Grouping",
      description:
        "Raw detections that must agree before a face counts. Higher means fewer false faces.",
      min: 1,
      max: 6,
      step: 1,
      default: 2,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "pose", label: "No face on the desk", equals: "none" },
    { key: "faceFound", label: "No false face box", equals: false },
  ],
});
