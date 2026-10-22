import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const measureMotionExample = defineExample({
  slug: "measure-motion",
  title: "measureMotion",
  functions: ["measureMotion"],
  category: "detection",
  description:
    "How much a face region changed between two frames, from 0 to 1: exactly 0 for a frozen picture.",
  howItWorks: [
    "Give it two patches from [`regionPatch`](/region-patch): the face region of the previous frame and of this one. It returns the mean absolute difference of their cells, divided by 255.",
    "A frozen frame, a still image or a paused video gives exactly 0. A live face gives a little even when the person tries to keep still, from breathing, blinking and sensor noise; the `move` step of [`createFaceChallenge`](/create-face-challenge) counts frames above 0.004, about one gray level. It returns `undefined` without two patches of the same size, such as on the first frame.",
  ],
  howToTest:
    "Checks that the same patch twice gives exactly 0, and a patch one gray level brighter about 0.004.",
  input: "none",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "frozen", label: "A frozen frame gives 0", equals: 0 },
    { key: "slight", label: "One gray level is about 0.004", min: 0.0035, max: 0.0045 },
  ],
});
