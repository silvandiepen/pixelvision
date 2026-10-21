import { defineExample } from "../define";
import { demo } from "./demo";
import type { ProjectPointsDemoOptions } from "./demo.model";
import code from "./demo.ts?raw";

export const projectPointsExample = defineExample<ProjectPointsDemoOptions>({
  slug: "project-points",
  title: "projectPoints",
  functions: ["projectPoints"],
  category: "motion",
  description:
    "Projects 3D points into a camera image with the pinhole model: where a corner of a box, a marker or a model appears on screen. Use it to draw over a pose from `solvePnP`.",
  howItWorks: [
    "Each point is rotated by `rvec` and moved by `tvec` into camera coordinates, then divided by its depth: `x / z`, `y / z`. Optional radial distortion scales that by `1 + k1 r² + k2 r⁴`. Multiplying by the focal lengths and adding the principal point from the camera matrix gives pixels.",
    "The camera matrix is `[fx, 0, cx, 0, fy, cy, 0, 0, 1]`, row by row, as in OpenCV. Results agree with OpenCV's `projectPoints` within 1e-9 pixels.",
  ],
  howToTest:
    "A cube of side 2 around the origin, 5 units in front of a camera with focal length 800 and centre (320, 240). Its front face is at depth 4, so its corners are 800 · 1 / 4 = 200 pixels from the centre: the top left at (120, 40) and the face 400 pixels wide. The back face is at depth 6: 800 · 2 / 6 = 266.667 pixels wide.",
  input: "none",
  controls: [
    {
      type: "range",
      key: "yaw",
      label: "Turn",
      description: "Rotation about the vertical axis, in degrees.",
      min: -90,
      max: 90,
      step: 1,
      default: 0,
    },
    {
      type: "range",
      key: "distance",
      label: "Distance",
      description: "How far the cube's centre is in front of the camera.",
      min: 3,
      max: 15,
      step: 0.5,
      default: 5,
    },
    {
      type: "range",
      key: "k1",
      label: "Distortion k1",
      description: "Radial distortion; negative values give barrel distortion.",
      min: -0.5,
      max: 0.5,
      step: 0.05,
      default: 0,
    },
  ],
  code,
  demo,
  expectations: [
    { key: "frontTopLeft", label: "Front top-left at (120, 40)", equals: "120,40" },
    { key: "frontWidth", label: "Front face 800 · 2 / 4 = 400 px", equals: 400 },
    { key: "backWidth", label: "Back face 800 · 2 / 6 px", equals: 266.666667 },
  ],
});
