import type { Point } from "../math/transforms.model";
import type {
  CameraMatrix,
  Intrinsics,
  Point3,
  ProjectPointsOptions,
  RadialDistortion,
} from "./projectPoints.model";
import { rodrigues } from "./rodrigues";
import type { Vec3 } from "./rodrigues.model";

/**
 * Reads and checks a camera matrix and optional distortion.
 *
 * @param fn - Name of the calling function, for the error message.
 * @param camera - 3x3 matrix, row by row.
 * @param distortion - Radial distortion, if any.
 * @returns The intrinsics.
 * @throws {RangeError} When the matrix doesn't have 9 values or a focal length is zero or not finite.
 */
export const readIntrinsics = (
  fn: string,
  camera: CameraMatrix,
  distortion: RadialDistortion | undefined,
): Intrinsics => {
  if (camera.length !== 9) {
    throw new RangeError(`${fn}: the camera matrix needs 9 values, got ${camera.length}`);
  }
  const intrinsics = {
    fx: camera[0],
    fy: camera[4],
    cx: camera[2],
    cy: camera[5],
    k1: distortion?.k1 ?? 0,
    k2: distortion?.k2 ?? 0,
  };
  if (
    !Object.values(intrinsics).every(Number.isFinite) ||
    intrinsics.fx === 0 ||
    intrinsics.fy === 0
  ) {
    throw new RangeError(`${fn}: focal lengths must be non-zero and every value finite`);
  }
  return intrinsics;
};

/**
 * Projects one point that is already in camera coordinates.
 *
 * @param intrinsics - Camera.
 * @param X - Camera-space x.
 * @param Y - Camera-space y.
 * @param Z - Camera-space z (depth).
 * @param jacobian - When given, receives `[∂u/∂X, ∂u/∂Y, ∂u/∂Z, ∂v/∂X, ∂v/∂Y, ∂v/∂Z]`.
 * @returns Pixel position.
 */
export const projectCameraPoint = (
  { fx, fy, cx, cy, k1, k2 }: Intrinsics,
  X: number,
  Y: number,
  Z: number,
  jacobian?: Float64Array,
): Point => {
  const iz = 1 / Z;
  const x = X * iz;
  const y = Y * iz;
  const r2 = x * x + y * y;
  const d = 1 + k1 * r2 + k2 * r2 * r2;
  if (jacobian) {
    // ∂d/∂x = 2x (k1 + 2 k2 r²), likewise for y.
    const dd = 2 * (k1 + 2 * k2 * r2);
    const xdx = d + x * x * dd;
    const xdy = x * y * dd;
    const ydy = d + y * y * dd;
    // ∂x/∂(X, Y, Z) = (1/Z, 0, −x/Z), ∂y/∂(X, Y, Z) = (0, 1/Z, −y/Z).
    jacobian[0] = fx * xdx * iz;
    jacobian[1] = fx * xdy * iz;
    jacobian[2] = -fx * (xdx * x + xdy * y) * iz;
    jacobian[3] = fy * xdy * iz;
    jacobian[4] = fy * ydy * iz;
    jacobian[5] = -fy * (xdy * x + ydy * y) * iz;
  }
  return { x: fx * x * d + cx, y: fy * y * d + cy };
};

/**
 * Projects 3D points into a camera image, as OpenCV's `projectPoints`: each
 * point is rotated and translated into camera coordinates
 * (`R · point + tvec`), divided by its depth, optionally distorted, then
 * scaled by the focal lengths and shifted by the principal point.
 *
 * Use it to draw a 3D model over a pose found by {@link solvePnP}, or to
 * check that pose by its reprojection error. Points at or behind the
 * camera (depth ≤ 0) give meaningless positions.
 *
 * @param objectPoints - Points in the scene's own coordinates.
 * @param rvec - Rotation vector from scene to camera (see {@link rodrigues}).
 * @param tvec - Translation from scene to camera.
 * @param cameraMatrix - Intrinsic matrix, 9 values row by row.
 * @param options - Radial distortion.
 * @returns Pixel positions, one per point.
 * @throws {RangeError} When the camera matrix doesn't have 9 values, a focal length is zero, or a value isn't finite.
 *
 * @example
 * const camera = [800, 0, 320, 0, 800, 240, 0, 0, 1];
 * const [corner] = projectPoints([{ x: 1, y: 0, z: 0 }], [0, 0, 0], [0, 0, 5], camera);
 * // { x: 480, y: 240 }: 1 unit right at depth 5 is 800 / 5 = 160 px right of centre
 */
export function projectPoints(
  objectPoints: readonly Point3[],
  rvec: Vec3,
  tvec: Vec3,
  cameraMatrix: CameraMatrix,
  options: ProjectPointsOptions = {},
): Point[] {
  const intrinsics = readIntrinsics("projectPoints", cameraMatrix, options.distortion);
  const R = rodrigues(rvec);
  return objectPoints.map(({ x, y, z }) =>
    projectCameraPoint(
      intrinsics,
      R[0] * x + R[1] * y + R[2] * z + tvec[0],
      R[3] * x + R[4] * y + R[5] * z + tvec[1],
      R[6] * x + R[7] * y + R[8] * z + tvec[2],
    ),
  );
}
