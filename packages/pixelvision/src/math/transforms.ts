import type { Point } from "./transforms.model";

/**
 * Checks a list of corresponding points.
 *
 * @param fn - Name of the calling function.
 * @param from - Source points.
 * @param to - Target points.
 * @param count - Required number of points.
 * @throws {RangeError} When either list has another length or holds non-finite values.
 */
const assertPoints = (fn: string, from: readonly Point[], to: readonly Point[], count: number) => {
  if (from.length !== count || to.length !== count) {
    throw new RangeError(`${fn} needs exactly ${count} points on each side`);
  }
  for (const { x, y } of [...from, ...to]) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new RangeError(`${fn}: points must be finite numbers`);
    }
  }
};

/**
 * Computes the homography mapping the unit square onto four points
 * (Heckbert's closed form).
 *
 * @param p - Four points.
 * @returns The first 8 coefficients (the 9th is 1).
 */
const squareToQuad = (p: readonly Point[]): number[] => {
  const t1 = p[0].x;
  const t2 = p[2].x;
  const t4 = p[1].y;
  const t5 = t1 * t2 * t4;
  const t6 = p[3].y;
  const t7 = t1 * t6;
  const t8 = t2 * t7;
  const t9 = p[2].y;
  const t10 = t1 * t9;
  const t11 = p[1].x;
  const t14 = p[0].y;
  const t15 = p[3].x;
  const t16 = t14 * t15;
  const t18 = t16 * t11;
  const t20 = t15 * t11 * t9;
  const t21 = t15 * t4;
  const t24 = t15 * t9;
  const t25 = t2 * t4;
  const t26 = t6 * t2;
  const t27 = t6 * t11;
  const t28 = t9 * t11;
  const t30 = 1.0 / (t21 - t24 - t25 + t26 - t27 + t28);
  const t32 = t1 * t15;
  const t35 = t14 * t11;
  const t41 = t4 * t1;
  const t42 = t6 * t41;
  const t43 = t14 * t2;
  const t46 = t16 * t9;
  const t48 = t14 * t9 * t11;
  const t51 = t4 * t6 * t2;
  const t55 = t6 * t14;
  return [
    -(t8 - t5 + t10 * t11 - t11 * t7 - t16 * t2 + t18 - t20 + t21 * t2) * t30,
    (t5 - t8 - t32 * t4 + t32 * t9 + t18 - t2 * t35 + t27 * t2 - t20) * t30,
    t1,
    (-t9 * t7 + t42 + t43 * t4 - t16 * t4 + t46 - t48 + t27 * t9 - t51) * t30,
    (-t42 + t41 * t9 - t55 * t2 + t46 - t48 + t55 * t11 + t51 - t21 * t9) * t30,
    t14,
    (-t10 + t41 + t43 - t35 + t24 - t21 - t26 + t27) * t30,
    (-t7 + t10 + t16 - t43 + t27 - t28 - t21 + t25) * t30,
  ];
};

/**
 * Computes the perspective transform (homography) that maps four points
 * onto four others: `to[i] ≈ H · from[i]` in homogeneous coordinates.
 *
 * Pass the result to {@link warpPerspective} to straighten a quadrilateral:
 * since a warp maps output pixels to input pixels, use
 * `perspectiveTransform(outputCorners, photoCorners)`.
 *
 * @param from - Four source points, no three on one line.
 * @param to - Four target points, no three on one line.
 * @returns The 3x3 matrix, row by row, scaled so its bottom-right entry is 1.
 * @throws {RangeError} When a list doesn't have 4 finite points, or the points are degenerate.
 *
 * @example
 * const toPhoto = perspectiveTransform(
 *   [{ x: 0, y: 0 }, { x: 856, y: 0 }, { x: 856, y: 540 }, { x: 0, y: 540 }],
 *   corners, // the card's corners in the photo, same order
 * );
 */
export function perspectiveTransform(from: readonly Point[], to: readonly Point[]): Float64Array {
  assertPoints("perspectiveTransform", from, to, 4);
  const [r0, r1, r2, r3, r4, r5, r6, r7] = squareToQuad(from);
  const [l0, l1, l2, l3, l4, l5, l6, l7] = squareToQuad(to);

  // R = L * inverse(R'), where R' maps the square to `from`.
  const t2 = r4 - r7 * r5;
  const t4 = r0 * r4;
  const t5 = r0 * r5;
  const t7 = r3 * r1;
  const t8 = r2 * r3;
  const t10 = r1 * r6;
  const t12 = r2 * r6;
  const t15 = 1.0 / (t4 - t5 * r7 - t7 + t8 * r7 + t10 * r5 - t12 * r4);
  const t18 = -r3 + r5 * r6;
  const t23 = -r3 * r7 + r4 * r6;
  const t28 = -r1 + r2 * r7;
  const t31 = r0 - t12;
  const t35 = r0 * r7 - t10;
  const t41 = -r1 * r5 + r2 * r4;
  const t44 = t5 - t8;
  const t47 = t4 - t7;
  const t48 = t2 * t15;
  const t49 = t28 * t15;
  const t50 = t41 * t15;
  const matrix = Float64Array.of(
    l0 * t48 + l1 * (t18 * t15) - l2 * (t23 * t15),
    l0 * t49 + l1 * (t31 * t15) - l2 * (t35 * t15),
    -l0 * t50 - l1 * (t44 * t15) + l2 * (t47 * t15),
    l3 * t48 + l4 * (t18 * t15) - l5 * (t23 * t15),
    l3 * t49 + l4 * (t31 * t15) - l5 * (t35 * t15),
    -l3 * t50 - l4 * (t44 * t15) + l5 * (t47 * t15),
    l6 * t48 + l7 * (t18 * t15) - t23 * t15,
    l6 * t49 + l7 * (t31 * t15) - t35 * t15,
    -l6 * t50 - l7 * (t44 * t15) + t47 * t15,
  );
  if (!matrix.every(Number.isFinite) || matrix[8] === 0) {
    throw new RangeError("perspectiveTransform: three or more points lie on one line");
  }
  // Scale so the bottom-right entry is 1, as OpenCV does.
  const scale = 1 / matrix[8];
  for (let i = 0; i < 9; i++) matrix[i] *= scale;
  matrix[8] = 1;
  return matrix;
}

/**
 * Computes the affine transform (rotation, scale, shear and translation)
 * that maps three points onto three others: `to[i] = A · from[i]`.
 *
 * A direct solve of the 6 unknowns.
 *
 * @param from - Three source points, not on one line.
 * @param to - Three target points.
 * @returns A 3x3 matrix, row by row, with last row `[0, 0, 1]`.
 * @throws {RangeError} When a list doesn't have 3 finite points, or the source points are collinear.
 *
 * @example
 * const transform = affineTransform(
 *   [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
 *   [{ x: 10, y: 10 }, { x: 12, y: 10 }, { x: 10, y: 12 }],
 * ); // scale 2, then move by (10, 10)
 */
export function affineTransform(from: readonly Point[], to: readonly Point[]): Float64Array {
  assertPoints("affineTransform", from, to, 3);
  const [a, b, c] = from;
  const det = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
  if (det === 0) throw new RangeError("affineTransform: the source points lie on one line");
  // Solve per output coordinate: [x y 1] · [m0 m1 m2]ᵀ = target.
  const solve = (ta: number, tb: number, tc: number) => {
    const m0 = ((tb - ta) * (c.y - a.y) - (tc - ta) * (b.y - a.y)) / det;
    const m1 = ((tc - ta) * (b.x - a.x) - (tb - ta) * (c.x - a.x)) / det;
    return [m0, m1, ta - m0 * a.x - m1 * a.y];
  };
  return Float64Array.of(
    ...solve(to[0].x, to[1].x, to[2].x),
    ...solve(to[0].y, to[1].y, to[2].y),
    0,
    0,
    1,
  );
}

/**
 * Applies a 3x3 transform to a point.
 *
 * @param transform - 3x3 matrix, row by row.
 * @param point - The point.
 * @returns The transformed point (divided by the projective term).
 *
 * @example
 * transformPoint(perspectiveTransform(from, to), from[0]); // ≈ to[0]
 */
export function transformPoint(transform: ArrayLike<number>, point: Point): Point {
  const { x, y } = point;
  const w = transform[6] * x + transform[7] * y + transform[8];
  return {
    x: (transform[0] * x + transform[1] * y + transform[2]) / w,
    y: (transform[3] * x + transform[4] * y + transform[5]) / w,
  };
}
