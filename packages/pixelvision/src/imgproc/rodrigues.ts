import { svd } from "../math/linalg";
import { createMatrix } from "../core/matrix";
import type { Vec3 } from "./rodrigues.model";

/**
 * Rotation matrix of a rotation vector.
 *
 * @param vector - Axis times angle in radians.
 * @returns 3x3 matrix, row by row.
 */
const toMatrix = ([x, y, z]: Vec3): Float64Array => {
  const theta = Math.hypot(x, y, z);
  if (theta < Number.EPSILON) return Float64Array.of(1, 0, 0, 0, 1, 0, 0, 0, 1);
  const kx = x / theta;
  const ky = y / theta;
  const kz = z / theta;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  // 1 − cos θ, without cancellation for small angles.
  const c1 = 2 * Math.sin(theta / 2) ** 2;
  return Float64Array.of(
    c + c1 * kx * kx,
    c1 * kx * ky - s * kz,
    c1 * kx * kz + s * ky,
    c1 * ky * kx + s * kz,
    c + c1 * ky * ky,
    c1 * ky * kz - s * kx,
    c1 * kz * kx - s * ky,
    c1 * kz * ky + s * kx,
    c + c1 * kz * kz,
  );
};

/**
 * Rotation vector of a rotation matrix, after making the matrix exactly
 * orthonormal.
 *
 * @param matrix - 3x3 matrix, row by row.
 * @returns Axis times angle in radians.
 */
const toVector = (matrix: Float64Array): Vec3 => {
  // The nearest rotation: U · Vᵀ.
  const a = createMatrix(3, 3, { type: "f64" });
  a.data.set(matrix);
  const { u, v } = svd(a);
  const R = new Float64Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += u.data[i * 3 + k] * v.data[j * 3 + k];
      R[i * 3 + j] = sum;
    }
  }
  const rx = R[7] - R[5];
  const ry = R[2] - R[6];
  const rz = R[3] - R[1];
  const s = Math.sqrt((rx * rx + ry * ry + rz * rz) * 0.25);
  const c = Math.min(Math.max((R[0] + R[4] + R[8] - 1) * 0.5, -1), 1);
  if (c > 0 || s >= 1e-5) {
    // θ = atan2(sin θ, cos θ) keeps full precision at small angles too.
    const scale = s > 0 ? Math.atan2(s, c) / (2 * s) : 0.5;
    return [rx * scale, ry * scale, rz * scale];
  }
  // Close to a half turn: the axis comes from the diagonal.
  let x = Math.sqrt(Math.max((R[0] + 1) * 0.5, 0));
  const y = Math.sqrt(Math.max((R[4] + 1) * 0.5, 0)) * (R[1] < 0 ? -1 : 1);
  let z = Math.sqrt(Math.max((R[8] + 1) * 0.5, 0)) * (R[2] < 0 ? -1 : 1);
  if (Math.abs(x) < Math.abs(y) && Math.abs(x) < Math.abs(z) && R[5] > 0 !== y * z > 0) z = -z;
  const theta = Math.atan2(s, c) / Math.hypot(x, y, z);
  x *= theta;
  return [x, y * theta, z * theta];
};

/**
 * Converts a rotation vector to a 3x3 rotation matrix.
 *
 * @param vector - Axis times angle in radians.
 * @returns The rotation matrix, row by row.
 */
export function rodrigues(vector: Vec3): Float64Array;
/**
 * Converts a 3x3 rotation matrix to a rotation vector.
 *
 * @param matrix - The rotation matrix, row by row.
 * @returns Axis times angle in radians.
 */
export function rodrigues(matrix: Float64Array): Vec3;
/**
 * Converts between a rotation vector and a 3x3 rotation matrix, in either
 * direction, as OpenCV's `Rodrigues`. A rotation vector points along the
 * rotation axis and its length is the angle in radians (right-handed: a
 * positive angle about z turns x towards y). It is how {@link solvePnP}
 * returns a rotation and {@link projectPoints} takes one.
 *
 * A matrix that isn't exactly a rotation is first replaced by the nearest
 * one. Rotations of any size round-trip: the angle comes from
 * `atan2(sin θ, cos θ)`, so rotations under 1e-5 radians keep their value
 * (OpenCV's `Rodrigues` returns zero for them).
 *
 * @param value - A rotation vector `[x, y, z]`, or a `Float64Array` of 9 values: a matrix row by row.
 * @returns The rotation matrix for a vector; the rotation vector for a matrix.
 * @throws {RangeError} When a vector doesn't have 3 values or a matrix doesn't have 9.
 *
 * @example
 * const quarterTurn = rodrigues([0, 0, Math.PI / 2]);
 * // [0, -1, 0, 1, 0, 0, 0, 0, 1] (up to rounding)
 * rodrigues(quarterTurn); // [0, 0, 1.5708]
 */
export function rodrigues(value: readonly number[] | Float64Array): Float64Array | Vec3 {
  if (value instanceof Float64Array) {
    if (value.length !== 9) {
      throw new RangeError(`rodrigues: a matrix needs 9 values, got ${value.length}`);
    }
    return toVector(value);
  }
  if (value.length !== 3) {
    throw new RangeError(`rodrigues: a vector needs 3 values, got ${value.length}`);
  }
  return toMatrix([value[0], value[1], value[2]]);
}
