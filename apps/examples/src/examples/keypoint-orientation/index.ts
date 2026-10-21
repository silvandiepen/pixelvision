import { defineExample } from "../define";
import { demo } from "./demo";
import type { KeypointOrientationDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const keypointOrientationExample = defineExample<KeypointOrientationDemoOptions>({
  slug: "keypoint-orientation",
  title: "keypointOrientation",
  functions: ["keypointOrientation"],
  category: "features",
  description:
    "Gives a keypoint a direction: the way its surroundings lean. Descriptors measured along that direction stay the same when the image rotates, which is what makes ORB rotation-invariant.",
  howItWorks: [
    "It takes the disc of radius 15 around the keypoint and computes its intensity centroid: the brightness-weighted average position of the pixels. The angle of the vector from the keypoint to that centroid is the orientation, in radians, measured clockwise from the x axis (y points down).",
    "When the image turns by some angle, the disc's contents turn with it, and so does the centroid. Pixels outside the image are skipped.",
  ],
  howToTest:
    "Measures the orientation at the centre of the desk sample, rotates the image 40° around that point with `warpAffine`, and checks that the measured orientation turned by 40° too, within 3°.",
  input: "image",
  sample: "desk",
  controls: [
    {
      type: "range",
      key: "rotation",
      label: "Rotation (°)",
      description: "How far to rotate the image around the centre.",
      min: -180,
      max: 180,
      step: 1,
      default: 40,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "turnedDegrees", label: "Orientation turned with the image", min: 37, max: 43 },
  ],
});
