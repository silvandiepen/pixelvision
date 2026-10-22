import { defineExample } from "../define";
import { demo } from "./demo";
import type { CreateFaceChallengeDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const createFaceChallengeExample = defineExample<CreateFaceChallengeDemoOptions>({
  slug: "create-face-challenge",
  title: "createFaceChallenge",
  functions: ["createFaceChallenge", "challengeSteps", "needsDirection"],
  category: "detection",
  description:
    "Asks the person in front of the camera to do something (turn their head, move it in a circle, or just be there and move naturally) and follows each frame to see that they did.",
  howItWorks: [
    "`createFaceChallenge` takes a preset (`head-turn`, `head-circle`, `motion`, `none`) or your own list of steps: `frontal`, `left`, `right`, `up`, `down`, `side`, `other-side` and `move`. Feed it the pose of every frame. A step completes once `holdFrames` of the recent frames with a face match it, so a stray detection slows a step instead of resetting it; frames without a face count neither way.",
    "`side` accepts either side and remembers it, so `other-side` asks for the opposite one: that works with `detectHeadPose`, which can't tell left from right. `left`, `right`, `up` and `down` need a source that can, such as `createHeadPoseTracker` from `@pixelvision/face-neural`; `needsDirection` tells you when that's the case. `move` needs a `motion` measure with each frame (see [`measureMotion`](/measure-motion)), and stops a frozen picture.",
    "Done in the browser, a challenge proves nothing to a server: a recording or a changed page can pass it. Use it to guide the person and to stop a still photo; for a check a server can rely on, see the [security levels](/guide/security). The [head-turn page](/head-turn) runs it live, on your camera or a sample video.",
  ],
  howToTest:
    "Plays a person who does each step of the chosen challenge as asked, with a missed face and a stray pose before every step, and checks that the challenge finishes with every step done. It also checks which presets need a directional source.",
  input: "none",
  controls: [
    {
      type: "select",
      key: "preset",
      label: "Challenge",
      description: "Which steps to ask for.",
      options: [
        { label: "Head turn", value: "head-turn" },
        { label: "Head circle", value: "head-circle" },
        { label: "Motion", value: "motion" },
      ],
      default: "head-circle",
    },
    {
      type: "range",
      key: "holdFrames",
      label: "Frames to hold",
      description: "How many matching frames, out of the recent ones with a face, a step needs.",
      min: 1,
      max: 6,
      step: 1,
      default: 3,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "step", label: "Every step done", equals: "done" },
    { key: "progress", label: "Six of six", equals: 6 },
    { key: "needsDirection", label: "The head circle needs directions", equals: true },
  ],
});
