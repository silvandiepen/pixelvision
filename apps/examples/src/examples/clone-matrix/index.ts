import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const cloneMatrixExample = defineExample<Record<string, never>>({
  slug: "clone-matrix",
  title: "cloneMatrix",
  functions: ["cloneMatrix"],
  category: "core",
  description:
    "Copies a matrix into new storage, so you can change the copy without touching the original.",
  howItWorks: [
    "It allocates a new typed array of the same type and copies the values with `TypedArray.set`. The shape and type are kept; only the first `width * height * channels` values are copied, so a larger reused buffer doesn't carry over.",
  ],
  howToTest:
    "Paints a 64 x 48 black box into the copy of the gray image and checks that exactly those 3,072 pixels differ in the copy, the original still equals a fresh grayscale of the input, and the two don't share storage.",
  input: "image",
  sample: "shapes",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "sameShape", label: "Same size, channels and type", equals: true },
    { key: "separateStorage", label: "Copy has its own data", equals: true },
    { key: "originalChanged", label: "Original untouched", equals: 0 },
    { key: "copyChanged", label: "Only the box changed in the copy", equals: 3072 },
  ],
});
