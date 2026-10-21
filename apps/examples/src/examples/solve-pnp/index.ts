import { defineExample } from "../define";
import { demo } from "./demo";
import type { SolvePnPDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const solvePnPExample = defineExample<SolvePnPDemoOptions>({
  slug: "solve-pnp",
  title: "solvePnP",
  functions: ["solvePnP", "projectPoints"],
  category: "motion",
  description:
    "Finds where a camera is relative to an object from a few points whose 3D positions are known: the corners of a marker, a card or a box. The result is the rotation and translation from the object to the camera.",
  howItWorks: [
    "Without a starting guess it first estimates the pose directly: from the homography between plane and image when the points are coplanar (4 or more), otherwise from a 3x4 projection matrix (6 or more points). Levenberg–Marquardt then refines the six pose numbers until the projected points land on the seen ones.",
    "The rotation comes back as a rotation vector (see `rodrigues`), the translation in the units of the object points. `error` is the root-mean-square distance in pixels between the seen points and the reprojected ones. Poses agree with OpenCV's `solvePnP` (iterative) within 1e-7.",
  ],
  howToTest:
    "Projects a 20 cm square marker turned 30° about the vertical axis, 1 m in front of a camera with focal length 800, with no noise. The pose must come back exactly: an angle of 30° about the y axis (0, 1, 0), 1 m straight ahead, and a reprojection error far below a millionth of a pixel.",
  input: "none",
  controls: [
    {
      type: "select",
      key: "object",
      label: "Object",
      description: "Four coplanar marker corners, or the eight corners of a cube.",
      options: [
        { label: "Marker (planar)", value: "marker" },
        { label: "Cube", value: "cube" },
      ],
      default: "marker",
    },
    {
      type: "range",
      key: "yaw",
      label: "Turn",
      description: "The true rotation about the vertical axis, in degrees.",
      min: -60,
      max: 60,
      step: 1,
      default: 30,
    },
    {
      type: "range",
      key: "distance",
      label: "Distance",
      description: "The true distance in metres.",
      min: 0.4,
      max: 3,
      step: 0.1,
      default: 1,
    },
    {
      type: "range",
      key: "noise",
      label: "Noise",
      description: "Random error added to each seen point, in pixels.",
      min: 0,
      max: 5,
      step: 0.5,
      default: 0,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "angleDegrees", label: "Turned 30°", equals: 30 },
    { key: "axis", label: "About the y axis", equals: "0,1,0" },
    { key: "distance", label: "1 m away", equals: 1 },
    { key: "sideways", label: "Straight ahead", equals: 0 },
    { key: "reprojectionError", label: "Reprojection error under 1e-6 px", max: 1e-6 },
  ],
});
