import { identity, invert3x3, matrixFromRows, multiply } from "../math/matmath";
import { eigenSymmetric, luSolve } from "../math/linalg";
import type { Point } from "../math/transforms.model";

/** A model family RANSAC/LMEDS can fit. */
export interface MotionKernel {
  /** Points needed for one model. */
  size: number;
  /** Fits a model to the points, or returns null for a degenerate set. */
  fit: (from: readonly Point[], to: readonly Point[]) => Float64Array | null;
  /** Squared error of each point under a model. */
  error: (
    from: readonly Point[],
    to: readonly Point[],
    model: Float64Array,
    out: Float64Array,
  ) => void;
  /** Rejects samples that can't give a valid model (checked as points are drawn). */
  checkSubset: (from: readonly Point[], to: readonly Point[], count: number) => boolean;
}

/**
 * Checks whether the last of `count` points lies on a line through two
 * earlier ones.
 *
 * @param points - Points.
 * @param count - Number of points drawn so far.
 * @returns `true` when the newest point is collinear with two others.
 */
const newestIsCollinear = (points: readonly Point[], count: number): boolean => {
  const i = count - 1;
  for (let j = 0; j < i; j++) {
    const dx1 = points[j].x - points[i].x;
    const dy1 = points[j].y - points[i].y;
    for (let k = 0; k < j; k++) {
      const dx2 = points[k].x - points[i].x;
      const dy2 = points[k].y - points[i].y;
      const scale = Math.abs(dx1) + Math.abs(dy1) + Math.abs(dx2) + Math.abs(dy2);
      if (Math.abs(dx2 * dy1 - dy2 * dx1) <= Number.EPSILON * 64 * scale) return true;
    }
  }
  return false;
};

/**
 * Builds the 3x3 matrix that moves points' centroid to the origin and
 * scales their mean distance to √2 (Hartley's normalisation).
 *
 * @param points - Points.
 * @returns The normalising matrix.
 */
const isoNormalisation = (points: readonly Point[]): Float64Array => {
  const n = points.length;
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= n;
  cy /= n;
  let d = 0;
  for (const p of points) d += Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
  const s = Math.SQRT2 / (d / n);
  return Float64Array.of(s, 0, -cx * s, 0, s, -cy * s, 0, 0, 1);
};

/**
 * Computes `a · b · c` for 3x3 matrices given as 9 numbers.
 *
 * @param a - Left matrix.
 * @param b - Middle matrix.
 * @param c - Right matrix.
 * @returns The product.
 */
const chain = (a: ArrayLike<number>, b: ArrayLike<number>, c: ArrayLike<number>): Float64Array => {
  const m = (v: ArrayLike<number>) =>
    matrixFromRows([
      [v[0], v[1], v[2]],
      [v[3], v[4], v[5]],
      [v[6], v[7], v[8]],
    ]);
  return multiply(multiply(m(a), m(b)), m(c)).data;
};

/** Affine model: 3 points, least squares on Hartley-normalised coordinates. */
export const affineKernel: MotionKernel = {
  size: 3,
  fit(from, to) {
    const t0 = isoNormalisation(from);
    const t1 = isoNormalisation(to);
    const n = from.length;
    const ata = identity(6, 0);
    const atb = new Float64Array(6);
    const rows: number[][] = [];
    const rhs: number[] = [];
    for (let i = 0; i < n; i++) {
      const px = t0[0] * from[i].x + t0[1] * from[i].y + t0[2];
      const py = t0[3] * from[i].x + t0[4] * from[i].y + t0[5];
      rows.push([px, py, 1, 0, 0, 0], [0, 0, 0, px, py, 1]);
      rhs.push(
        t1[0] * to[i].x + t1[1] * to[i].y + t1[2],
        t1[3] * to[i].x + t1[4] * to[i].y + t1[5],
      );
    }
    const a = matrixFromRows(rows);
    ata.data.set(multiply(a, a, { transposeA: true }).data);
    for (let c = 0; c < 6; c++) {
      let sum = 0;
      for (let r = 0; r < rows.length; r++) sum += rows[r][c] * rhs[r];
      atb[c] = sum;
    }
    let x: Float64Array;
    try {
      x = luSolve(ata, atb);
    } catch {
      // Collinear points: no unique affine map.
      return null;
    }
    const normalised = Float64Array.of(x[0], x[1], x[2], x[3], x[4], x[5], 0, 0, 1);
    const inverseT1 = invert3x3(
      matrixFromRows([
        [t1[0], t1[1], t1[2]],
        [t1[3], t1[4], t1[5]],
        [t1[6], t1[7], t1[8]],
      ]),
    ).data;
    return chain(inverseT1, normalised, t0);
  },
  error(from, to, m, out) {
    for (let i = 0; i < from.length; i++) {
      const p = from[i];
      out[i] =
        (to[i].x - m[0] * p.x - m[1] * p.y - m[2]) ** 2 +
        (to[i].y - m[3] * p.x - m[4] * p.y - m[5]) ** 2;
    }
  },
  checkSubset(from, to, count) {
    return !newestIsCollinear(from, count) && !newestIsCollinear(to, count);
  },
};

/**
 * 3x3 determinant from its 9 entries.
 *
 * @returns The determinant.
 */
const det3 = (
  m11: number,
  m12: number,
  m13: number,
  m21: number,
  m22: number,
  m23: number,
  m31: number,
  m32: number,
  m33: number,
): number =>
  m11 * m22 * m33 -
  m11 * m23 * m32 -
  m21 * m12 * m33 +
  m21 * m13 * m32 +
  m31 * m12 * m23 -
  m31 * m13 * m22;

/** Homography: 4 points, normalised DLT via the smallest eigenvector of LᵀL. */
export const homographyKernel: MotionKernel = {
  size: 4,
  fit(from, to) {
    const n = from.length;
    let cmx = 0;
    let cmy = 0;
    let cMx = 0;
    let cMy = 0;
    for (let i = 0; i < n; i++) {
      cmx += to[i].x;
      cmy += to[i].y;
      cMx += from[i].x;
      cMy += from[i].y;
    }
    cmx /= n;
    cmy /= n;
    cMx /= n;
    cMy /= n;
    let smx = 0;
    let smy = 0;
    let sMx = 0;
    let sMy = 0;
    for (let i = 0; i < n; i++) {
      smx += Math.abs(to[i].x - cmx);
      smy += Math.abs(to[i].y - cmy);
      sMx += Math.abs(from[i].x - cMx);
      sMy += Math.abs(from[i].y - cMy);
    }
    const tiny = 1.192092896e-7;
    if (
      Math.abs(smx) < tiny ||
      Math.abs(smy) < tiny ||
      Math.abs(sMx) < tiny ||
      Math.abs(sMy) < tiny
    ) {
      return null;
    }
    smx = n / smx;
    smy = n / smy;
    sMx = n / sMx;
    sMy = n / sMy;
    const t0 = Float64Array.of(sMx, 0, -cMx * sMx, 0, sMy, -cMy * sMy, 0, 0, 1);
    const t1 = Float64Array.of(1 / smx, 0, cmx, 0, 1 / smy, cmy, 0, 0, 1);

    const L = new Float64Array(81);
    for (let i = 0; i < n; i++) {
      const x = (to[i].x - cmx) * smx;
      const y = (to[i].y - cmy) * smy;
      const X = (from[i].x - cMx) * sMx;
      const Y = (from[i].y - cMy) * sMy;
      L[0] += X * X;
      L[1] += X * Y;
      L[2] += X;
      L[6] += X * -x * X;
      L[7] += X * -x * Y;
      L[8] += X * -x;
      L[10] += Y * Y;
      L[11] += Y;
      L[15] += Y * -x * X;
      L[16] += Y * -x * Y;
      L[17] += Y * -x;
      L[20] += 1;
      L[24] += -x * X;
      L[25] += -x * Y;
      L[26] += -x;
      L[30] += X * X;
      L[31] += X * Y;
      L[32] += X;
      L[33] += X * -y * X;
      L[34] += X * -y * Y;
      L[35] += X * -y;
      L[40] += Y * Y;
      L[41] += Y;
      L[42] += Y * -y * X;
      L[43] += Y * -y * Y;
      L[44] += Y * -y;
      L[50] += 1;
      L[51] += -y * X;
      L[52] += -y * Y;
      L[53] += -y;
      L[60] += -x * X * -x * X + -y * X * -y * X;
      L[61] += -x * X * -x * Y + -y * X * -y * Y;
      L[62] += -x * X * -x + -y * X * -y;
      L[70] += -x * Y * -x * Y + -y * Y * -y * Y;
      L[71] += -x * Y * -x + -y * Y * -y;
      L[80] += -x * -x + -y * -y;
    }
    for (let i = 0; i < 9; i++) for (let j = 0; j < i; j++) L[i * 9 + j] = L[j * 9 + i];
    const matrix = identity(9, 0);
    matrix.data.set(L);
    const { vectors } = eigenSymmetric(matrix);
    const m = chain(t1, vectors.data.subarray(72, 81), t0);
    if (Math.abs(m[8]) < tiny * tiny) return null;
    const scale = 1 / m[8];
    for (let i = 0; i < 8; i++) m[i] *= scale;
    m[8] = 1;
    return m;
  },
  error(from, to, m, out) {
    for (let i = 0; i < from.length; i++) {
      const p = from[i];
      const ww = 1 / (m[6] * p.x + m[7] * p.y + 1);
      const dx = (m[0] * p.x + m[1] * p.y + m[2]) * ww - to[i].x;
      const dy = (m[3] * p.x + m[4] * p.y + m[5]) * ww - to[i].y;
      out[i] = dx * dx + dy * dy;
    }
  },
  checkSubset(from, to, count) {
    if (count !== 4) return true;
    // The four points must keep their orientation (no folding): every
    // triangle of them has the same handedness before and after.
    let negative = 0;
    for (const [a, b, c] of [
      [0, 1, 2],
      [1, 2, 3],
      [0, 2, 3],
      [0, 1, 3],
    ]) {
      const da = det3(from[a].x, from[a].y, 1, from[b].x, from[b].y, 1, from[c].x, from[c].y, 1);
      const db = det3(to[a].x, to[a].y, 1, to[b].x, to[b].y, 1, to[c].x, to[c].y, 1);
      if (da * db < 0) negative++;
    }
    return negative === 0 || negative === 4;
  },
};
