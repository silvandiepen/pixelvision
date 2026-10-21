import { defineExample } from "../define";
import { loadCascades } from "./cascades";
import { demo } from "./demo";
import type { Cascades, DetectHaarDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const detectHaarExample = defineExample<DetectHaarDemoOptions, Cascades>({
  slug: "detect-haar",
  title: "detectHaar",
  functions: ["detectHaar"],
  category: "detection",
  description:
    "Finds faces, eyes, profiles or upper bodies with a Viola-Jones (Haar) cascade. Choose Webcam as the input to find your own face.",
  howItWorks: [
    'A cascade is a trained list of stages. Each stage adds up a few Haar features (differences between the sums of light and dark rectangles, such as "the eye band is darker than the cheeks"), which the integral image makes cheap to compute. A window passes a stage when its score clears the stage\'s threshold; most windows fail in the first stages, which is what makes it fast.',
    "The window slides over the image at every position and at sizes growing by `scaleFactor`. Nearby hits are merged with `groupRectangles`, and groups with fewer than `minNeighbors` hits are dropped: more neighbours means more certain. Skipping flat windows (few Canny edges) speeds it up a lot on photos, but can skip a smooth, evenly lit face; it's off here because the sample face is drawn flat.",
    "The cascades are separate entry points, e.g. `pixelvision/cascades/frontal-face`, so you only load the ones you use. Each is a few hundred kilobytes.",
  ],
  howToTest:
    "Runs the frontal-face cascade on the drawn face sample and checks that exactly one face is found, centred within 8 pixels of the drawn face, with a plausible size.",
  input: "image",
  sample: "portrait",
  resources: loadCascades,
  controls: [
    {
      type: "select",
      key: "cascade",
      label: "Cascade",
      description: "What to look for.",
      options: [
        { label: "Frontal face", value: "frontalFace" },
        { label: "Profile face", value: "profileFace" },
        { label: "Eyes", value: "eye" },
        { label: "Upper body", value: "upperBody" },
      ],
      default: "frontalFace",
    },
    {
      type: "range",
      key: "scaleFactor",
      label: "Scale step",
      description:
        "How much larger each search size is than the last. Smaller finds more sizes, slower.",
      min: 1.05,
      max: 1.5,
      step: 0.05,
      default: 1.1,
    },
    {
      type: "range",
      key: "minNeighbors",
      label: "Min neighbours",
      description: "Raw hits a detection needs; 0 shows them ungrouped.",
      min: 0,
      max: 10,
      step: 1,
      default: 3,
    },
    {
      type: "toggle",
      key: "skipFlat",
      label: "Skip flat windows",
      description: "Skip windows with few edges (`edgeDensity: 0.07`). Faster on photos.",
      default: false,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "count", label: "One face", equals: 1 },
    { key: "centreOffset", label: "On the drawn face", min: 0, max: 8 },
    { key: "width", label: "About the face's size", min: 80, max: 130 },
  ],
});
