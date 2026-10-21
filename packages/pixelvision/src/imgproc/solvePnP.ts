import { assertInteger } from "../core/assert";
import { createMatrix } from "../core/matrix";
import { eigenSymmetric, luSolve, svd } from "../math/linalg";
import type { Point } from "../math/transforms.model";
import { projectCameraPoint, readIntrinsics } from "./projectPoints";
import type { CameraMatrix, Intrinsics, Point3 } from "./projectPoints.model";
import { rodrigues } from "./rodrigues";
import type { Vec3 } from "./rodrigues.model";
import type { PnPResult, Pose, SolvePnPOptions } from "./solvePnP.model";

/**
 * Multiplies two 3x3 matrices stored row by row.
 *
 * @param a - Left matrix.
 * @param b - Right matrix.
 * @returns `a · b`.
 */
const mul3 = (a: ArrayLike<number>, b: ArrayLike<number>): Float64Array => {
  const out = new Float64Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    }
  }
  return out;
};

/**
 * The cross-product matrix `[v]×`, so that `[v]× · w = v × w`.
 *
 * @param x - First component.
 * @param y - Second component.
 * @param z - Third component.
 * @returns 3x3 matrix, row by row.
 */
const skew = (x: number, y: number, z: number): Float64Array =>
  Float64Array.of(0, -z, y, z, 0, -x, -y, x, 0);

/**
 * The nearest rotation matrix (`U · Vᵀ` of the SVD) and the mean singular
 * value, i.e. the scale of `m` if it's a scaled rotation.
 *
 * @param m - 3x3 matrix, row by row.
 * @returns The rotation and the scale.
 */
const nearestRotation = (m: ArrayLike<number>): { rotation: Float64Array; scale: number } => {
  const a = createMatrix(3, 3, { type: "f64" });
  a.data.set(Array.from({ length: 9 }, (_, i) => m[i]));
  const { u, v, values } = svd(a);
  const rotation = new Float64Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) rotation[i * 3 + j] += u.data[i * 3 + k] * v.data[j * 3 + k];
    }
  }
  return { rotation, scale: (values[0] + values[1] + values[2]) / 3 };
};

/**
 * The unit vector `x` minimising `|A · x|`: the right singular vector of the
 * smallest singular value.
 *
 * @param rows - `A`, row by row.
 * @param columns - Number of columns.
 * @returns The vector.
 */
const nullVector = (rows: number[], columns: number): Float64Array => {
  const a = createMatrix(columns, rows.length / columns, { type: "f64" });
  a.data.set(rows);
  const { v } = svd(a);
  return Float64Array.from({ length: columns }, (_, i) => v.data[i * columns + columns - 1]);
};

/**
 * Centroid and the scale that brings the mean distance from it to `√2`, for
 * conditioning a direct linear transform.
 *
 * @param points - 2D points.
 * @returns Centre and scale.
 */
const normaliser = (points: readonly Point[]): { x: number; y: number; scale: number } => {
  const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const spread = points.reduce((sum, p) => sum + Math.hypot(p.x - x, p.y - y), 0) / points.length;
  return { x, y, scale: Math.SQRT2 / spread };
};

/**
 * Removes radial distortion from a point on the normalised image plane, by
 * fixed-point iteration.
 *
 * @param intrinsics - Camera.
 * @param point - Pixel position.
 * @returns The undistorted point at depth 1.
 */
const normalise = ({ fx, fy, cx, cy, k1, k2 }: Intrinsics, point: Point): Point => {
  const xd = (point.x - cx) / fx;
  const yd = (point.y - cy) / fy;
  let x = xd;
  let y = yd;
  for (let i = 0; i < 20; i++) {
    const r2 = x * x + y * y;
    const d = 1 + k1 * r2 + k2 * r2 * r2;
    x = xd / d;
    y = yd / d;
  }
  return { x, y };
};

/**
 * Initial pose of a planar scene, from the homography between the plane
 * and the normalised image.
 *
 * @param objects - Scene points.
 * @param image - Undistorted image points at depth 1.
 * @param centre - Centroid of the scene points.
 * @param axes - Two in-plane unit axes and the normal, as rows of a rotation.
 * @returns The pose.
 */
const planarPose = (
  objects: readonly Point3[],
  image: readonly Point[],
  centre: Point3,
  axes: Float64Array,
): Pose => {
  const plane = objects.map(({ x, y, z }) => ({
    x: axes[0] * (x - centre.x) + axes[1] * (y - centre.y) + axes[2] * (z - centre.z),
    y: axes[3] * (x - centre.x) + axes[4] * (y - centre.y) + axes[5] * (z - centre.z),
  }));
  const p = normaliser(plane);
  const m = normaliser(image);
  const rows: number[] = [];
  plane.forEach((q, i) => {
    const qx = (q.x - p.x) * p.scale;
    const qy = (q.y - p.y) * p.scale;
    const u = (image[i].x - m.x) * m.scale;
    const v = (image[i].y - m.y) * m.scale;
    rows.push(qx, qy, 1, 0, 0, 0, -u * qx, -u * qy, -u);
    rows.push(0, 0, 0, qx, qy, 1, -v * qx, -v * qy, -v);
  });
  // H = Tm⁻¹ · H̃ · Tp, mapping plane coordinates to the normalised image.
  const toImage = Float64Array.of(1 / m.scale, 0, m.x, 0, 1 / m.scale, m.y, 0, 0, 1);
  const fromPlane = Float64Array.of(
    p.scale,
    0,
    -p.scale * p.x,
    0,
    p.scale,
    -p.scale * p.y,
    0,
    0,
    1,
  );
  const H = mul3(mul3(toImage, nullVector(rows, 9)), fromPlane);
  // Columns: r1 · s, r2 · s, t · s, up to the null vector's arbitrary
  // sign; choose the one that puts the plane's centre in front (t_z > 0).
  const sign = Math.sign(H[8]);
  const n1 = Math.hypot(H[0], H[3], H[6]);
  const n2 = Math.hypot(H[1], H[4], H[7]);
  const r1 = [H[0], H[3], H[6]].map((v) => (sign * v) / n1);
  const r2 = [H[1], H[4], H[7]].map((v) => (sign * v) / n2);
  const r3 = [
    r1[1] * r2[2] - r1[2] * r2[1],
    r1[2] * r2[0] - r1[0] * r2[2],
    r1[0] * r2[1] - r1[1] * r2[0],
  ];
  const scale = (2 * sign) / (n1 + n2);
  const t = [H[2] * scale, H[5] * scale, H[8] * scale];
  const { rotation } = nearestRotation([
    r1[0],
    r2[0],
    r3[0],
    r1[1],
    r2[1],
    r3[1],
    r1[2],
    r2[2],
    r3[2],
  ]);
  // Scene → plane → camera: R = R' · axes, t = t' − R · centre.
  const R = mul3(rotation, axes);
  return {
    rvec: rodrigues(R),
    tvec: [
      t[0] - (R[0] * centre.x + R[1] * centre.y + R[2] * centre.z),
      t[1] - (R[3] * centre.x + R[4] * centre.y + R[5] * centre.z),
      t[2] - (R[6] * centre.x + R[7] * centre.y + R[8] * centre.z),
    ],
  };
};

/**
 * Initial pose of a non-planar scene, from the 3x4 projection matrix found
 * by a direct linear transform.
 *
 * @param objects - Scene points (at least 6).
 * @param image - Undistorted image points at depth 1.
 * @param centre - Centroid of the scene points.
 * @returns The pose.
 */
const generalPose = (objects: readonly Point3[], image: readonly Point[], centre: Point3): Pose => {
  const spread =
    objects.reduce(
      (sum, o) => sum + Math.hypot(o.x - centre.x, o.y - centre.y, o.z - centre.z),
      0,
    ) / objects.length;
  const s = Math.sqrt(3) / spread;
  const rows: number[] = [];
  objects.forEach((o, i) => {
    const X = (o.x - centre.x) * s;
    const Y = (o.y - centre.y) * s;
    const Z = (o.z - centre.z) * s;
    const { x: u, y: v } = image[i];
    rows.push(X, Y, Z, 1, 0, 0, 0, 0, -u * X, -u * Y, -u * Z, -u);
    rows.push(0, 0, 0, 0, X, Y, Z, 1, -v * X, -v * Y, -v * Z, -v);
  });
  const P = nullVector(rows, 12);
  // Undo the normalisation: M = P[:, :3] · s, p4 = P[:, 3] − M · centre.
  // The null vector's sign is arbitrary; choose the one where M is a
  // positive multiple of a rotation (det > 0).
  const raw = [P[0], P[1], P[2], P[4], P[5], P[6], P[8], P[9], P[10]];
  const det =
    raw[0] * (raw[4] * raw[8] - raw[5] * raw[7]) -
    raw[1] * (raw[3] * raw[8] - raw[5] * raw[6]) +
    raw[2] * (raw[3] * raw[7] - raw[4] * raw[6]);
  const sign = Math.sign(det);
  const M = raw.map((v) => v * s * sign);
  const p4 = [0, 1, 2].map(
    (r) =>
      P[r * 4 + 3] * sign -
      (M[r * 3] * centre.x + M[r * 3 + 1] * centre.y + M[r * 3 + 2] * centre.z),
  );
  const { rotation, scale } = nearestRotation(M);
  return { rvec: rodrigues(rotation), tvec: [p4[0] / scale, p4[1] / scale, p4[2] / scale] };
};

/**
 * Derivatives of the rotation matrix with respect to each component of the
 * rotation vector (Gallego and Yezzi's formula).
 *
 * @param v - Rotation vector.
 * @param R - Its rotation matrix.
 * @returns Three 3x3 matrices, row by row.
 */
const rotationDerivatives = (v: Vec3, R: Float64Array): Float64Array[] => {
  const theta2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  if (theta2 < 1e-16) return [skew(1, 0, 0), skew(0, 1, 0), skew(0, 0, 1)];
  const vx = skew(v[0], v[1], v[2]);
  return [0, 1, 2].map((i) => {
    // (I − R) e_i, then v × that.
    const w = [0, 1, 2].map((r) => (r === i ? 1 : 0) - R[r * 3 + i]);
    const c = skew(v[1] * w[2] - v[2] * w[1], v[2] * w[0] - v[0] * w[2], v[0] * w[1] - v[1] * w[0]);
    const sum = vx.map((value, k) => (v[i] * value + c[k]) / theta2);
    return mul3(sum, R);
  });
};

/**
 * Finds the pose of a camera from points whose positions are known both in
 * the scene and in the image (the Perspective-n-Point problem), as OpenCV's
 * `solvePnP` with `SOLVEPNP_ITERATIVE`.
 *
 * Without a `guess`, it first estimates the pose directly: from the
 * homography between plane and image when the points lie in one plane (a
 * marker, a card, a chessboard), otherwise from the projection matrix of a
 * direct linear transform. It then refines that pose with Levenberg–Marquardt
 * to minimise the squared reprojection error in pixels. On exact data the
 * pose is recovered to within rounding and the reprojection error is far
 * below a millionth of a pixel.
 *
 * Planar scenes need at least 4 points and other scenes at least 6, no
 * three of them on one line; with a `guess`, 3 points are enough.
 *
 * @param objectPoints - Points in the scene's own coordinates, e.g. a marker's corners.
 * @param imagePoints - Where each of those points appears in the image, in pixels.
 * @param cameraMatrix - Intrinsic matrix, 9 values row by row.
 * @param options - Lens distortion, a starting pose and the iteration limit.
 * @returns The rotation and translation from scene to camera, the RMS reprojection error in pixels and the iterations run.
 * @throws {RangeError} When the point lists differ in length, there are too few points, the points lie on one line, the camera matrix is invalid, or `maxIterations` isn't a whole number of 0 or more.
 *
 * @example
 * // A 10 cm square marker, corners in metres, and where they were seen.
 * const marker = [
 *   { x: 0, y: 0, z: 0 },
 *   { x: 0.1, y: 0, z: 0 },
 *   { x: 0.1, y: 0.1, z: 0 },
 *   { x: 0, y: 0.1, z: 0 },
 * ];
 * const { rvec, tvec, error } = solvePnP(marker, corners, [800, 0, 320, 0, 800, 240, 0, 0, 1]);
 * // tvec[2]: the marker's distance from the camera, in metres
 */
export function solvePnP(
  objectPoints: readonly Point3[],
  imagePoints: readonly Point[],
  cameraMatrix: CameraMatrix,
  options: SolvePnPOptions = {},
): PnPResult {
  const intrinsics = readIntrinsics("solvePnP", cameraMatrix, options.distortion);
  const { guess, maxIterations = 20 } = options;
  assertInteger("solvePnP", "maxIterations", maxIterations, 0);
  const n = objectPoints.length;
  if (imagePoints.length !== n) {
    throw new RangeError(`solvePnP: ${n} object points but ${imagePoints.length} image points`);
  }
  if (n < (guess ? 3 : 4)) {
    throw new RangeError(`solvePnP needs at least ${guess ? 3 : 4} points, got ${n}`);
  }

  let pose: Pose;
  if (guess) {
    pose = { rvec: [...guess.rvec], tvec: [...guess.tvec] };
  } else {
    const centre = {
      x: objectPoints.reduce((sum, p) => sum + p.x, 0) / n,
      y: objectPoints.reduce((sum, p) => sum + p.y, 0) / n,
      z: objectPoints.reduce((sum, p) => sum + p.z, 0) / n,
    };
    const covariance = createMatrix(3, 3, { type: "f64" });
    for (const p of objectPoints) {
      const d = [p.x - centre.x, p.y - centre.y, p.z - centre.z];
      for (let i = 0; i < 9; i++) covariance.data[i] += d[Math.floor(i / 3)] * d[i % 3];
    }
    const { values, vectors } = eigenSymmetric(covariance);
    if (!(values[1] > 1e-12 * values[0])) {
      throw new RangeError("solvePnP: the object points lie on one line");
    }
    const image = imagePoints.map((p) => normalise(intrinsics, p));
    if (values[2] / values[1] < 1e-3) {
      const e = vectors.data;
      const axes = Float64Array.of(
        e[0],
        e[1],
        e[2],
        e[3],
        e[4],
        e[5],
        e[1] * e[5] - e[2] * e[4],
        e[2] * e[3] - e[0] * e[5],
        e[0] * e[4] - e[1] * e[3],
      );
      pose = planarPose(objectPoints, image, centre, axes);
    } else if (n >= 6) {
      pose = generalPose(objectPoints, image, centre);
    } else {
      throw new RangeError(
        `solvePnP needs 6 points when they aren't in one plane, or a guess; got ${n}`,
      );
    }
  }

  // Levenberg–Marquardt on the six pose parameters.
  const residuals = new Float64Array(2 * n);
  const jacobian = new Float64Array(2 * n * 6);
  const pointJacobian = new Float64Array(6);
  /**
   * Reprojection residuals (and optionally their Jacobian) of a pose.
   *
   * @param p - `[rvec, tvec]`.
   * @param withJacobian - Fill `jacobian` too.
   * @returns Sum of squared residuals.
   */
  const evaluate = (p: Float64Array, withJacobian: boolean): number => {
    const rvec: Vec3 = [p[0], p[1], p[2]];
    const R = rodrigues(rvec);
    const dR = withJacobian ? rotationDerivatives(rvec, R) : [];
    let cost = 0;
    objectPoints.forEach(({ x, y, z }, i) => {
      const projected = projectCameraPoint(
        intrinsics,
        R[0] * x + R[1] * y + R[2] * z + p[3],
        R[3] * x + R[4] * y + R[5] * z + p[4],
        R[6] * x + R[7] * y + R[8] * z + p[5],
        withJacobian ? pointJacobian : undefined,
      );
      const ex = projected.x - imagePoints[i].x;
      const ey = projected.y - imagePoints[i].y;
      residuals[2 * i] = ex;
      residuals[2 * i + 1] = ey;
      cost += ex * ex + ey * ey;
      if (!withJacobian) return;
      const row = 12 * i;
      for (let k = 0; k < 3; k++) {
        const d = dR[k];
        const dx = d[0] * x + d[1] * y + d[2] * z;
        const dy = d[3] * x + d[4] * y + d[5] * z;
        const dz = d[6] * x + d[7] * y + d[8] * z;
        jacobian[row + k] = pointJacobian[0] * dx + pointJacobian[1] * dy + pointJacobian[2] * dz;
        jacobian[row + 6 + k] =
          pointJacobian[3] * dx + pointJacobian[4] * dy + pointJacobian[5] * dz;
        jacobian[row + 3 + k] = pointJacobian[k];
        jacobian[row + 9 + k] = pointJacobian[3 + k];
      }
    });
    return cost;
  };

  let params = Float64Array.of(...pose.rvec, ...pose.tvec);
  let cost = evaluate(params, true);
  let lambda = 1e-3;
  let iterations = 0;
  const normal = createMatrix(6, 6, { type: "f64" });
  const gradient = new Float64Array(6);
  while (iterations < maxIterations && cost > 0) {
    iterations++;
    // Normal equations Jᵀ J and −Jᵀ r.
    for (let a = 0; a < 6; a++) {
      let g = 0;
      for (let r = 0; r < 2 * n; r++) g -= jacobian[r * 6 + a] * residuals[r];
      gradient[a] = g;
      for (let b = 0; b < 6; b++) {
        let sum = 0;
        for (let r = 0; r < 2 * n; r++) sum += jacobian[r * 6 + a] * jacobian[r * 6 + b];
        normal.data[a * 6 + b] = sum;
      }
    }
    const diagonal = [0, 1, 2, 3, 4, 5].map((a) => normal.data[a * 7]);
    let improved = false;
    let stepSize = 0;
    while (!improved && lambda <= 1e12) {
      for (let a = 0; a < 6; a++) normal.data[a * 7] = diagonal[a] * (1 + lambda) + lambda * 1e-9;
      const delta = luSolve(normal, gradient);
      const trial = params.map((value, i) => value + delta[i]);
      const trialCost = evaluate(trial, false);
      if (trialCost < cost) {
        params = trial;
        cost = trialCost;
        lambda = Math.max(lambda / 10, 1e-12);
        stepSize = Math.hypot(...delta);
        improved = true;
      } else {
        lambda *= 10;
      }
    }
    // Stop when no step lowers the error any more, or the step is negligible.
    if (!improved || stepSize <= 1e-12 * Math.hypot(...params)) break;
    evaluate(params, true);
  }

  return {
    rvec: [params[0], params[1], params[2]],
    tvec: [params[3], params[4], params[5]],
    error: Math.sqrt(cost / n),
    iterations,
  };
}
