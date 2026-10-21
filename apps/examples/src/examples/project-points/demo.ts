import { projectPoints } from "pixelvision";
import type { Point3, Vec3 } from "pixelvision";
import type { DemoOutput, OptionsInput, Segment } from "../example.model";
import { round } from "../../utils/format";
import { blankImage } from "../../utils/visualize";
import type { ProjectPointsDemoOptions } from "./demo.model";

/** A 640 x 480 camera: focal length 800 px, principal point in the middle. */
const CAMERA = [800, 0, 320, 0, 800, 240, 0, 0, 1];

/** A cube of side 2 around the origin; corner i has x, y, z from bits 0, 1, 2. */
const CUBE: Point3[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
  x: i & 1 ? 1 : -1,
  y: i & 2 ? 1 : -1,
  z: i & 4 ? 1 : -1,
}));

/** Corner pairs that share an edge: they differ in exactly one bit. */
const EDGES = CUBE.flatMap((_, a) =>
  [1, 2, 4].filter((bit) => !(a & bit)).map((bit) => [a, a | bit] as const),
);

/**
 * Projects a cube turned about the vertical axis and pushed away from the
 * camera.
 *
 * @param input - Turn in degrees, distance and lens distortion.
 * @returns The projected cube and its corners.
 */
export function demo({ options }: OptionsInput<ProjectPointsDemoOptions>): DemoOutput {
  const rvec: Vec3 = [0, (options.yaw * Math.PI) / 180, 0];
  const tvec: Vec3 = [0, 0, options.distance];
  const corners = projectPoints(CUBE, rvec, tvec, CAMERA, {
    distortion: { k1: options.k1 },
  });
  const lines: Segment[] = EDGES.map(([a, b]) => ({ from: corners[a], to: corners[b] }));
  // Corners 0 and 1: the front face (z = −1), top edge; 4 and 5: the back face.
  const front = corners[1].x - corners[0].x;
  const back = corners[5].x - corners[4].x;

  return {
    images: [
      { label: "Projected cube", image: blankImage(640, 480), overlay: { lines, points: corners } },
    ],
    tables: [
      {
        label: "Corners",
        columns: ["x", "y", "z", "u (px)", "v (px)"],
        rows: CUBE.map((p, i) => [p.x, p.y, p.z, round(corners[i].x, 3), round(corners[i].y, 3)]),
      },
    ],
    values: {
      frontTopLeft: `${round(corners[0].x, 6)},${round(corners[0].y, 6)}`,
      frontWidth: round(front, 6),
      backWidth: round(back, 6),
    },
  };
}
