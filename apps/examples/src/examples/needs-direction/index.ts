import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const needsDirectionExample = defineExample({
  slug: "needs-direction",
  title: "needsDirection",
  functions: ["needsDirection"],
  category: "detection",
  description:
    "Tells whether a face challenge needs a detector that can tell left from right and up from down.",
  howItWorks: [
    "`detectHeadPose` (HAAR) reports `frontal`, `profile` and `mirrored-profile`: it can't say which side is the person's left, and it can't see a tilt. A challenge with `left`, `right`, `up` or `down` needs `createHeadPoseTracker` from `@pixelvision/face-neural` instead. `side` and `other-side` work with either.",
    "Check it when you build the pose source, so a challenge that can't pass doesn't start: load the neural detector, or pick another challenge.",
  ],
  howToTest: "Checks that the head turn works with HAAR and the head circle doesn't.",
  input: "none",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "headTurn", label: "The head turn works with HAAR", equals: false },
    { key: "headCircle", label: "The head circle needs directions", equals: true },
  ],
});
