import { projectPoints, solvePnP } from "pixelvision";
import type { Point, Point3, Vec3 } from "pixelvision";
import type { DemoOutput, OptionsInput, Segment } from "../example.model";
import { round } from "../../utils/format";
import { blankImage } from "../../utils/visualize";
import { seededRandom } from "../../samples/random";
import type { SolvePnPDemoOptions } from "./demo.model";

/** A 640 x 480 camera: focal length 800 px, principal point in the middle. */
const CAMERA = [800, 0, 320, 0, 800, 240, 0, 0, 1];

/** A flat 20 cm square marker, corners in metres. */
const MARKER: Point3[] = [
  { x: -0.1, y: -0.1, z: 0 },
  { x: 0.1, y: -0.1, z: 0 },
  { x: 0.1, y: 0.1, z: 0 },
  { x: -0.1, y: 0.1, z: 0 },
];

/** The corners of a 20 cm cube. */
const CUBE: Point3[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
  x: i & 1 ? 0.1 : -0.1,
  y: i & 2 ? 0.1 : -0.1,
  z: i & 4 ? 0.1 : -0.1,
}));

/**
 * Photographs a marker or cube with a known pose, then recovers the pose
 * from the photo alone.
 *
 * @param input - Object, turn in degrees, distance in metres and pixel noise.
 * @returns The image points with the recovered axes drawn on them, and the pose.
 */
export function demo({ options }: OptionsInput<SolvePnPDemoOptions>): DemoOutput {
  const object = options.object === "cube" ? CUBE : MARKER;
  // The true pose: turned about the vertical axis, straight ahead.
  const rvec: Vec3 = [0, (options.yaw * Math.PI) / 180, 0];
  const tvec: Vec3 = [0, 0, options.distance];
  const random = seededRandom(1);
  const seen: Point[] = projectPoints(object, rvec, tvec, CAMERA).map((p) => ({
    x: p.x + (random() * 2 - 1) * options.noise,
    y: p.y + (random() * 2 - 1) * options.noise,
  }));

  const pose = solvePnP(object, seen, CAMERA);

  // Draw the recovered axes, 10 cm long, from the object's origin.
  const [origin, xEnd, yEnd, zEnd] = projectPoints(
    [
      { x: 0, y: 0, z: 0 },
      { x: 0.1, y: 0, z: 0 },
      { x: 0, y: 0.1, z: 0 },
      { x: 0, y: 0, z: 0.1 },
    ],
    pose.rvec,
    pose.tvec,
    CAMERA,
  );
  const axes: Segment[] = [xEnd, yEnd, zEnd].map((to) => ({ from: origin, to }));
  const angle = (Math.hypot(...pose.rvec) * 180) / Math.PI;

  return {
    images: [
      {
        label: "Seen corners and the recovered axes",
        image: blankImage(640, 480),
        overlay: { points: seen, lines: axes },
      },
    ],
    tables: [
      {
        label: "Pose",
        columns: ["", "x", "y", "z"],
        rows: [
          ["rvec (rad)", ...pose.rvec.map((v) => round(v, 9))],
          ["tvec (m)", ...pose.tvec.map((v) => round(v, 9))],
        ],
      },
    ],
    values: {
      angleDegrees: round(angle, 6),
      axis: pose.rvec.map((v) => round(v / Math.hypot(...pose.rvec), 6)).join(","),
      distance: round(pose.tvec[2], 6),
      sideways: round(Math.hypot(pose.tvec[0], pose.tvec[1]), 6),
      reprojectionError: pose.error,
    },
  };
}
