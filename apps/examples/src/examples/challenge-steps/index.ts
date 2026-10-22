import { defineExample } from "../define";
import { demo } from "./demo";
import type { ChallengeStepsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const challengeStepsExample = defineExample<ChallengeStepsDemoOptions>({
  slug: "challenge-steps",
  title: "challengeSteps",
  functions: ["challengeSteps"],
  category: "detection",
  description:
    "Turns a face challenge preset into its steps, and checks a list of steps of your own before you run it.",
  howItWorks: [
    "Each preset of [`createFaceChallenge`](/create-face-challenge) is a list of steps: `head-turn` is `frontal, side, other-side, frontal`, `head-circle` is `frontal, left, up, right, down, frontal`, `motion` is `frontal, move`, and `none` is empty. `CHALLENGE_PRESETS` holds them all.",
    "Given your own list, `challengeSteps` returns it when every step is known, and throws a `RangeError` naming the first unknown one, so a typo in a configuration fails before the camera starts.",
  ],
  howToTest:
    "Checks that the head circle has six steps, and that a custom list with an unknown step is rejected with a message naming it.",
  input: "none",
  controls: [
    {
      type: "select",
      key: "custom",
      label: "Your steps",
      description: "A list of steps to check.",
      options: [
        { label: "frontal, left, right", value: "frontal,left,right" },
        { label: "frontal, up, down, move", value: "frontal,up,down,move" },
        { label: "frontal, spin (unknown step)", value: "frontal,spin" },
      ],
      default: "frontal,spin",
    },
  ],
  code,
  demo,
  expectations: [
    { key: "headCircle", label: "The head circle has six steps", equals: 6 },
    { key: "custom", label: "An unknown step is named", equals: 'Unknown challenge step "spin"' },
  ],
});
