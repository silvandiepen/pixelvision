import { defineExample } from "../define";
import { loadHeadPoseCascades } from "../detect-head-pose/resources";
import type { HeadPoseResources } from "../detect-head-pose/demo.model";
import { demo } from "./demo";
import type { HeadTurnDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const headTurnExample = defineExample<HeadTurnDemoOptions, HeadPoseResources>({
  slug: "head-turn",
  title: "Head-turn liveness check",
  functions: ["createHeadTurnChallenge", "detectHeadPose", "flip"],
  category: "pipeline",
  description:
    "Asks the person in front of the camera to look at it, turn their head one way, then the other, and look back. A printed photo or a still screen can't do that.",
  howItWorks: [
    "About 8 times a second, the camera frame goes to `detectHeadPose`, which reports `frontal`, `profile`, `mirrored-profile` or `none`. The preview is mirrored so it feels like a mirror, but the detector gets the frame as the camera took it.",
    "`createHeadTurnChallenge` turns those poses into four steps: face the camera, turn to one side, turn to the other side, face the camera again. A step completes once `holdFrames` of the last `2 × holdFrames` frames with a face match it, so one lucky detection doesn't move it on and one missed detection doesn't reset it; frames without a face count neither way. `holdProgress` (0–1) says how far the current step is, and fills the bar of the current step here. The instruction only changes when the step does, and a hint like \"Move a little closer\" only shows once it has held for 800 ms, so the screen stays calm. After 30 seconds without finishing, the check fails and you can try again.",
    "There are two face detectors to choose from. Built-in (HAAR) needs no download: `detectHeadPose` runs the frontal and profile cascades. The profile cascade only fires on a nearly full profile, so the person has to turn far, and which of `profile` and `mirrored-profile` is their left hasn't been checked on real faces; the challenge only needs both sides. Neural (YuNet) is the optional `@pixelvision/face-neural` package: a 230 KB model on onnxruntime-web, downloaded only when you pick it. It finds the eyes, nose and mouth, so `estimateHeadYaw` measures the turn in degrees and `headPoseFromFace` reports `turned-left` or `turned-right` from about 18°, from the person's point of view. That makes the instructions directional.",
    "This is an active liveness signal, not certified liveness. It stops printed photos and still screens, but a video replay or a deepfake could follow the steps. For identity checks (KYC), send the capture to a certified liveness service; we use ID R&D on the server.",
  ],
  howToTest:
    "Face photos aren't in the repository yet, so the tests drive the challenge with a scripted sequence of poses (including a stray frame without a face) and check that it finishes all four steps. In the browsers, they also play the scripted run on the page and check that the page explains itself when the camera isn't available.",
  input: "none",
  live: "head-turn",
  resources: loadHeadPoseCascades,
  controls: [
    {
      type: "range",
      key: "holdFrames",
      label: "Frames to hold",
      description: "How many matching frames, out of the recent ones with a face, a step needs.",
      min: 1,
      max: 8,
      step: 1,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "step", label: "All steps completed", equals: "done" },
    { key: "progress", label: "Four of four", equals: 4 },
    { key: "firstSide", label: "Remembers the first side", equals: "profile" },
  ],
});
