import jsfeat from "jsfeat";
import type { JsfeatMatrix } from "jsfeat";
import {
  choleskySolve,
  determinant3x3,
  eigenSymmetric,
  invert3x3,
  luSolve,
  matrixFromRows,
  median,
  multiply,
  perspectiveTransform,
  pseudoInverse,
  svd,
  svdSolve,
  transpose,
} from "pixelvision";
import type { Matrix, Point } from "pixelvision";
import { describe, expect, it } from "vitest";
import { expectClose, expectIdentical, jsfeatMatrix, seededRandom, toJsfeat } from "../src";

const random = seededRandom(42);

/** A random `rows x columns` f64 matrix with values in [-5, 5). */
const randomMatrix = (rows: number, columns: number): Matrix<"f64"> =>
  matrixFromRows(
    Array.from({ length: rows }, () => Array.from({ length: columns }, () => random() * 10 - 5)),
  );

/** A random symmetric positive-definite matrix (Aᵀ·A + n·I). */
const randomSpd = (n: number): Matrix<"f64"> => {
  const product = multiply(randomMatrix(n, n), randomMatrix(n, n), { transposeA: true });
  const spd = multiply(product, product, { transposeA: true });
  for (let i = 0; i < n; i++) spd.data[i * n + i] += n;
  return spd;
};

const f64 = (width: number, height: number): JsfeatMatrix => jsfeatMatrix(width, height, "f64");

const shapes: Array<[number, number]> = [
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 2],
  [2, 5],
  [6, 6],
];

describe("matrix math matches jsfeat.matmath", () => {
  for (const [rows, columns] of shapes) {
    it(`${rows}x${columns}`, () => {
      const a = randomMatrix(rows, columns);
      const b = randomMatrix(columns, rows);
      const sameShape = randomMatrix(rows, columns);
      const length = (r: number, c: number) => r * c;

      const t = f64(rows, columns);
      jsfeat.matmath.transpose(t, toJsfeat(a));
      expectIdentical(transpose(a).data, t.data, length(rows, columns));

      const ab = f64(rows, rows);
      jsfeat.matmath.multiply(ab, toJsfeat(a), toJsfeat(b));
      expectIdentical(multiply(a, b).data, ab.data, length(rows, rows));

      const abt = f64(rows, rows);
      jsfeat.matmath.multiply_ABt(abt, toJsfeat(a), toJsfeat(sameShape));
      expectIdentical(
        multiply(a, sameShape, { transposeB: true }).data,
        abt.data,
        length(rows, rows),
      );

      const atb = f64(columns, columns);
      jsfeat.matmath.multiply_AtB(atb, toJsfeat(a), toJsfeat(sameShape));
      expectIdentical(
        multiply(a, sameShape, { transposeA: true }).data,
        atb.data,
        length(columns, columns),
      );

      const aat = f64(rows, rows);
      jsfeat.matmath.multiply_AAt(aat, toJsfeat(a));
      expectIdentical(multiply(a, a, { transposeB: true }).data, aat.data, length(rows, rows));

      const ata = f64(columns, columns);
      jsfeat.matmath.multiply_AtA(ata, toJsfeat(a));
      expectIdentical(
        multiply(a, a, { transposeA: true }).data,
        ata.data,
        length(columns, columns),
      );
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`3x3 inverse and determinant #${i}`, () => {
      const m = randomMatrix(3, 3);
      const inverse = f64(3, 3);
      jsfeat.matmath.invert_3x3(toJsfeat(m), inverse);

      expectIdentical(invert3x3(m).data, inverse.data, 9);
      expect(determinant3x3(m)).toBe(jsfeat.matmath.mat3x3_determinant(toJsfeat(m)));
    });
  }
});

describe("solvers match jsfeat.linalg", () => {
  for (const n of [1, 2, 3, 5, 8]) {
    it(`lu_solve and cholesky_solve, ${n}x${n}`, () => {
      const a = randomMatrix(n, n);
      const spd = randomSpd(n);
      const b = Array.from({ length: n }, () => random() * 10 - 5);

      const luA = toJsfeat(a);
      const luB = f64(1, n);
      luB.data.set(b);
      jsfeat.linalg.lu_solve(luA, luB);
      expectIdentical(luSolve(a, b), luB.data, n);

      const chA = toJsfeat(spd);
      const chB = f64(1, n);
      chB.data.set(b);
      jsfeat.linalg.cholesky_solve(chA, chB);
      expectIdentical(choleskySolve(spd, b), chB.data, n);
    });
  }
});

describe("svd matches jsfeat.linalg.svd_decompose", () => {
  for (const [rows, columns] of shapes) {
    it(`${rows}x${columns}`, () => {
      const a = randomMatrix(rows, columns);
      const rank = Math.min(rows, columns);
      const w = f64(1, columns);
      const u = f64(rows, rows);
      const v = f64(columns, columns);
      jsfeat.linalg.svd_decompose(toJsfeat(a), w, u, v);

      const result = svd(a);

      // pixelvision iterates to double precision; jsfeat stopped at single
      // precision, so results agree to about 1e-7.
      expectClose(result.values, w.data, rank, 1e-6);
      // Singular vectors for non-zero singular values agree. The
      // completion of U beyond the rank is an arbitrary orthonormal basis:
      // pixelvision uses a 32-bit generator where jsfeat's overflowed.
      const columnsOf = (m: { data: ArrayLike<number> }, size: number, count: number) =>
        Array.from(
          { length: size * count },
          (_, i) => m.data[Math.floor(i / count) * size + (i % count)],
        );
      expectClose(columnsOf(result.u, rows, rank), columnsOf(u, rows, rank), rows * rank, 1e-6);
      expectClose(
        columnsOf(result.v, columns, rank),
        columnsOf(v, columns, rank),
        columns * rank,
        1e-6,
      );
    });
  }

  it("square svd_solve and svd_invert", () => {
    const a = randomMatrix(4, 4);
    const b = [1, -2, 3, 0.5];
    const x = f64(1, 4);
    const bj = f64(1, 4);
    bj.data.set(b);
    jsfeat.linalg.svd_solve(toJsfeat(a), x, bj);
    const inverse = f64(4, 4);
    jsfeat.linalg.svd_invert(inverse, toJsfeat(a));

    expectClose(svdSolve(a, b), x.data, 4, 1e-6);
    expectClose(pseudoInverse(a).data, inverse.data, 16, 1e-6);
  });
});

describe("eigenSymmetric matches jsfeat.linalg.eigenVV", () => {
  for (const n of [1, 2, 3, 6]) {
    it(`${n}x${n}`, () => {
      const a = randomSpd(n);
      const vectors = f64(n, n);
      const values = f64(1, n);
      jsfeat.linalg.eigenVV(toJsfeat(a), vectors, values);

      const result = eigenSymmetric(a);

      // Double-precision stopping tolerance; jsfeat's was single precision.
      expectClose(result.values, values.data, n, 1e-6);
      expectClose(result.vectors.data, vectors.data, n * n, 1e-6);
    });
  }
});

describe("perspectiveTransform matches jsfeat.math.perspective_4point_transform", () => {
  for (let i = 0; i < 8; i++) {
    it(`random quadrilaterals #${i}`, () => {
      const quad = (): Point[] => [
        { x: random() * 20, y: random() * 20 },
        { x: 80 + random() * 20, y: random() * 20 },
        { x: 80 + random() * 20, y: 80 + random() * 20 },
        { x: random() * 20, y: 80 + random() * 20 },
      ];
      const from = quad();
      const to = quad();
      const model = f64(3, 3);
      jsfeat.math.perspective_4point_transform(
        model,
        ...from.flatMap((p, k) => [p.x, p.y, to[k].x, to[k].y]),
      );

      // pixelvision scales the result so the last entry is 1, as OpenCV does.
      const scaled = Array.from(model.data, (v) => v / model.data[8]);
      expectClose(perspectiveTransform(from, to), scaled, 9, 1e-12);
    });
  }
});

describe("median matches jsfeat.math.median", () => {
  for (const n of [1, 2, 3, 4, 7, 10, 31, 100]) {
    it(`${n} values`, () => {
      const values = Array.from({ length: n }, () => Math.floor(random() * 50));
      const sorted = [...values].sort((x, y) => x - y);
      const lower = jsfeat.math.median([...values], 0, n - 1);

      expect(lower).toBe(sorted[(n - 1) >> 1]);
      const expected = n % 2 ? lower : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      expect(median(values)).toBe(expected);
    });
  }
});
